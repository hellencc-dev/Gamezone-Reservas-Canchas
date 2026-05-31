import { useHistory } from "react-router-dom";
import { CalendarCheck, MapPin, Star, Target, Trophy } from "lucide-react";

import { Card } from "./ui/card";
import { StatusBadge } from "./status-badge";

export interface CourtFirebase {
  id: string;
  name: string;
  sport: string;
  price: number;
  image: string;
  location: string;
  rating?: number;
  status: string;
}

const sportIconMap: Record<string, { name: string; icon: any }> = {
  futbol: { name: "Fútbol", icon: Trophy },
  tenis: { name: "Tenis", icon: Target },
  baloncesto: { name: "Baloncesto", icon: CalendarCheck },
  basketball: { name: "Baloncesto", icon: CalendarCheck },
};

export function CourtCard({ court }: { court: CourtFirebase }) {
  const history = useHistory();
  const sportData = sportIconMap[court.sport.toLowerCase()] || {
    name: court.sport,
    icon: CalendarCheck,
  };
  const SportIcon = sportData.icon;

  return (
    <div
      onClick={() => history.push(`/client/courts/${court.id}`)}
      className="group block cursor-pointer"
    >
      <Card className="gap-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          {court.image ? (
            <img
              src={court.image}
              alt={court.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
              Imagen no disponible
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />

          <div className="absolute left-3 top-3">
            <StatusBadge status={court.status} className="bg-white/95 backdrop-blur-md" />
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {court.rating || 5.0}
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md">
            <SportIcon className="h-3 w-3 text-primary" />
            {sportData.name}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 font-display font-semibold text-foreground">
              {court.name}
            </h3>
            <div className="shrink-0 text-right">
              <div className="text-lg font-extrabold text-primary">${court.price}</div>
              <div className="-mt-0.5 text-[10px] text-muted-foreground">/ hora</div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {court.location}
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#0052FF] to-[#FF6B00]" />
          </div>
        </div>
      </Card>
    </div>
  );
}
