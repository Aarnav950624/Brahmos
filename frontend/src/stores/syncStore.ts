import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';

export interface SyncItem {
  id: string;
  entityType: string;
  operation: string;
  payload: any;
  createdAt: string;
  status: SyncStatus;
  retryCount: number;
  errorMessage?: string;
  householdName?: string;
}

interface SyncStore {
  isDemoOffline: boolean;
  queue: SyncItem[];
  setDemoOffline: (val: boolean) => void;
  addToQueue: (item: Omit<SyncItem, 'id' | 'createdAt' | 'status' | 'retryCount'>) => void;
  updateStatus: (id: string, status: SyncStatus, errorMessage?: string) => void;
  clearSynced: () => void;
  syncQueue: (userId: string) => Promise<void>;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      isDemoOffline: false,
      queue: [],
      setDemoOffline: (val) => set({ isDemoOffline: val }),
      addToQueue: (item) => {
        const newItem: SyncItem = {
          ...item,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          status: 'PENDING',
          retryCount: 0,
        };
        set((state) => ({ queue: [...state.queue, newItem] }));
      },
      updateStatus: (id, status, errorMessage) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, status, errorMessage } : item
          ),
        }));
      },
      clearSynced: () => {
        set((state) => ({
          queue: state.queue.filter((item) => item.status !== 'SYNCED'),
        }));
      },
      syncQueue: async (userId) => {
        const { queue, isDemoOffline } = get();
        
        if (isDemoOffline || !navigator.onLine) {
          return; // Don't try to sync if offline or demo mode
        }

        const pendingItems = queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');
        if (pendingItems.length === 0) return;

        try {
          const res = await fetch("http://localhost:8000/api/v1/asha/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              items: pendingItems.map(item => ({
                client_id: item.id,
                entity_type: item.entityType,
                operation: item.operation,
                payload: item.payload
              }))
            })
          });

          if (!res.ok) throw new Error("Server error");
          
          const data = await res.json();
          
          // Update status based on server response
          set((state) => {
            let newQueue = [...state.queue];
            data.results.forEach((result: any) => {
              const index = newQueue.findIndex(q => q.id === result.client_id);
              if (index !== -1) {
                newQueue[index] = {
                  ...newQueue[index],
                  status: result.status,
                  errorMessage: result.message,
                  retryCount: result.status === 'FAILED' ? newQueue[index].retryCount + 1 : newQueue[index].retryCount
                };
              }
            });
            return { queue: newQueue };
          });
          
        } catch (error) {
          console.error("Sync failed", error);
          // Mark all pending as failed
          set((state) => ({
            queue: state.queue.map(item => 
              (item.status === 'PENDING' || item.status === 'FAILED') 
                ? { ...item, status: 'FAILED', retryCount: item.retryCount + 1, errorMessage: "Network error" }
                : item
            )
          }));
        }
      }
    }),
    {
      name: 'asha-offline-store',
    }
  )
);
