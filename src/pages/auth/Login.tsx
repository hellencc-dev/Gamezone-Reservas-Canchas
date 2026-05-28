import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  IonText,
} from "@ionic/react";
import { arrowForward, trophy } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const history = useHistory();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");

      const loggedUser = await login(email, password);

      if (loggedUser.role === "admin") {
        history.push("/admin");
      } else {
        history.push("/client");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-screen bg-[#f8fafc] text-slate-950 lg:grid lg:grid-cols-2">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <button
              type="button"
              onClick={() => history.push("/")}
              className="relative z-10 flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <IonIcon icon={trophy} className="text-xl" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                GameZone
              </span>
            </button>

            <div className="relative z-10 max-w-lg">
              <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-800">
                La cancha está lista.
                <br />
                ¿Y tú?
              </h2>
              <p className="mt-8 max-w-md text-xl font-semibold leading-8 text-white/75">
                Reserva canchas deportivas premium en segundos. Disponibilidad
                en tiempo real, confirmación inmediata.
              </p>
            </div>

            <div className="relative z-10 text-sm font-semibold text-white/60">
              © 2026 GameZone
            </div>
          </section>

          <section className="flex min-h-screen items-center justify-center px-6 py-10 md:px-12">
            <div className="w-full max-w-xl">
              <button
                type="button"
                onClick={() => history.push("/")}
                className="mb-8 flex items-center gap-3 lg:hidden"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <IonIcon icon={trophy} className="text-xl" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight">
                  GameZone
                </span>
              </button>

              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                  Bienvenido de nuevo
                </h1>
                <p className="mt-3 text-xl text-slate-500">
                  Inicia sesión para seguir jugando.
                </p>
              </div>

              <div className="mt-12 space-y-6">
                <IonInput
                  className="min-h-14 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-md shadow-slate-200/70 [--highlight-color-focused:#2563eb]"
                  label="Correo"
                  labelPlacement="stacked"
                  type="email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value || "")}
                />

                <IonInput
                  className="min-h-14 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-md shadow-slate-200/70 [--highlight-color-focused:#2563eb]"
                  label="Contraseña"
                  labelPlacement="stacked"
                  type="password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value || "")}
                />

                {error && (
                  <IonText color="danger">
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
                      {error}
                    </p>
                  </IonText>
                )}

                <IonButton
                  expand="block"
                  onClick={handleLogin}
                  className="h-14 [--background:#2563eb] [--background-hover:#1d4ed8] [--border-radius:1rem] [--box-shadow:0_20px_35px_-18px_rgba(37,99,235,0.9)]"
                >
                  Iniciar sesión
                  <IonIcon icon={arrowForward} slot="end" />
                </IonButton>

                <p className="text-center text-base text-slate-500">
                  ¿Nuevo en GameZone?{" "}
                  <button
                    type="button"
                    onClick={() => history.push("/register")}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Crear cuenta
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}
