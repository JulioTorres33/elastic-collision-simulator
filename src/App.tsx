import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./components/ui/Login";  // Importa el componente Login

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
          <Route path="/nivel-1" element={<Index />} /> {/* Simulador para nivel 1 */}
          <Route path="/nivel-2" element={<Index />} /> {/* Simulador para nivel 2 */}
          <Route path="/nivel-3" element={<Index />} /> {/* Simulador para nivel 3 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

