import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

export type ReservationStatusType =
  | "temporal"
  | "confirmada"
  | "cancelada"
  | "expirada"
  | "temporary"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "available"
  | "busy"
  | "closed";

export function normalizeReservationStatus(status: string) {
  const map: Record<string, string> = {
    temporary: "temporal",
    pending: "temporal",
    confirmed: "confirmada",
    cancelled: "cancelada",
    expired: "expirada",
  };

  return map[status] || status;
}

export function StatusBadge({
  status,
  className,
}: {
  status: ReservationStatusType | string;
  className?: string;
}) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmada: {
      label: "Confirmada",
      cls: "bg-success-soft text-success border-success/20",
    },
    available: {
      label: "Disponible",
      cls: "bg-success-soft text-success border-success/20",
    },
    temporal: {
      label: "Temporal",
      cls: "bg-warning-soft text-warning border-warning/30",
    },
    busy: {
      label: "Ocupado",
      cls: "bg-danger-soft text-danger border-danger/20",
    },
    cancelada: {
      label: "Cancelada",
      cls: "bg-danger-soft text-danger border-danger/20",
    },
    expirada: {
      label: "Expirada",
      cls: "bg-neutral-soft text-muted-foreground border-border",
    },
    closed: {
      label: "Cerrada",
      cls: "bg-neutral-soft text-muted-foreground border-border",
    },
  };

  const normalizedStatus = normalizeReservationStatus(status);
  const s = map[normalizedStatus] || {
    label: normalizedStatus || "Pendiente",
    cls: "bg-warning-soft text-warning border-warning/30",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium px-2.5 py-0.5 border inline-flex items-center",
        s.cls,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 mr-1.5">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
      </span>
      {s.label}
    </Badge>
  );
}
