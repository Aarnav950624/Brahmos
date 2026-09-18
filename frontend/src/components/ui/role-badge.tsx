import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/stores/authStore";
import { User, Activity, Stethoscope, Pill, Shield } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  let label = "";
  let Icon = User;
  let colorClass = "";

  switch (role) {
    case "CITIZEN":
      label = "Citizen";
      Icon = User;
      colorClass = "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      break;
    case "ASHA_WORKER":
      label = "ASHA / ANM";
      Icon = Activity;
      colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
      break;
    case "DOCTOR":
      label = "Doctor";
      Icon = Stethoscope;
      colorClass = "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
      break;
    case "PHARMACY":
      label = "Pharmacy / Lab";
      Icon = Pill;
      colorClass = "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
      break;
    case "PANCHAYAT_ADMIN":
      label = "Panchayat Admin";
      Icon = Shield;
      colorClass = "bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300";
      break;
  }

  return (
    <Badge variant="outline" className={`flex items-center gap-1 font-medium ${colorClass} ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
