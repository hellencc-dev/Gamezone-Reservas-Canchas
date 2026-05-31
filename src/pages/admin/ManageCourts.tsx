import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import CourtAdminCard from "../../components/admin/CourtAdminCard";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { type CourtFirebase, type CourtInput, useCourts } from "../../hooks/useCourts";
import CourtForm from "./CourtForm";

const SPORTS = ["futbol", "tenis", "baloncesto", "padel", "voleibol", "badminton"];

export default function ManageCourts() {
  const { courts, loading, createCourt, updateCourt, deleteCourt } = useCourts();
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("all");
  const [active, setActive] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourtFirebase | null>(null);

  const filteredCourts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return courts.filter((court) => {
      const matchesSearch =
        !query ||
        court.name.toLowerCase().includes(query) ||
        court.location.toLowerCase().includes(query) ||
        court.sport.toLowerCase().includes(query);
      const matchesSport = sport === "all" || court.sport === sport;
      const matchesActive =
        active === "all" ||
        (active === "active" && court.active) ||
        (active === "inactive" && !court.active);

      return matchesSearch && matchesSport && matchesActive;
    });
  }, [active, courts, search, sport]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (court: CourtFirebase) => {
    setEditing(court);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values: CourtInput) => {
    if (editing) {
      await updateCourt(editing.id, values);
    } else {
      await createCourt(values);
    }

    closeForm();
  };

  const handleDelete = async (court: CourtFirebase) => {
    const confirmed = window.confirm(`Eliminar la cancha "${court.name}"?`);

    if (!confirmed) {
      return;
    }

    await deleteCourt(court.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestionar canchas</h1>
          <p className="text-sm text-muted-foreground">
            Agrega, edita y controla la disponibilidad de todas las canchas.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="h-4 w-4" />
          Agregar cancha
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="grid gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar canchas..."
              className="h-11 rounded-xl bg-white pl-9 shadow-sm"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Deporte
            </span>
            <button className={sport === "all" ? "gz-chip gz-chip-active" : "gz-chip"} onClick={() => setSport("all")}>
              Todos
            </button>
            {SPORTS.map((item) => (
              <button key={item} className={sport === item ? "gz-chip gz-chip-active" : "gz-chip"} onClick={() => setSport(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Estado
            </span>
            {[
              ["all", "Todas"],
              ["active", "Activas"],
              ["inactive", "Inactivas"],
            ].map(([value, label]) => (
              <button key={value} className={active === value ? "gz-chip gz-chip-active" : "gz-chip"} onClick={() => setActive(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">Cargando canchas...</p>
        </div>
      ) : courts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">No hay canchas registradas.</p>
        </div>
      ) : filteredCourts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">No hay canchas con esos filtros.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourts.map((court) => (
            <CourtAdminCard
              key={court.id}
              court={court}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cancha" : "Agregar cancha"}</DialogTitle>
          </DialogHeader>
          <CourtForm
            title=""
            initialCourt={editing}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
