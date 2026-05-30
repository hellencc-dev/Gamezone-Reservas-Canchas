import { useHistory } from "react-router-dom";
import { MapPin, Star, CalendarCheck, Trophy, Target } from "lucide-react";
import { Card } from "./ui/card";
import { StatusBadge } from "./status-badge";

// Definimos la interfaz local alineada con la estructura que viene de Firebase
export interface CourtFirebase {
  id: string;
  name: string;
  sport: string; // 'futbol', 'tenis', 'baloncesto', etc.
  price: number;
  image: string;
  location: string;
  rating: number;
  status: string; // 'available', 'busy', 'closed'
}

// Mapeo dinámico y local de iconos para no depender de mock-data
const sportIconMap: Record<string, { name: string; icon: any }> = {
  futbol: { name: "Fútbol", icon: Trophy },
  tenis: { name: "Tenis", icon: Target },
  baloncesto: { name: "Baloncesto", icon: CalendarCheck },
  basketball: { name: "Baloncesto", icon: CalendarCheck },
};

export function CourtCard({ court }: { court: CourtFirebase }) {
  const history = useHistory();

  // Obtenemos los datos del deporte con un fallback seguro por si viene un deporte raro de Firebase
  const sportData = sportIconMap[court.sport.toLowerCase()] || { 
    name: court.sport, 
    icon: CalendarCheck 
  };
  const SportIcon = sportData.icon;

  const handleNavigation = () => {
    // Redirección nativa de Ionic/React-Router hacia el detalle de la cancha
    history.push(`/client/courts/${court.id}`);
  };

  return (
    <div
      onClick={handleNavigation}
      className="group block cursor-pointer"
    >
      <Card className="overflow-hidden rounded-2xl border-border hover:border-primary/40 transition-all hover:shadow-elevated p-0 gap-0">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          {court.image ? (
            <img
              src={court.image}
              alt={court.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
              Imagen no disponible
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3">
            <StatusBadge status={court.status} className="bg-white/95 backdrop-blur" />
          </div>
          
          <div className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur px-2 py-1 text-xs font-semibold text-foreground flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {court.rating || 5.0}
          </div>
          
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-xs font-medium text-foreground">
            <SportIcon className="h-3 w-3 text-primary" />
            {sportData.name}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-foreground line-clamp-1">
              {court.name}
            </h3>
            <div className="text-right shrink-0">
              <div className="text-base font-bold text-primary">${court.price}</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">/ hora</div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {court.location}
          </div>
        </div>
      </Card>
    </div>
  );
}
