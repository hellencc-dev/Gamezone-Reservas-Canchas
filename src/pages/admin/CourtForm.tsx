import { useEffect, useState } from "react";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import { Textarea } from "../../components/ui/textarea";
import type { CourtFirebase, CourtInput } from "../../hooks/useCourts";

interface CourtFormProps {
  initialCourt?: CourtFirebase | null;
  onSubmit: (values: CourtInput) => Promise<void> | void;
  onCancel?: () => void;
  title?: string;
}

const SPORTS = ["futbol", "tenis", "baloncesto", "padel", "voleibol", "badminton"];

const emptyValues: CourtInput = {
  name: "",
  sport: "",
  location: "",
  price: 0,
  imageUrl: "",
  description: "",
  active: true,
};

export default function CourtForm({
  initialCourt,
  onSubmit,
  onCancel,
  title = "Agregar cancha",
}: CourtFormProps) {
  const [values, setValues] = useState<CourtInput>(emptyValues);
  const [priceValue, setPriceValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialCourt) {
      setValues(emptyValues);
      setPriceValue("");
      setError("");
      return;
    }

    setValues({
      name: initialCourt.name,
      sport: initialCourt.sport,
      location: initialCourt.location,
      price: initialCourt.price,
      imageUrl: initialCourt.imageUrl || initialCourt.image || "",
      description: initialCourt.description || "",
      active: initialCourt.active,
    });
    setPriceValue(String(initialCourt.price || ""));
    setError("");
  }, [initialCourt]);

  const set = <K extends keyof CourtInput>(key: K, value: CourtInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!values.sport.trim()) {
      setError("El deporte es obligatorio.");
      return;
    }

    if (!values.location.trim()) {
      setError("La ubicacion es obligatoria.");
      return;
    }

    const price = Number(priceValue);

    if (!priceValue || Number.isNaN(price) || price <= 0) {
      setError("El precio debe ser mayor a cero.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        sport: values.sport.trim(),
        location: values.location.trim(),
        imageUrl: values.imageUrl.trim(),
        description: values.description.trim(),
        price,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la cancha</Label>
              <Input
                id="name"
                placeholder="Sintetica Maracana"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Deporte</Label>
              <Select value={values.sport} onValueChange={(value) => set("sport", value)}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Selecciona un deporte" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicacion</Label>
              <Input
                id="location"
                placeholder="Sede Norte"
                value={values.location}
                onChange={(event) => set("location", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio por hora</Label>
              <Input
                id="price"
                min="0"
                type="number"
                placeholder="60000"
                value={priceValue}
                onChange={(event) => setPriceValue(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de imagen</Label>
            <Input
              id="imageUrl"
              placeholder="https://..."
              value={values.imageUrl}
              onChange={(event) => set("imageUrl", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe superficie, luces, cubierta y detalles importantes."
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <div>
              <Label htmlFor="active">Cancha activa</Label>
              <p className="text-sm text-muted-foreground">
                Las canchas inactivas se muestran como no disponibles.
              </p>
            </div>
            <Switch
              id="active"
              checked={values.active}
              onCheckedChange={(checked) => set("active", checked)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cancha"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
