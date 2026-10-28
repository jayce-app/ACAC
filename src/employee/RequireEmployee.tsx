import { Navigate, useLocation } from "react-router-dom";
import { useEmployeeAuth } from "./EmployeeAuth";

export function RequireEmployee({ children }: { children: React.ReactNode }) {
  const { backendReady, employee } = useEmployeeAuth();
  const location = useLocation();

  if (!backendReady) {
    return <p className="emp-loading">Loading employee console…</p>;
  }

  if (!employee) {
    return <Navigate to="/employee" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { backendReady, employee, isAdmin } = useEmployeeAuth();
  const location = useLocation();

  if (!backendReady) {
    return <p className="emp-loading">Loading employee console…</p>;
  }

  if (!employee) {
    return <Navigate to="/employee" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/employee/console" replace />;
  }

  return children;
}
