import { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { CalendarDays, LayoutGrid, List, Search } from "lucide-react";

import { db } from "../../firebase/config";
import AdminReservationCard from "../../components/admin/AdminReservationCard";
import StatusBadge from "../../components/admin/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type AdminReservation,
  type ReservationStatus,
  useAdminReservations,
} from "../../hooks/useAdminReservations";
import { useNotifications } from "../../hooks/useNotifications";
import ReservationDetailAdmin from "./ReservationDetailAdmin";

const STATUSES: ReservationStatus[] = ["temporal", "confirmada", "cancelada", "expirada"];

const STATUS_LABELS: Record<ReservationStatus, string> = {
  temporal: "Temporal",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  expirada: "Expirada",
};

export default function AdminCalendar() {
  const { reservations, loadingReservations } = useAdminReservations();
  const { createNotification } = useNotifications();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<AdminReservation | null>(null);
  const [open, setOpen] = useState(false);
  const [updatingReservationId, setUpdatingReservationId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reservation.id.toLowerCase().includes(query) ||
        reservation.courtId.toLowerCase().includes(query) ||
        reservation.courtName.toLowerCase().includes(query) ||
        reservation.userId.toLowerCase().includes(query) ||
        reservation.userDisplayName.toLowerCase().includes(query) ||
        reservation.userEmail.toLowerCase().includes(query);
      const matchesDate = !date || reservation.date === date;
      const matchesStatus = status === "all" || reservation.status === status;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [date, reservations, search, status]);

  const groupedReservations = useMemo(() => {
    return filtered.reduce<Record<string, AdminReservation[]>>((groups, reservation) => {
      if (!groups[reservation.date]) {
        groups[reservation.date] = [];
      }

      groups[reservation.date].push(reservation);
      return groups;
    }, {});
  }, [filtered]);

  const groupedDates = Object.keys(groupedReservations).sort();

  const openDetail = (reservation: AdminReservation) => {
    setSelected(reservation);
    setOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
    setDate("");
    setStatus("all");
  };
  const cancelReservation = async (reservation: AdminReservation) => {
    setUpdatingReservationId(reservation.id);

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
    } catch (error) {
      console.error("Error al actualizar reserva:", error);
    } finally {
      setUpdatingReservationId(null);
    }
  };

  const getViewButtonClass = (active: boolean) =>
    active
      ? "rounded-xl border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white"
      : "rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza y gestiona todas las reservas del sistema en tiempo real.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={getViewButtonClass(view === "table")}
            style={{ borderRadius: "0.75rem" }}
            onClick={() => setView("table")}
          >
            <List className="mr-1 h-4 w-4" />
            Tabla
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={getViewButtonClass(view === "cards")}
            style={{ borderRadius: "0.75rem" }}
            onClick={() => setView("cards")}
          >
            <LayoutGrid className="mr-1 h-4 w-4" />
            Tarjetas
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por reserva, cancha o usuario..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-xl pl-9"
            />
          </div>
          <div className="md:col-span-3">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="md:col-span-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Button variant="outline" className="w-full rounded-xl" onClick={resetFilters}>
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {loadingReservations ? (
        <Card className="py-12 text-center text-muted-foreground">
          Cargando reservas...
        </Card>
      ) : reservations.length === 0 ? (
        <Card className="py-12 text-center text-muted-foreground">
          No existen reservas registradas.
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-muted-foreground">
          No hay reservas que coincidan con los filtros.
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{filtered.length}</span> de{" "}
            {reservations.length} reservas
          </div>

          {groupedDates.map((groupDate) => (
            <section key={groupDate} className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{groupDate}</h2>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {groupedReservations[groupDate].length} reservas
                </span>
              </div>

              {view === "table" ? (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cancha</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedReservations[groupDate].map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <div className="font-medium">{reservation.courtName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{reservation.userDisplayName}</div>
                            {reservation.userEmail && (
                              <div className="text-xs text-muted-foreground">
                                {reservation.userEmail}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {reservation.startTime} - {reservation.endTime}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={reservation.status} />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${reservation.totalPrice.toLocaleString("es-CO")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => openDetail(reservation)}
                              >
                                Ver detalle
                              </Button>
                              {reservation.status !== "cancelada" && reservation.status !== "expirada" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() => cancelReservation(reservation)}
                                  disabled={updatingReservationId === reservation.id}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {groupedReservations[groupDate].map((reservation) => (
                    <AdminReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onView={openDetail}
                      onCancel={cancelReservation}
                      updating={updatingReservationId === reservation.id}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <ReservationDetailAdmin
        reservation={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
