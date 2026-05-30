import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type { ReservationStatus } from "../../hooks/useAdminReservations";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100",
  completed: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100",
};

interface StatusBadgeProps {
  status: ReservationStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const safeStatus = status as ReservationStatus;
  const label = STATUS_LABELS[safeStatus] ?? status;
  const styles =
    STATUS_STYLES[safeStatus] ??
    "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100";

  return (
    <Badge variant="outline" className={cn("font-medium capitalize", styles, className)}>
      {label}
    </Badge>
  );
}
