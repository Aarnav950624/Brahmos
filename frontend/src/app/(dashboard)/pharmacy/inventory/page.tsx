"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PharmacyInventory() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/pharmacy/inventory").then(r => r.json()).then(setItems).catch(() => {});
  }, []);

  const restock = async (id: string) => {
    await fetch(`http://localhost:8000/api/v1/pharmacy/inventory/${id}/restock`, { method: "POST" });
    fetch("http://localhost:8000/api/v1/pharmacy/inventory").then(r => r.json()).then(setItems).catch(() => {});
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
      {items.length === 0 ? <p>No inventory items.</p> : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
              <div>
                <p className="font-bold">{item.medicine_name}</p>
                <p className="text-sm">Available: {item.available_quantity} {item.unit}</p>
                <Badge variant={item.status === "IN_STOCK" ? "default" : item.status === "OUT_OF_STOCK" ? "destructive" : "secondary"}>
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
              {(item.status === "OUT_OF_STOCK" || item.status === "LOW_STOCK") && (
                <Button onClick={() => restock(item.id)}>Restock</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
