import { MapPin, Pencil, Trash2 } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { CourtFirebase } from "../../hooks/useCourts";

interface CourtAdminCardProps {
  court: CourtFirebase;
  onEdit?: (court: CourtFirebase) => void;
  onDelete?: (court: CourtFirebase) => void;
}

export default function CourtAdminCard({ court, onEdit, onDelete }: CourtAdminCardProps) {
  const image = court.imageUrl || court.image;

  return (
    <Card className="overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={court.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-muted-foreground">
            Sin imagen
          </div>
        )}
        <Badge
          variant="outline"
          className={
            court.active
              ? "absolute right-3 top-3 border-emerald-500/20 bg-emerald-500/15 text-emerald-700 backdrop-blur"
              : "absolute right-3 top-3 border-border bg-muted text-muted-foreground backdrop-blur"
          }
        >
          {court.active ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight text-foreground">{court.name}</h3>
            <span className="shrink-0 text-sm font-semibold text-primary">
              ${court.price.toLocaleString("es-CO")}
              <span className="text-xs font-normal text-muted-foreground">/hr</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium">
              {court.sport}
            </Badge>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {court.location}
            </span>
          </div>
          {court.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{court.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit?.(court)}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => onDelete?.(court)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
