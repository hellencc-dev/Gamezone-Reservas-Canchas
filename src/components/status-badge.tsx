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
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_1px_0_rgba(16,185,129,0.08)]",
    },
    available: {
      label: "Disponible",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_1px_0_rgba(16,185,129,0.08)]",
    },
    temporal: {
      label: "Temporal",
      cls: "bg-orange-50 text-orange-700 border-orange-200 shadow-[0_1px_0_rgba(255,107,0,0.08)]",
    },
    busy: {
      label: "Ocupado",
      cls: "bg-rose-50 text-rose-700 border-rose-200 shadow-[0_1px_0_rgba(239,68,68,0.08)]",
    },
    cancelada: {
      label: "Cancelada",
      cls: "bg-rose-50 text-rose-700 border-rose-200 shadow-[0_1px_0_rgba(239,68,68,0.08)]",
    },
    expirada: {
      label: "Expirada",
      cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
    closed: {
      label: "Cerrada",
      cls: "bg-slate-100 text-slate-600 border-slate-200",
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
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold leading-none tracking-wide",
        s.cls,
        className
      )}
    >
      <span className="relative mr-1.5 flex h-1.5 w-1.5">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {s.label}
    </Badge>
  );
}
