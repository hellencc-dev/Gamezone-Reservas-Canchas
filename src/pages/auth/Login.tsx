import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonText,
} from "@ionic/react";
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
      <IonContent className="ion-padding">
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-[#334155]">
              Iniciar sesión
            </h1>

            <p className="text-slate-500 mt-2">
              Accede a GameZone para gestionar tus reservas.
            </p>

            <div className="mt-6 space-y-4">
              <IonInput
                label="Correo"
                labelPlacement="stacked"
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || "")}
              />

              <IonInput
                label="Contraseña"
                labelPlacement="stacked"
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || "")}
              />

              {error && (
                <IonText color="danger">
                  <p>{error}</p>
                </IonText>
              )}

              <IonButton expand="block" onClick={handleLogin}>
                Iniciar sesión
              </IonButton>

              <IonButton
                fill="clear"
                expand="block"
                onClick={() => history.push("/register")}
              >
                Crear cuenta
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}