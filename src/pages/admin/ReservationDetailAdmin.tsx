import type { ElementType, ReactNode } from "react";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  Tag,
  Users,
  User,
  XCircle,
} from "lucide-react";

import { db } from "../../firebase/config";
import type { AdminReservation } from "../../hooks/useAdminReservations";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import StatusBadge from "../../components/admin/StatusBadge";

interface ReservationDetailAdminProps {
  reservation: AdminReservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function ReservationDetailAdmin({
  reservation,
  open,
  onOpenChange,
}: ReservationDetailAdminProps) {
  const [updating, setUpdating] = useState(false);
  const { createNotification } = useNotifications();

  if (!reservation) {
    return null;
  }

  const cancelReservation = async () => {
    setUpdating(true);

    try {
      await updateDoc(doc(db, "reservations", reservation.id), { status: "cancelada" });
      await createNotification({
        userId: reservation.userId,
        title: "Reserva cancelada",
        message: "Tu reserva fue cancelada por el administrador.",
        type: "reservation_cancelled",
        reservationId: reservation.id,
        courtId: reservation.courtId,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar reserva:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <DialogTitle className="text-xl">Detalle de reserva</DialogTitle>
            <StatusBadge status={reservation.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <Section title="Informacion de la reserva">
            <Row icon={Calendar} label="Fecha" value={reservation.date} />
            <Row icon={Clock} label="Hora inicio" value={reservation.startTime} />
            <Row icon={Clock} label="Hora fin" value={reservation.endTime} />
            <Row
              icon={Tag}
              label="Precio"
              value={`$${reservation.totalPrice.toLocaleString("es-CO")}`}
            />
            <Row icon={Users} label="Jugadores" value={reservation.playersCount} />
            <Row icon={FileText} label="Duracion" value={`${reservation.duration} minutos`} />
          </Section>

          <Separator />

          <Section title="Usuarios y cancha">
            <Row icon={MapPin} label="Cancha" value={reservation.courtName} />
            <Row icon={User} label="Usuario" value={reservation.userDisplayName} />
            {reservation.userEmail && (
              <Row icon={User} label="Email" value={reservation.userEmail} />
            )}
          </Section>

          <Separator />

          <Section title="Notas">
            <Row icon={FileText} label="Notas" value={reservation.notes || "Sin notas"} />
          </Section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>
            Cerrar
          </Button>
          {reservation.status !== "cancelada" && reservation.status !== "expirada" && (
            <Button
              variant="destructive"
              onClick={cancelReservation}
              disabled={updating}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Cancelar reserva
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
