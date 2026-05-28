import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationBell from "../../components/shared/NotificationBell";

import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Flame,
  MapPin,
  Plus,
  Timer,
  TrendingUp,
} from "lucide-react";

export default function ClientHome() {
  // 1. Conservamos la autenticación y lógica exacta de tu compañera
  const { user, logout } = useAuth();
  const { createNotification } = useNotifications();
  const history = useHistory();

  // Datos y lógica exacta del Dashboard de Lovable
  const upcoming = [
    {
      id: "1",
      courtId: "c1",
      name: "Sintética Fútbol 5",
      location: "Sede Principal",
      date: "28 de Mayo",
      start: "07:00 PM",
      end: "08:00 PM",
      status: "confirmed",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=150&q=80"
    }
  ];

  const stats = [
    { label: "Active bookings", value: upcoming.length, icon: CalendarCheck, tint: "bg-blue-50 text-blue-600" },
    { label: "Played this month", value: 12, icon: Flame, tint: "bg-orange-50 text-orange-600" },
    { label: "Hours on court", value: "26h", icon: Clock, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Loyalty points", value: 1840, icon: TrendingUp, tint: "bg-amber-50 text-amber-600" },
  ];

  const sports = [
    { id: "futbol", name: "Fútbol", courts: 5, gradient: "from-emerald-500 to-teal-600" },
    { id: "tenis", name: "Tenis", courts: 3, gradient: "from-amber-400 to-orange-500" },
    { id: "baloncesto", name: "Basketball", courts: 2, gradient: "from-blue-500 to-indigo-600" },
  ];

  return (
    <IonPage>
      {/* Usamos scrollEvents para que no choque con los layouts de Ionic */}
      <IonContent fullscreen scrollEvents={true}>
        
        {/* CONTENEDOR PRINCIPAL: Aquí usamos el diseño puro de Lovable con Tailwind */}
        <div className="space-y-8 bg-[#f8fafc] min-h-screen p-6 md:p-10 text-slate-900">
          
          {/* BARRA SUPERIOR: Simula el Header limpio de Lovable con la campana de tu compañera */}
          <div className="flex items-center justify-between pb-2">
            <span className="font-extrabold tracking-tight text-xl text-slate-900">GameZone</span>
            <div className="scale-110">
              <NotificationBell />
            </div>
          </div>

          {/* ====== Hero greeting (Copiado exacto de Lovable) ====== */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                {/* Saludo personalizado con la lógica de tu compañera */}
                <div className="text-sm opacity-80">Good evening, {user?.firstName || "cliente"} 👋</div>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Ready for tonight's match?</h1>
                <p className="mt-2 text-white/85 max-w-md text-sm">
                  You have {upcoming.length} upcoming reservations and 8 courts available within 5 km.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => history.push("/client/sports")}
                  className="rounded-xl h-11 px-4 bg-white text-blue-600 font-bold text-sm shadow hover:bg-slate-50 transition flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Book a court
                </button>
                <button 
                  onClick={() => history.push("/client/my-reservations")}
                  className="rounded-xl h-11 px-4 bg-transparent border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition"
                >
                  My reservations
                </button>
              </div>
            </div>
          </div>

          {/* ====== Stats Grid (Lovable) ====== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.tint}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-2xl font-black text-slate-900 tabular-nums">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ====== Sports quick pick (Lovable) ====== */}
          <section>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">Choose your sport</h2>
              <button 
                onClick={() => history.push("/client/sports")} 
                className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 transition"
              >
                All sports <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {sports.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => history.push(`/client/courts?sport=${s.id}`)}
                  className="rounded-2xl border border-slate-100 bg-white p-4 hover:border-blue-500/40 hover:shadow-md transition text-center flex flex-col items-center w-full"
                >
                  <div className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>
                    <CalendarCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="mt-3 font-bold text-sm text-slate-800">{s.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.courts} courts</div>
                </button>
              ))}
            </div>
          </section>

          {/* ====== Upcoming + Hold expires soon (Lovable) ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upcoming reservations */}
            <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Upcoming reservations</h2>
                <button onClick={() => history.push("/client/my-reservations")} className="text-sm font-bold text-blue-600 hover:underline">
                  View all
                </button>
              </div>
              
              {upcoming.map((r) => (
                <div
                  key={r.id}
                  onClick={() => history.push(`/client/reservations/${r.id}`)}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:border-blue-500/30 cursor-pointer transition"
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                    <img src={r.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{r.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {r.location}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-semibold">
                      {r.date} · {r.start} – {r.end}
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>

            {/* Temporizador de Expiración*/}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-orange-500" />
                  <h2 className="font-bold text-slate-800">Hold expires soon</h2>
                </div>
                <p className="text-sm text-slate-400 mt-1">Complete payment to confirm your booking.</p>
              </div>
              
              <div className="rounded-xl bg-orange-50 text-orange-600 p-4 text-center border border-orange-100">
                <div className="text-xs uppercase tracking-wider font-bold opacity-80">Time remaining</div>
                <div className="text-3xl font-black mt-1 tabular-nums">04:12</div>
              </div>

              <button 
                onClick={() => history.push("/client/my-reservations")}
                className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-md"
              >
                Complete payment
              </button>
            </div>

          </div>

          {/* ====== BOTONES DE PRUEBA ====== */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            
            {/* El botón de notificación de prueba exacto */}
            <button
              onClick={() =>
                user &&
                createNotification({
                  userId: user.uid,
                  title: "Reserva creada",
                  message: "Tu reserva fue creada y está pendiente de confirmación.",
                  type: "reservation_created",
                })
              }
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md transition self-start"
            >
              Crear notificación de prueba
            </button>

            {/* El botón de cerrar sesión*/}
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm font-bold text-red-500 hover:text-red-600 hover:underline transition flex items-center gap-1 self-end"
            >
              Cerrar sesión
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
}