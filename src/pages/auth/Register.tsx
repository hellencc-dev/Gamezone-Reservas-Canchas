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

export default function Register() {
  const history = useHistory();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setError("");

      const newUser = await register({
        firstName,
        lastName,
        phone,
        email,
        password,
      });

      if (newUser.role === "admin") {
        history.push("/admin");
      } else {
        history.push("/client");
      }
    } catch (err) {
      setError("No se pudo crear la cuenta. Revisa los datos.");
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-[#334155]">
              Crear cuenta
            </h1>

            <p className="text-slate-500 mt-2">
              Regístrate para reservar canchas en GameZone.
            </p>

            <div className="mt-6 space-y-4">
              <IonInput
                label="Nombre"
                labelPlacement="stacked"
                value={firstName}
                onIonChange={(e) => setFirstName(e.detail.value || "")}
              />

              <IonInput
                label="Apellido"
                labelPlacement="stacked"
                value={lastName}
                onIonChange={(e) => setLastName(e.detail.value || "")}
              />

              <IonInput
                label="Teléfono"
                labelPlacement="stacked"
                value={phone}
                onIonChange={(e) => setPhone(e.detail.value || "")}
              />

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

              <IonButton expand="block" onClick={handleRegister}>
                Crear cuenta
              </IonButton>

              <IonButton
                fill="clear"
                expand="block"
                onClick={() => history.push("/login")}
              >
                Ya tengo cuenta
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}