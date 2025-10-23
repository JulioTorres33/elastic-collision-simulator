import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "@/components/ui/Login";
import Home from "@/pages/Home";
import LevelInfo from "@/pages/LevelInfo";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import InelasticCollision from "@/components/inelasticCollision";
import WallBounceSimulator from "@/components/WallBounceSimulator";
import LevelInfoImpulseMomentum from "@/pages/LevelInfoImpulseMomentum";
import ImpulseMomentumSimulator from "@/components/ImpulseMomentumSimulator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />

          {/* Pantalla de información y simulador (segmento dinámico) */}
          <Route path="/nivel/:level/intro" element={<LevelInfo />} />
          <Route path="/nivel/:level/jugar" element={<Index />} />
          <Route path="/nivel/1/escenario/2" element={<InelasticCollision />} />
          <Route path="/nivel/1/escenario/3" element={<WallBounceSimulator />} />

          {/* Nivel 2: Teorema del Impulso y Momento */}
          <Route path="/nivel/2/intro" element={<LevelInfoImpulseMomentum />} />
          <Route path="/nivel/2/escenario/1" element={<ImpulseMomentumSimulator />} />

          {/* Atajos / compatibilidad */}
          <Route path="/nivel-1" element={<Navigate to="/nivel/1/intro" replace />} />
          <Route path="/nivel-2" element={<Navigate to="/nivel/2/intro" replace />} />
          <Route path="/nivel-3" element={<Navigate to="/home" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
