import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom"; 
// Importamos IonPage para salvar el enrutador de Ionic
import { IonPage } from "@ionic/react"; 
import { ArrowLeft, Filter, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CourtCard } from "../../components/CourtCard";
import { useCourts } from "../../hooks/useCourts";
import { cn } from "../../lib/utils";

function normalizeSportKey(value?: string) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("es-CO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatSportName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase("es-CO") + word.slice(1).toLocaleLowerCase("es-CO"))
    .join(" ");
}

export default function CourtsPage() {
  const { courts, loading } = useCourts();
  const history = useHistory();
  
  const location = useLocation<{ selectedSport?: string }>();
  const initialSport = normalizeSportKey(location.state?.selectedSport) || "all";

  const [sport, setSport] = useState<string | "all">(initialSport);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"price" | "rating">("rating");

  const sportOptions = useMemo(() => {
    const options = new Map<string, string>();

    (courts || []).forEach((court) => {
      const rawSport = court.sport?.trim();
      const sportKey = normalizeSportKey(rawSport);

      if (rawSport && sportKey && !options.has(sportKey)) {
        options.set(sportKey, formatSportName(rawSport));
      }
    });

    return Array.from(options, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, "es")
    );
  }, [courts]);

  useEffect(() => {
    if (loading || sport === "all") return;

    const sportExists = sportOptions.some((option) => option.id === sport);
    if (!sportExists) {
      setSport("all");
    }
  }, [loading, sport, sportOptions]);

  const filtered = (courts || [])
    .filter((c) => {
      if (sport === "all") return true;
      return normalizeSportKey(c.sport) === sport;
    })
    .filter((c) => {
      if (!query) return true;
      const matchName = c.name?.toLowerCase().includes(query.toLowerCase());
      const matchLocation = c.location?.toLowerCase().includes(query.toLowerCase());
      return matchName || matchLocation;
    })
    .sort((a, b) => {
      if (sort === "price") {
        return (a.price || 0) - (b.price || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });

  return (
    <IonPage className="overflow-auto min-h-screen bg-[#f8fafc]">
      <div className="w-full text-[#334155] bg-[#f8fafc]">
        <main className="max-w-7xl mx-auto space-y-6 p-6 md:p-10">
          
          {/* Encabezado y barra de búsqueda */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => history.push("/client")}
                className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#0052FF]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0052FF] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </button>
              <h1 className="text-3xl font-display font-bold">Encuentra tu cancha</h1>
              <p className="text-muted-foreground mt-1">
                {loading ? "Cargando canchas disponibles..." : `${filtered.length} canchas disponibles en ${sportOptions.length} deportes.`}
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o zona..."
                  className="pl-9 h-11 rounded-xl bg-card"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-xl">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtros
              </Button>
            </div>
          </div>

          {/* Sport chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Chip active={sport === "all"} onClick={() => setSport("all")}>
              <Filter className="h-3.5 w-3.5" /> Todos
            </Chip>
            {sportOptions.map((s) => (
              <Chip key={s.id} active={sport === s.id} onClick={() => setSport(s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>

          {/* Barra de conteo de resultados y ordenamiento */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filtered.length} resultados</span>
            <div className="flex items-center gap-2">
              <span>Ordenar por:</span>
              <button 
                onClick={() => setSort("rating")} 
                className={cn("font-medium cursor-pointer transition", sort === "rating" ? "text-primary font-semibold" : "hover:text-foreground")}
              >
                Mejor calificación
              </button>
              <span>·</span>
              <button 
                onClick={() => setSort("price")} 
                className={cn("font-medium cursor-pointer transition", sort === "price" ? "text-primary font-semibold" : "hover:text-foreground")}
              >
                Precio
              </button>
            </div>
          </div>

          {/* Sección de resultados / Carga */}
          {loading ? (
            <div className="text-center p-16 text-muted-foreground font-medium">Cargando canchas...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center bg-card shadow-sm">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display font-semibold">No hay canchas con esos filtros</h3>
              <p className="text-sm text-muted-foreground mt-1">Prueba otro deporte o limpia la búsqueda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CourtCard key={c.id} court={c} />
              ))}
            </div>
          )}
          
        </main>
      </div>
    </IonPage>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition cursor-pointer",
        active
          ? "border-[#0052FF] bg-[#0052FF] text-white shadow-[0_10px_24px_-14px_rgba(0,82,255,0.55)]"
          : "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5 hover:text-[#0052FF]",
      )}
    >
      {children}
    </button>
  );
}
