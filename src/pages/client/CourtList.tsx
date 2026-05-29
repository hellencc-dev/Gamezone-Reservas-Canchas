import React, { useState, useMemo } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { CourtCard } from "../../components/CourtCard";

export default function CourtsList() {
  const history = useHistory();
  const location = useLocation();

  // Capturar si venimos desde el Home con un deporte ya seleccionado (ej: ?sport=futbol)
  const searchParams = new URLSearchParams(location.search);
  const initialSport = searchParams.get("sport") || "all";

  // Estados para filtros y ordenamientos
  const [sport, setSport] = useState<any>(initialSport);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"price" | "rating">("rating");

  // Mocks de deportes (Mapeados a nombres amigables)
  const sports = [
    { id: "futbol", name: "Fútbol" },
    { id: "tenis", name: "Tenis" },
    { id: "baloncesto", name: "Basketball" },
  ];

  // Mocks de canchas
  const mockCourts = [
    { id: "c1", name: "Sintética Maracaná", sport: "futbol", price: 60000, rating: 4.9, location: "Sede Norte", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80" },
    { id: "c2", name: "Cancha Central de Tenis", sport: "tenis", price: 45000, rating: 4.7, location: "Sede Principal", image: "https://images.unsplash.com/photo-1622279457486-62dcc4a4da13?auto=format&fit=crop&w=400&q=80" },
    { id: "c3", name: "Coliseo de Basketball", sport: "baloncesto", price: 50000, rating: 4.6, location: "Sede Principal", image: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=400&q=80" },
    { id: "c4", name: "Camp Nou Fútbol 8", sport: "futbol", price: 80000, rating: 4.8, location: "Sede Norte", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80" },
  ];

  // Lógica de Filtrado y Ordenamiento
  const filtered = useMemo(() => {
    return mockCourts
      .filter((c) => (sport === "all" ? true : c.sport === sport))
      .filter((c) => (query ? (c.name + c.location).toLowerCase().includes(query.toLowerCase()) : true))
      .sort((a, b) => (sort === "price" ? a.price - b.price : b.rating - a.rating));
  }, [sport, query, sort]);

  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <div className="space-y-6 bg-[#f8fafc] min-h-screen p-6 md:p-10 text-slate-900">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => history.push("/client/home")}
                className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Find your court</h1>
                <p className="text-sm text-slate-400 mt-1">
                  {filtered.length} courts available across {sports.length} sports.
                </p>
              </div>
            </div>

            {/* Inputs de búsqueda y botón filtros de Lovable */}
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or area…"
                  className="pl-9 h-11 w-full rounded-xl bg-white border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>
              <button className="h-11 px-4 rounded-xl border border-slate-200 bg-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>
          </div>

          {/* ====== Sport chips (Lovable) ====== */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSport("all")}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border transition ${
                sport === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <Filter className="h-3.5 w-3.5" /> All sports
            </button>
            
            {sports.map((s) => (
              <button
                key={s.id}
                onClick={() => setSport(s.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border transition ${
                  sport === s.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <Filter className="h-3.5 w-3.5 opacity-50" /> {s.name}
              </button>
            ))}
          </div>

          {/* ====== Resultados y Ordenamientos (Lovable) ====== */}
          <div className="flex items-center justify-between text-sm text-slate-400 font-semibold">
            <span>{filtered.length} results</span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <button 
                onClick={() => setSort("rating")} 
                className={`font-bold transition ${sort === "rating" ? "text-blue-600" : "hover:text-slate-700"}`}
              >
                Top rated
              </button>
              <span>·</span>
              <button 
                onClick={() => setSort("price")} 
                className={`font-bold transition ${sort === "price" ? "text-blue-600" : "hover:text-slate-700"}`}
              >
                Price
              </button>
            </div>
          </div>

          {/* ====== Cuadrícula o Mensaje Vacío (Lovable) ====== */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-800">No courts match your filters</h3>
              <p className="text-sm text-slate-400 mt-1">Try a different sport or clear your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c: any) => (
                <CourtCard key={c.id} court={c} />
              ))}
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
}