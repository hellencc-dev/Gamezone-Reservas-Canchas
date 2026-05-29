import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

export type ReservationStatusType = 
  | "confirmed" 
  | "temporary" 
  | "pending" 
  | "cancelled" 
  | "expired" 
  | "available" 
  | "busy" 
  | "closed";

export function StatusBadge({
  status,
  className,
}: {
  status: ReservationStatusType | string; // Permitimos string para que no choque si Firebase trae un texto libre
  className?: string;
}) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "bg-success-soft text-success border-success/20" },
    available: { label: "Available", cls: "bg-success-soft text-success border-success/20" },
    temporary: { label: "Temporary", cls: "bg-warning-soft text-warning border-warning/30" },
    pending: { label: "Pending payment", cls: "bg-warning-soft text-warning border-warning/30" },
    busy: { label: "Occupied", cls: "bg-danger-soft text-danger border-danger/20" },
    cancelled: { label: "Cancelled", cls: "bg-danger-soft text-danger border-danger/20" },
    expired: { label: "Expired", cls: "bg-neutral-soft text-muted-foreground border-border" },
    closed: { label: "Closed", cls: "bg-neutral-soft text-muted-foreground border-border" },
  };

  // Fallback seguro: si por alguna razón llega un estado raro, usamos 'pending' por defecto para que no se rompa la app
  const s = map[status] || map["pending"];

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium px-2.5 py-0.5 border inline-flex items-center",
        s.cls,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 mr-1.5">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
      </span>
      {s.label}
    </Badge>
  );
}