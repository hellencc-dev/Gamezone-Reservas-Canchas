import { useMemo, useState } from "react";
import { CalendarDays, LayoutGrid, List, Search } from "lucide-react";

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
import ReservationDetailAdmin from "./ReservationDetailAdmin";

const STATUSES: ReservationStatus[] = ["pending", "confirmed", "cancelled", "completed"];

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function AdminCalendar() {
  const { reservations, loadingReservations } = useAdminReservations();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<AdminReservation | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reservation.id.toLowerCase().includes(query) ||
        reservation.courtId.toLowerCase().includes(query) ||
        reservation.userId.toLowerCase().includes(query);
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
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            <List className="mr-1 h-4 w-4" />
            Tabla
          </Button>
          <Button
            variant={view === "cards" ? "default" : "outline"}
            size="sm"
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
              className="pl-9"
            />
          </div>
          <div className="md:col-span-3">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
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
            <Button variant="ghost" className="w-full" onClick={resetFilters}>
              Reset
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
                            <div className="font-medium">{reservation.courtId}</div>
                            <div className="text-xs text-muted-foreground">{reservation.id}</div>
                          </TableCell>
                          <TableCell>{reservation.userId}</TableCell>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetail(reservation)}
                            >
                              Ver detalle
                            </Button>
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
