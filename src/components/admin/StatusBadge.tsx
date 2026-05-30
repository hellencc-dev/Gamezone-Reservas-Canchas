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
  temporal: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  confirmada: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  cancelada: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100",
  expirada: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100",
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
    <Badge variant="outline" className={cn("font-medium capitalize", styles, className)}>
      {label}
    </Badge>
  );
}
