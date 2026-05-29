import { useParams, useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react"; // <-- Importamos los contenedores obligatorios para el enrutador
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Share2,
  Star,
  Heart,
  Trophy,
  Target
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { StatusBadge } from "../../components/status-badge";
import { useCourts } from "../../hooks/useCourts";

const sportIconMap: Record<string, { name: string; icon: any }> = {
  futbol: { name: "Fútbol", icon: Trophy },
  tenis: { name: "Tenis", icon: Target },
  baloncesto: { name: "Baloncesto", icon: Calendar },
  basketball: { name: "Basketball", icon: Calendar },
};

export default function CourtDetail() {
  const { courtId } = useParams<{ courtId: string }>();
  const history = useHistory();
  const { courts, loading } = useCourts();

  const court = courts?.find((c) => c.id === courtId);

  if (loading) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] flex items-center justify-center text-[#334155]">
          <p className="font-medium">Loading court details...</p>
        </div>
      </IonPage>
    );
  }

  if (!court) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] p-6 text-[#334155] space-y-4">
          <button onClick={() => history.push("/client/courts")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-0">
            <ArrowLeft className="h-4 w-4" /> Back to courts
          </button>
          <p className="text-xl font-bold text-center mt-10">Court not found</p>
        </div>
      </IonPage>
    );
  }

  const sportData = sportIconMap[court.sport?.toLowerCase()] || { name: court.sport || "Sport", icon: Calendar };
  const SportIcon = sportData.icon;

  const defaultAmenities = ["Showers", "Free Parking", "Equipment Rental", "Night Lights"];
  const amenities = court.amenities || defaultAmenities;

  return (
    <IonPage className="bg-transparent border-none"> 
      {/* IonContent con scrollEvents permite que el div interno de Tailwind maneje su propia altura libremente */}
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155]">
          <main className="max-w-7xl mx-auto space-y-6 p-6 md:p-10">
            
            {/* Botón de regreso */}
            <button 
              onClick={() => history.push("/client/courts")} 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-0 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to courts
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Contenedor de Imagen */}
                <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-secondary relative shadow-sm">
                  {court.image ? (
                    <img src={court.image} alt={court.name} className="h-full w-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">No image available</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <StatusBadge status={court.status} className="bg-white/95 backdrop-blur" />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-xl bg-white/95 backdrop-blur cursor-pointer"><Heart className="h-4 w-4" /></Button>
                    <Button size="icon" variant="secondary" className="rounded-xl bg-white/95 backdrop-blur cursor-pointer"><Share2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* Información Básica */}
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary px-2.5 py-1 font-medium">
                      <SportIcon className="h-3 w-3" /> {sportData.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="font-semibold text-foreground">{court.rating || 5.0}</span> ({court.reviews || 24} reviews)
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl md:text-4xl font-display font-bold text-foreground">{court.name}</h1>
                  <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {court.location}
                  </div>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {court.description || "Excellent court equipped with high-quality surfaces, optimal lighting systems, and pristine maintenance. Perfect for matches with friends, professional practice sessions, or local tournaments."}
                  </p>
                </div>

                {/* Comodidades */}
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg">Amenities</h3>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {amenities.map((a: string) => (
                      <div key={a} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" /> {a}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Ubicación Estática */}
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg">Location</h3>
                  <div className="mt-4 aspect-[2/1] rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-muted-foreground relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(51,65,85,0.4) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                    <div className="relative h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-brand">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tarjeta Lateral de Precios y Reserva */}
              <Card className="p-6 rounded-2xl border-border bg-card h-fit lg:sticky lg:top-24 shadow-sm space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-bold text-primary">${court.price}</span>
                    <span className="text-sm text-muted-foreground">/ hour</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Includes equipment, lights, and access to dressing rooms.</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 rounded-xl shadow-brand font-medium text-base cursor-pointer"
                    onClick={() => history.push(`/client/courts/${court.id}/book`)}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Book now
                  </Button>
                </div>

                <div className="pt-4 border-t border-border space-y-2 text-sm">
                  <Row label="Free cancellation" value="up to 24h before" />
                  <Row label="Instant confirmation" value="✓" />
                  <Row label="Min duration" value="60 min" />
                </div>
              </Card>
            </div>
            
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}