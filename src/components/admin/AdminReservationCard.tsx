import { Calendar, Clock, Eye, MapPin, User } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import type { AdminReservation } from "../../hooks/useAdminReservations";
import StatusBadge from "./StatusBadge";

interface AdminReservationCardProps {
  reservation: AdminReservation;
  onView?: (reservation: AdminReservation) => void;
  onCancel?: (reservation: AdminReservation) => void;
  updating?: boolean;
}

export default function AdminReservationCard({
  reservation,
  onView,
  onCancel,
  updating = false,
}: AdminReservationCardProps) {
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div>
          <div className="mt-1 flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {reservation.courtName}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {reservation.userDisplayName}
          </div>
        </div>
        <StatusBadge status={reservation.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {reservation.date}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {reservation.startTime} - {reservation.endTime}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            {reservation.userEmail || reservation.userDisplayName}
          </div>
          <div className="text-right text-base font-semibold text-foreground">
            ${reservation.totalPrice.toLocaleString("es-CO")}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => onView?.(reservation)}>
            <Eye className="mr-1 h-4 w-4" />
            Ver detalle
          </Button>
          {reservation.status !== "cancelada" && reservation.status !== "expirada" && (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              onClick={() => onCancel?.(reservation)}
              disabled={updating}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
