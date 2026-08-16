import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Layout } from "./components/Layout";
import { Admin } from "./pages/Admin";
import { Home } from "./pages/Home";
import { Members } from "./pages/Members";
import { Membership } from "./pages/Membership";
import { Permits } from "./pages/Permits";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/ACAC">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/permits" element={<Permits />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
