import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
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
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/copyright" element={<Copyright />} />
          <Route path="/southeast-texas-construction" element={<SeoKeywords />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
