import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./components/ui/Login";  // Importa el componente Login
import LevelInfo from "./components/LevelInfo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Ruta para el Login */}
          <Route path="/home" element={<Home />} /> {/* Ruta para la página de niveles */}
          <Route path="/nivel-:level" element={<LevelInfo />} /> {/* Información de cada nivel */}
          <Route path="/simulador/:level" element={<Index />} /> {/* Simulador */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

