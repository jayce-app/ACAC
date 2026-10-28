import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { company } from "../data/content";
import { useEmployeeAuth } from "./EmployeeAuth";
import { registerEmployeeServiceWorker } from "./registerEmployeeSw";
import { useGeofenceWatch } from "./useGeofenceWatch";
import "./employee.css";

export function EmployeeLayout() {
  const { employee, isAdmin, logout, usingCloud, openEntry, geofences } =
    useEmployeeAuth();

  useEffect(() => {
    registerEmployeeServiceWorker();
  }, []);

  useGeofenceWatch({
    employeeId: employee?.id ?? null,
    fences: geofences,
    isClockedIn: Boolean(openEntry),
    enabled: Boolean(employee),
  });

  return (
    <div className="emp-shell">
      <header className="emp-top">
        <div className="emp-top__inner">
          <NavLink to="/employee" className="emp-brand" aria-label={`${company.name} employee home`}>
            <BrandLogo className="emp-brand__logo" alt={company.name} />
            <span className="emp-brand__label">Employee console</span>
          </NavLink>

          {employee ? (
            <nav className="emp-nav" aria-label="Employee">
              <NavLink to="/employee/console" className={navClass}>
                Time clock
              </NavLink>
              <NavLink to="/employee/documents" className={navClass}>
                Documents
              </NavLink>
              {isAdmin ? (
                <NavLink to="/employee/admin" className={navClass}>
                  Admin
                </NavLink>
              ) : null}
              <button type="button" className="emp-nav__logout" onClick={() => void logout()}>
                Sign out
              </button>
            </nav>
          ) : null}
        </div>
        {employee ? (
          <div className="emp-status">
            <span>
              Signed in as <strong>{employee.name}</strong>
              {isAdmin ? " · Admin" : ""}
            </span>
            <span className={openEntry ? "emp-pill emp-pill--in" : "emp-pill"}>
              {openEntry ? "Clocked in" : "Clocked out"}
            </span>
            {!usingCloud ? (
              <span className="emp-pill emp-pill--demo">Local demo mode</span>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="emp-main">
        <Outlet />
      </main>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "emp-nav__link is-active" : "emp-nav__link";
}
