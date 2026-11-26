import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { restoreAuthenticatedUser } from "../api/authApi.js";

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const [state, setState] = useState({ status: "checking", user: null });

  useEffect(() => {
    let active = true;
    restoreAuthenticatedUser()
      .then((user) => { if (active) setState({ status: "authenticated", user }); })
      .catch(() => { if (active) setState({ status: "anonymous", user: null }); });
    return () => { active = false; };
  }, [location.key]);

  if (state.status === "checking") {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#857970" }}>Checking your session…</main>;
  }
  if (state.status === "anonymous") {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  if (allowedRoles?.length && !allowedRoles.includes(state.user.role)) {
    return <Navigate to={state.user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return typeof children === "function" ? children(state.user) : children;
}
