import { Redirect, Route, Switch } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import ClientHome from "../pages/client/ClientHome";
import AdminHome from "../pages/admin/AdminHome";
import { useAuth } from "../hooks/useAuth";
import Notifications from "../pages/shared/Notifications";
import CourtsList from "../pages/client/CourtList";
import CourtDetail from "../pages/client/CourtDetail";
import CourtAvailability from "../pages/client/CourtAvailability";
import BookCourt from "../pages/client/BookCourt";
import ClientReservations from "../pages/client/ClientReservations";
import PendingReservation from "../pages/client/PendingReservation";
import ReservationDetail from "../pages/client/ReservaDetail";

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
        <Route exact path="/" component={Home} />

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

        <ProtectedRoute
          exact
          path="/client/courts"
          component={CourtsList}
          allowedRoles={["client", "admin"]}
        />

        <ProtectedRoute
          exact
          path="/client/courts/:courtId"
          component={CourtDetail}
          allowedRoles={["client", "admin"]}
        />

        <ProtectedRoute
          exact
          path="/client/courts/:courtId/availability"
          component={CourtAvailability}
          allowedRoles={["client", "admin"]}
        />

        <ProtectedRoute
          exact
          path="/client/courts/:courtId/book"
          component={BookCourt}
          allowedRoles={["client", "admin"]}
        />

        <ProtectedRoute
          exact
          path="/client/reservations"
          component={ClientReservations}
          allowedRoles={["client", "admin"]}
        />
        <ProtectedRoute
          exact
          path="/client/reserve/pending"
          component={PendingReservation}
          allowedRoles={["client", "admin"]}
        />

        <ProtectedRoute
          exact
          path="/client/reservations/:id"
          component={ReservationDetail}
          allowedRoles={["client", "admin"]}
        />

      </IonRouterOutlet>
    </IonReactRouter>
  );
}