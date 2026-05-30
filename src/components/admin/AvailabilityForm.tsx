import { type FormEvent, useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import type { Availability, AvailabilityInput } from "../../hooks/useAvailability";
import type { CourtFirebase } from "../../hooks/useCourts";

interface AvailabilityFormProps {
  courts: CourtFirebase[];
  selectedCourtId?: string;
  initialAvailability?: Availability | null;
  onSubmit: (values: AvailabilityInput) => Promise<void> | void;
  onCancel?: () => void;
}

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
  { value: 0, label: "Domingo" },
];

export default function AvailabilityForm({
  courts,
  selectedCourtId,
  initialAvailability,
  onSubmit,
  onCancel,
}: AvailabilityFormProps) {
  const [courtId, setCourtId] = useState(selectedCourtId || "");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialAvailability) {
      setCourtId(initialAvailability.courtId);
      setDayOfWeek(String(initialAvailability.dayOfWeek));
      setStartTime(initialAvailability.startTime);
      setEndTime(initialAvailability.endTime);
      setActive(initialAvailability.active);
      setError("");
      return;
    }

    setCourtId(selectedCourtId || "");
    setDayOfWeek("1");
    setStartTime("09:00");
    setEndTime("18:00");
    setActive(true);
    setError("");
  }, [initialAvailability, selectedCourtId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!courtId) {
      setError("Selecciona una cancha.");
      return;
    }

    if (!startTime) {
      setError("La hora inicial es obligatoria.");
      return;
    }

    if (!endTime) {
      setError("La hora final es obligatoria.");
      return;
    }

    if (endTime <= startTime) {
      setError("La hora final debe ser posterior a la hora inicial.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSubmit({
        courtId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        active,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">
            {initialAvailability ? "Editar disponibilidad" : "Nueva disponibilidad"}
          </CardTitle>
          <Badge variant="secondary" className="gap-1.5 rounded-full">
            <Clock className="h-3 w-3" />
            Horario
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cancha</Label>
              <Select value={courtId} onValueChange={setCourtId}>
                <SelectTrigger className="rounded-xl">
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

            <div className="space-y-2">
              <Label>Dia</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona un dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Hora inicial</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Hora final</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <div>
              <Label htmlFor="availabilityActive">Horario activo</Label>
              <p className="text-sm text-muted-foreground">
                Los horarios inactivos no deben ofrecerse para nuevas reservas.
              </p>
            </div>
            <Switch id="availabilityActive" checked={active} onCheckedChange={setActive} />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={onCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" className="rounded-xl" disabled={saving}>
              {saving ? "Guardando..." : "Guardar disponibilidad"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { DAYS };
