import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MarketingLayout } from "./components/MarketingLayout";
import { SeoHead } from "./components/SeoHead";
import { EmployeeAdmin } from "./employee/EmployeeAdmin";
import { EmployeeAuthProvider } from "./employee/EmployeeAuth";
import { EmployeeConsole } from "./employee/EmployeeConsole";
import { EmployeeDocuments } from "./employee/EmployeeDocuments";
import { EmployeeLayout } from "./employee/EmployeeLayout";
import { EmployeeLogin } from "./employee/EmployeeLogin";
import { RequireAdmin, RequireEmployee } from "./employee/RequireEmployee";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Copyright } from "./pages/Copyright";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { SeoKeywords } from "./pages/SeoKeywords";
import { Services } from "./pages/Services";

export default function App() {
  return (
    <BrowserRouter>
      <SeoHead />
      <EmployeeAuthProvider>
        <Routes>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeLogin />} />
            <Route
              path="console"
              element={
                <RequireEmployee>
                  <EmployeeConsole />
                </RequireEmployee>
              }
            />
            <Route
              path="documents"
              element={
                <RequireEmployee>
                  <EmployeeDocuments />
                </RequireEmployee>
              }
            />
            <Route
              path="admin"
              element={
                <RequireAdmin>
                  <EmployeeAdmin />
                </RequireAdmin>
              }
            />
          </Route>

          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/copyright" element={<Copyright />} />
            <Route path="/southeast-texas-construction" element={<SeoKeywords />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </EmployeeAuthProvider>
    </BrowserRouter>
  );
}
