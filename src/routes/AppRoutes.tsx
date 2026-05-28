import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import ClientHome from "../pages/client/ClientHome";
import AdminHome from "../pages/admin/AdminHome";
import { useAuth } from "../hooks/useAuth";
import Notifications from "../pages/shared/Notifications";

function ProtectedRoute({ component: Component, allowedRoles, ...rest }: any) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) {
          return <Redirect to="/login" />;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          return <Redirect to="/client" />;
        }

        return <Component {...props} />;
      }}
    />
  );
}

export default function AppRoutes() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />

        <ProtectedRoute
          exact
          path="/client"
          component={ClientHome}
          allowedRoles={["client", "admin"]}
        />

        <ProtectedRoute
          exact
          path="/admin"
          component={AdminHome}
          allowedRoles={["admin"]}
        />

        <ProtectedRoute
          exact
          path="/notifications"
          component={Notifications}
          allowedRoles={["client", "admin"]}
        />

        <Route exact path="/" component={Home} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
}
