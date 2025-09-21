import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  const handleLevelClick = (level: number) => {
    // Navegar a la información del nivel antes del simulador
    navigate(`/nivel-${level}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 relative overflow-hidden">
      {/* Nubes de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-20 bg-white/80 rounded-full opacity-70"></div>
        <div className="absolute top-8 left-40 w-24 h-16 bg-white/60 rounded-full opacity-50"></div>
        <div className="absolute top-12 right-20 w-40 h-24 bg-white/70 rounded-full opacity-60"></div>
        <div className="absolute top-4 right-60 w-28 h-18 bg-white/50 rounded-full opacity-40"></div>
        <div className="absolute bottom-20 left-20 w-36 h-22 bg-white/60 rounded-full opacity-50"></div>
        <div className="absolute bottom-16 right-40 w-32 h-20 bg-white/70 rounded-full opacity-60"></div>
      </div>

      {/* Carretera en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gray-600">
        <div className="h-full flex items-center justify-center">
          <div className="w-full h-1 bg-yellow-300 relative">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-20 h-1 bg-yellow-300 mx-2"></div>
              <div className="w-8 h-1 bg-gray-600 mx-1"></div>
              <div className="w-20 h-1 bg-yellow-300 mx-2"></div>
              <div className="w-8 h-1 bg-gray-600 mx-1"></div>
              <div className="w-20 h-1 bg-yellow-300 mx-2"></div>
              <div className="w-8 h-1 bg-gray-600 mx-1"></div>
              <div className="w-20 h-1 bg-yellow-300 mx-2"></div>
            </div>
          </div>
        </div>
        {/* Líneas de carretera */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-2 bg-white/20 opacity-30"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black mb-8 drop-shadow-lg">
            Impulse Quest
          </h1>
          
          {/* Botones de niveles */}
          <div className="space-y-4 mb-8">
            <Button
              onClick={() => handleLevelClick(1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              Nivel 1: Choques Básicos
            </Button>
            
            <Button
              onClick={() => handleLevelClick(2)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              Nivel 2: Aplicaciones
            </Button>
            
            <Button
              onClick={() => handleLevelClick(3)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              Nivel 3: Desafíos
            </Button>
          </div>

          {/* Descripción */}
          <div className="bg-white/90 rounded-lg p-6 max-w-md mx-auto shadow-lg">
            <p className="text-gray-800 text-sm leading-relaxed">
              Explora como funciona el momento lineal en diferentes situaciones: choques, rebotes, impulso, centro de masa y explosiones.
            </p>
          </div>

          {/* Botón de ayuda */}
          <div className="mt-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded"
            >
              Ayuda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;