import { type FormEvent, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import AvailabilityForm, { DAYS } from "../../components/admin/AvailabilityForm";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  type Availability,
  type AvailabilityInput,
  type SpecialDate,
  type SpecialDateInput,
  useAvailability,
} from "../../hooks/useAvailability";
import { useCourts } from "../../hooks/useCourts";

export default function ManageAvailability() {
  const { courts, loading: loadingCourts } = useCourts();
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [specialDate, setSpecialDate] = useState("");
  const [specialAvailable, setSpecialAvailable] = useState(false);
  const [specialNote, setSpecialNote] = useState("");
  const [specialStartTime, setSpecialStartTime] = useState("08:00");
  const [specialEndTime, setSpecialEndTime] = useState("22:00");
  const [usualStartTime, setUsualStartTime] = useState("08:00");
  const [usualEndTime, setUsualEndTime] = useState("22:00");
  const [applyingUsualHours, setApplyingUsualHours] = useState(false);

  const activeCourtId = selectedCourtId || courts[0]?.id || "";
  const selectedCourt = courts.find((court) => court.id === activeCourtId);
  const {
    availability,
    specialDates,
    loadingAvailability,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    createSpecialDate,
    deleteSpecialDate,
  } = useAvailability(activeCourtId);

  const loading = loadingCourts || loadingAvailability;
  const openDays = new Set(availability.filter((item) => item.active).map((item) => item.dayOfWeek))
    .size;
  const activeSlots = availability.filter((item) => item.active).length;
  const closures = specialDates.filter((item) => !item.available).length;

  const groupedAvailability = useMemo(() => {
    return availability.reduce<Record<number, Availability[]>>((groups, item) => {
      if (!groups[item.dayOfWeek]) {
        groups[item.dayOfWeek] = [];
      }

      groups[item.dayOfWeek].push(item);
      return groups;
    }, {});
  }, [availability]);

  const handleSubmit = async (values: AvailabilityInput) => {
    if (editingAvailability) {
      await updateAvailability(editingAvailability.id, values);
    } else {
      await createAvailability(values);
    }

    setEditingAvailability(null);
    setFormOpen(false);
  };

  const handleApplyUsualHours = async () => {
    if (!activeCourtId || !usualStartTime || !usualEndTime || usualEndTime <= usualStartTime) {
      return;
    }

    setApplyingUsualHours(true);
    try {
      await Promise.all(
        DAYS.map((day) => {
          const existing = availability.find((item) => item.dayOfWeek === day.value);
          const payload: AvailabilityInput = {
            courtId: activeCourtId,
            dayOfWeek: day.value,
            startTime: usualStartTime,
            endTime: usualEndTime,
            active: true,
          };

          return existing
            ? updateAvailability(existing.id, payload)
            : createAvailability(payload);
        })
      );
    } finally {
      setApplyingUsualHours(false);
    }
  };

  const openCreate = () => {
    setEditingAvailability(null);
    setFormOpen(true);
  };

  const openEdit = (item: Availability) => {
    setEditingAvailability(item);
    setFormOpen(true);
  };

  const handleSpecialDateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeCourtId || !specialDate) {
      return;
    }

    const payload: SpecialDateInput = {
      courtId: activeCourtId,
      date: specialDate,
      available: specialAvailable,
      note: specialNote.trim(),
      startTime: specialAvailable ? specialStartTime : undefined,
      endTime: specialAvailable ? specialEndTime : undefined,
    };

    await createSpecialDate(payload);
    setSpecialDate("");
    setSpecialAvailable(false);
    setSpecialNote("");
    setSpecialStartTime("08:00");
    setSpecialEndTime("22:00");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestionar disponibilidad</h1>
          <p className="text-sm text-muted-foreground">
            Configura horarios recurrentes y fechas especiales por cancha.
          </p>
        </div>
        <Button className="rounded-xl" onClick={openCreate} disabled={!activeCourtId}>
          <Plus className="h-4 w-4" />
          Agregar horario
        </Button>
      </div>

      <Card className="border-border/60">
        <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2">
            <Label>Cancha</Label>
            <Select value={activeCourtId} onValueChange={setSelectedCourtId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Selecciona una cancha" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {selectedCourt?.sport || "Sin deporte"} · {selectedCourt?.location || "Sin ubicacion"}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Dias abiertos" value={`${openDays} / 7`} hint="por semana" />
        <StatCard label="Horarios activos" value={String(activeSlots)} hint="bloques disponibles" />
        <StatCard label="Fechas especiales" value={String(specialDates.length)} hint={`${closures} bloqueos`} />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl">Horario habitual</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Aplica un horario normal a todos los días de la cancha. Luego puedes editar un día específico si lo necesitas.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Hora inicial</Label>
            <Input
              type="time"
              value={usualStartTime}
              onChange={(event) => setUsualStartTime(event.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Hora final</Label>
            <Input
              type="time"
              value={usualEndTime}
              onChange={(event) => setUsualEndTime(event.target.value)}
              className="rounded-xl"
            />
          </div>
          <Button
            type="button"
            className="rounded-xl"
            disabled={!activeCourtId || applyingUsualHours || usualEndTime <= usualStartTime}
            onClick={handleApplyUsualHours}
          >
            <Save className="h-4 w-4" />
            {applyingUsualHours ? "Aplicando..." : "Aplicar a todos"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <EmptyState text="Cargando disponibilidad..." />
      ) : courts.length === 0 ? (
        <EmptyState text="No hay canchas registradas para configurar." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-5">
          <div className="space-y-6 xl:col-span-3">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Horarios semanales</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Disponibilidad recurrente para {selectedCourt?.name || "la cancha"}.
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full gap-1.5">
                    <Clock className="h-3 w-3" />
                    Recurrente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {availability.length === 0 ? (
                  <EmptyState text="No hay horarios configurados para esta cancha." compact />
                ) : (
                  DAYS.map((day) => {
                    const items = groupedAvailability[day.value] || [];

                    return (
                      <div key={day.value} className="rounded-xl border border-border/60 bg-card p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{day.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              {items.length ? `${items.length} horario(s)` : "Cerrado"}
                            </p>
                          </div>
                          <Badge variant={items.some((item) => item.active) ? "secondary" : "outline"} className="rounded-full">
                            {items.some((item) => item.active) ? "Activo" : "Sin horarios"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-blue-600" />
                                {item.startTime} - {item.endTime}
                                <Badge
                                  variant="outline"
                                  className={
                                    item.active
                                      ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "rounded-full border-slate-200 bg-slate-100 text-slate-500"
                                  }
                                >
                                  {item.active ? "Disponible" : "Inactivo"}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => openEdit(item)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                  onClick={() => deleteAvailability(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Fechas especiales</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bloquea dias o habilita fechas puntuales.
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full gap-1.5">
                    <CalendarDays className="h-3 w-3" />
                    Overrides
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <form
                  className="grid gap-4 rounded-xl border border-dashed border-border/80 bg-muted/30 p-4 md:grid-cols-2 xl:grid-cols-[160px_1fr_130px_130px_auto]"
                  onSubmit={handleSpecialDateSubmit}
                >
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      className="rounded-xl"
                      value={specialDate}
                      onChange={(event) => setSpecialDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Observacion</Label>
                    <Input
                      className="rounded-xl"
                      placeholder="Festivo, evento privado, mantenimiento..."
                      value={specialNote}
                      onChange={(event) => setSpecialNote(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora inicial</Label>
                    <Input
                      type="time"
                      className="rounded-xl"
                      value={specialStartTime}
                      onChange={(event) => setSpecialStartTime(event.target.value)}
                      disabled={!specialAvailable}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora final</Label>
                    <Input
                      type="time"
                      className="rounded-xl"
                      value={specialEndTime}
                      onChange={(event) => setSpecialEndTime(event.target.value)}
                      disabled={!specialAvailable}
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3">
                      <Ban className="h-4 w-4 text-rose-600" />
                      <Label className="text-sm">Disponible</Label>
                      <Switch checked={specialAvailable} onCheckedChange={setSpecialAvailable} />
                    </div>
                    <Button
                      type="submit"
                      className="rounded-xl"
                      disabled={!specialDate || (specialAvailable && specialEndTime <= specialStartTime)}
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                </form>

                {specialDates.length === 0 ? (
                  <EmptyState text="No hay fechas especiales configuradas." compact />
                ) : (
                  <div className="space-y-2">
                    {specialDates.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{item.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.note || "Sin observaciones"}
                            {item.available && item.startTime && item.endTime
                              ? ` · ${item.startTime} - ${item.endTime}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              item.available
                                ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "rounded-full border-rose-200 bg-rose-50 text-rose-700"
                            }
                          >
                            {item.available ? "Habilitada" : "Bloqueada"}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => deleteSpecialDate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-2">
            <div className="sticky top-20">
              <AvailabilityCalendarPreview
                availability={availability}
                specialDates={specialDates}
              />
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingAvailability(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAvailability ? "Editar disponibilidad" : "Agregar disponibilidad"}
            </DialogTitle>
          </DialogHeader>
          <AvailabilityForm
            courts={courts}
            selectedCourtId={activeCourtId}
            initialAvailability={editingAvailability}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditingAvailability(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Badge variant="secondary" className="rounded-full text-[10px]">
          Live
        </Badge>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyState({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center"
          : "rounded-xl border border-dashed border-border/60 bg-card/40 p-12 text-center"
      }
    >
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function AvailabilityCalendarPreview({
  availability,
  specialDates,
}: {
  availability: Availability[];
  specialDates: SpecialDate[];
}) {
  const [cursor, setCursor] = useState(new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const specialMap = useMemo(() => {
    const map = new Map<string, SpecialDate>();
    specialDates.forEach((item) => map.set(item.date, item));
    return map;
  }, [specialDates]);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Vista calendario</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Resumen visual de disponibilidad.</p>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="rounded-xl" onClick={() => setCursor(subMonths(cursor, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] px-3 text-center text-sm font-semibold">
              {format(cursor, "MMMM yyyy")}
            </div>
            <Button size="icon" variant="outline" className="rounded-xl" onClick={() => setCursor(addMonths(cursor, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 border-b border-border/60 pb-2">
          {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const special = specialMap.get(dateKey);
            const daySlots = availability.filter((item) => item.dayOfWeek === day.getDay() && item.active);
            const closed = special ? !special.available : daySlots.length === 0;

            return (
              <div
                key={day.toISOString()}
                className={[
                  "min-h-[88px] rounded-xl border p-2 text-left transition-colors",
                  isSameMonth(day, cursor) ? "bg-card" : "bg-muted/30",
                  closed ? "border-rose-200 bg-rose-50/50" : "border-border/60 hover:border-primary/40",
                  isToday(day) ? "ring-2 ring-primary/60" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className={isToday(day) ? "text-xs font-bold text-primary" : "text-xs font-semibold"}>
                    {format(day, "d")}
                  </span>
                  {special && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <div className="mt-1 space-y-1">
                  {closed ? (
                    <Badge variant="destructive" className="h-4 rounded-full px-1.5 text-[10px]">
                      Cerrado
                    </Badge>
                  ) : (
                    daySlots.slice(0, 2).map((slot) => (
                      <div
                        key={slot.id}
                        className="truncate rounded-lg bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {slot.startTime}-{slot.endTime}
                      </div>
                    ))
                  )}
                  {!closed && daySlots.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">+{daySlots.length - 2} mas</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-primary/30" />
            Disponible
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded border border-rose-300 bg-rose-100" />
            Cerrado
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Especial
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
