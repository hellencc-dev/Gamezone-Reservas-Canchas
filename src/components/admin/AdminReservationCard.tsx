import { Calendar, Clock, Eye, MapPin, Tag } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import type { AdminReservation } from "../../hooks/useAdminReservations";
import StatusBadge from "./StatusBadge";

interface AdminReservationCardProps {
  reservation: AdminReservation;
  onView?: (reservation: AdminReservation) => void;
}

export default function AdminReservationCard({
  reservation,
  onView,
}: AdminReservationCardProps) {
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div>
          <div className="text-xs text-muted-foreground">{reservation.id}</div>
          <div className="mt-1 flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Cancha {reservation.courtId}
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
            <Tag className="h-4 w-4" />
            {reservation.courtId}
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
        </div>
      </CardContent>
    </Card>
  );
}
