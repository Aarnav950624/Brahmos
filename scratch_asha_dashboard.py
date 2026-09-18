import os

dashboard_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/asha/page.tsx'

with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add OfflineStatus and Database imports
if 'OfflineStatus' not in content:
    content = content.replace('import { Badge } from "@/components/ui/badge";', 'import { Badge } from "@/components/ui/badge";\nimport { OfflineStatus } from "@/components/offline-status";\nimport { useSyncStore } from "@/stores/syncStore";')
    content = content.replace('import { MapPin, Users, AlertTriangle, ChevronRight, Activity, Calendar, Shield } from "lucide-react";', 'import { MapPin, Users, AlertTriangle, ChevronRight, Activity, Calendar, Shield, Database } from "lucide-react";')

    # Insert useSyncStore inside component
    content = content.replace('const { t, language } = useTranslation();', 'const { t, language } = useTranslation();\n  const { queue } = useSyncStore();\n  const pendingSync = queue.filter(q => q.status === "PENDING").length;')

    # Insert OfflineStatus next to the greeting
    content = content.replace('<h1 className="text-2xl font-bold text-slate-800">', '<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">\n        <h1 className="text-2xl font-bold text-slate-800">')
    content = content.replace('Namaste, Asha Devi!</h1>', 'Namaste, Asha Devi!</h1>\n        <OfflineStatus />\n      </div>')

    # Add the offline card in the Quick Actions section
    quick_action_target = '{ label: t("asha.dashboard.quickActions.newVisit"), icon: Activity, color: "bg-blue-100 text-blue-700", href: "/asha/households/h1/visit/new" },'
    quick_action_replacement = '{ label: t("asha.dashboard.quickActions.newVisit"), icon: Activity, color: "bg-blue-100 text-blue-700", href: "/asha/households/h1/visit/new" },\n            { label: pendingSync > 0 ? `${pendingSync} Pending Sync` : "Sync Center", icon: Database, color: pendingSync > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-cyan-100 text-cyan-700", href: "/asha/sync" },'
    content = content.replace(quick_action_target, quick_action_replacement)

    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated ASHA Dashboard")
