import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  arrowForward,
  basketball,
  calendar,
  checkmarkCircle,
  flash,
  football,
  location,
  shieldCheckmark,
  sparkles,
  star,
  tennisball,
  trophy,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

const sports = [
  {
    name: "Futbol",
    courts: "Canchas sinteticas y naturales",
    icon: football,
    gradient: "from-emerald-400 to-cyan-500",
  },
  {
    name: "Baloncesto",
    courts: "Espacios cubiertos y abiertos",
    icon: basketball,
    gradient: "from-orange-400 to-rose-500",
  },
  {
    name: "Padel",
    courts: "Reservas rapidas por horario",
    icon: trophy,
    gradient: "from-violet-500 to-blue-500",
  },
  {
    name: "Tenis",
    courts: "Canchas disponibles cerca de ti",
    icon: tennisball,
    gradient: "from-lime-400 to-emerald-500",
  },
  {
    name: "Voleibol",
    courts: "Partidos con confirmacion instantanea",
    icon: star,
    gradient: "from-sky-400 to-indigo-500",
  },
];

const steps = [
  {
    number: "01",
    title: "Encuentra tu cancha",
    description:
      "Filtra por deporte, ubicacion y disponibilidad para elegir el mejor espacio.",
    icon: location,
  },
  {
    number: "02",
    title: "Elige un horario",
    description:
      "Consulta turnos en tiempo real y reserva cuando tu equipo pueda jugar.",
    icon: calendar,
  },
  {
    number: "03",
    title: "Juega tranquilo",
    description:
      "Recibe confirmacion inmediata y mantente al dia con tus reservas.",
    icon: checkmarkCircle,
  },
];

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-screen bg-[#f8fafc] text-slate-950">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              <button
                type="button"
                onClick={() => history.push("/")}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <IonIcon icon={trophy} className="text-xl" />
                </div>
                <span className="text-lg font-extrabold tracking-tight">
                  GameZone
                </span>
              </button>

              <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
                <a href="#sports" className="hover:text-slate-950">
                  Deportes
                </a>
                <a href="#how" className="hover:text-slate-950">
                  Como funciona
                </a>
                <a href="#pricing" className="hover:text-slate-950">
                  Precios
                </a>
              </nav>

              <div className="flex items-center gap-2">
                <IonButton
                  fill="clear"
                  onClick={() => history.push("/login")}
                  className="[--color:#334155] [--border-radius:0.75rem]"
                >
                  Iniciar sesion
                </IonButton>
                <IonButton
                  onClick={() => history.push("/register")}
                  className="[--background:#2563eb] [--background-hover:#1d4ed8] [--border-radius:0.75rem] [--box-shadow:none]"
                >
                  Comenzar
                  <IonIcon icon={arrowForward} slot="end" />
                </IonButton>
              </div>
            </div>
          </header>

          <main>
            <section className="relative overflow-hidden">
              <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
              </div>

              <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pb-24 lg:pt-20">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                    <IonIcon icon={sparkles} className="text-blue-600" />
                    Plataforma para jugadores y administradores
                  </div>

                  <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 md:text-6xl">
                    Reserva la cancha.
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                      Juega el partido.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                    GameZone es la forma mas rapida de reservar canchas
                    deportivas cerca de ti. Disponibilidad en tiempo real,
                    confirmacion inmediata y cero complicaciones.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <IonButton
                      size="large"
                      onClick={() => history.push("/register")}
                      className="h-12 [--background:#2563eb] [--background-hover:#1d4ed8] [--border-radius:0.75rem] [--box-shadow:0_18px_35px_-18px_rgba(37,99,235,0.85)]"
                    >
                      Empezar a reservar
                      <IonIcon icon={arrowForward} slot="end" />
                    </IonButton>
                    <IonButton
                      size="large"
                      fill="outline"
                      onClick={() => history.push("/login")}
                      className="h-12 [--border-color:#cbd5e1] [--border-radius:0.75rem] [--color:#334155]"
                    >
                      Iniciar sesion
                    </IonButton>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <IonIcon icon={star} className="text-yellow-400" />
                      <span className="font-bold text-slate-950">4.9</span>
                      calificacion
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IonIcon icon={shieldCheckmark} className="text-blue-600" />
                      Acceso seguro
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IonIcon icon={flash} className="text-violet-600" />
                      Reserva instantanea
                    </div>
                  </div>
                </div>

                <div className="relative hidden h-[520px] lg:block">
                  <div className="absolute right-0 top-0 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                    <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-violet-600">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(135deg,rgba(37,99,235,0.92),rgba(124,58,237,0.88))]" />
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        Cancha disponible
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-semibold text-emerald-600">
                        Disponible ahora
                      </div>
                      <h3 className="mt-1 font-bold text-slate-950">
                        Arena Central
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <IonIcon icon={location} />
                        Cerca de ti
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-extrabold text-blue-600">
                          $45
                          <span className="text-xs font-normal text-slate-500">
                            /hora
                          </span>
                        </span>
                        <span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                          Reservar
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-0 top-32 w-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white">
                        <IonIcon icon={calendar} className="text-xl" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Confirmado</div>
                        <div className="font-bold text-slate-950">
                          Hoy a las 18:00
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      <div className="rounded-lg bg-emerald-50 py-2 text-emerald-600">
                        Libre
                      </div>
                      <div className="rounded-lg bg-emerald-50 py-2 text-emerald-600">
                        Libre
                      </div>
                      <div className="rounded-lg bg-amber-50 py-2 text-amber-600">
                        Espera
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 right-8 w-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-950">
                        Esta semana
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        +12%
                      </span>
                    </div>
                    <div className="mt-4 flex h-20 items-end gap-1">
                      {[40, 55, 35, 70, 50, 85, 65].map((height, index) => (
                        <div
                          key={index}
                          className={`flex-1 rounded-t-md ${
                            index === 5 ? "bg-violet-500" : "bg-blue-500/75"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Reservas cerca de ti
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="sports" className="border-y border-slate-200 bg-white py-20">
              <div className="mx-auto max-w-7xl px-6">
                <div className="mb-10 flex items-end justify-between gap-6">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                      Elige tu juego
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                      Cinco deportes, una plataforma
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  {sports.map((sport) => (
                    <div
                      key={sport.name}
                      className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 transition hover:border-blue-300 hover:shadow-xl hover:shadow-slate-900/10"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${sport.gradient} text-white`}
                      >
                        <IonIcon icon={sport.icon} className="text-2xl" />
                      </div>
                      <div className="mt-4 font-extrabold text-slate-950">
                        {sport.name}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {sport.courts}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="how" className="py-20">
              <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                    Como funciona
                  </div>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                    De buscar cancha a jugar en tres pasos
                  </h2>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <IonIcon icon={step.icon} className="text-xl" />
                        </div>
                        <span className="text-2xl font-extrabold text-slate-200">
                          {step.number}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="pricing" className="py-20">
              <div className="mx-auto max-w-5xl px-6">
                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-10 text-center text-white shadow-2xl shadow-blue-500/20 md:p-16">
                  <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                    Tu proximo partido empieza aqui.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/80 md:text-base">
                    Unete a GameZone y reserva tus espacios deportivos sin
                    suscripciones: solo pagas cuando juegas.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <IonButton
                      color="light"
                      size="large"
                      onClick={() => history.push("/register")}
                      className="h-12 [--border-radius:0.75rem] [--box-shadow:none]"
                    >
                      Crear cuenta gratis
                    </IonButton>
                    <IonButton
                      fill="outline"
                      size="large"
                      onClick={() => history.push("/login")}
                      className="h-12 [--border-color:rgba(255,255,255,0.4)] [--border-radius:0.75rem] [--color:#ffffff]"
                    >
                      Iniciar sesion
                    </IonButton>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="border-t border-slate-200 py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                  <IonIcon icon={trophy} />
                </div>
                <span className="font-extrabold text-slate-950">GameZone</span>
                <span>© 2026</span>
              </div>
              <div className="flex gap-6">
                <a href="#pricing" className="hover:text-slate-950">
                  Terminos
                </a>
                <a href="#pricing" className="hover:text-slate-950">
                  Privacidad
                </a>
                <a href="#sports" className="hover:text-slate-950">
                  Soporte
                </a>
              </div>
            </div>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
