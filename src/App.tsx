import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Layout } from "./components/Layout";
import { Apply } from "./pages/Apply";
import { Admin } from "./pages/Admin";
import { Education } from "./pages/Education";
import { Home } from "./pages/Home";
import { Members } from "./pages/Members";
import { Membership } from "./pages/Membership";
import { Permits } from "./pages/Permits";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/ACAC">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/permits" element={<Permits />} />
            <Route path="/education" element={<Education />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
