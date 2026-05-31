import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import {
  normalizeReservationStatus,
  type ReservationStatusType,
} from "../status-badge";

const STATUS_LABELS: Record<string, string> = {
  temporal: "Temporal",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  expirada: "Expirada",
};

const STATUS_STYLES: Record<string, string> = {
  temporal: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50",
  confirmada: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  cancelada: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50",
  expirada: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
};

interface StatusBadgeProps {
  status: ReservationStatusType | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const safeStatus = normalizeReservationStatus(status);
  const label = STATUS_LABELS[safeStatus] ?? safeStatus;
  const styles =
    STATUS_STYLES[safeStatus] ??
    "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold leading-none tracking-wide capitalize shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        styles,
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
