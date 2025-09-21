import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LevelInfo = () => {
  const navigate = useNavigate();
  const { level } = useParams();
  
  const levelData = {
    "1": {
      title: "Nivel 1: Choque Directo",
      description: "Dos objetos en un plano unidimensional (una pista) y chocan de frente. La colisión es perfectamente elástica, lo que significa que tanto el momento lineal como la energía cinética total del sistema se conservan.",
      instructions: [
        "Ajusta los deslizadores para establecer la masa (en kg) y la velocidad inicial (en m/s) de cada carrito.",
        "Usa el botón \"Iniciar Simulación\" para observar el choque.",
        "Revisa la tabla de datos. Compara los valores de momento lineal total y energía cinética total antes y después del choque."
      ],
      learning: "Comprender y verificar visualmente que, en una colisión elástica, el momento lineal total antes del choque es igual al momento lineal total después del choque [P(total,inicial) = P(total,final)] y que la energía cinética total también se conserva (K(total,inicial) = K(total,final))."
    },
    "2": {
      title: "Nivel 2: Aplicaciones",
      description: "Explora diferentes tipos de colisiones y sus aplicaciones en la vida real. Analiza cómo varían los resultados según las masas y velocidades iniciales.",
      instructions: [
        "Experimenta con diferentes combinaciones de masa y velocidad.",
        "Observa cómo afectan los cambios en las condiciones iniciales.",
        "Analiza los patrones de comportamiento en las colisiones."
      ],
      learning: "Aplicar los conceptos de conservación del momento lineal y energía cinética en diferentes escenarios realistas."
    },
    "3": {
      title: "Nivel 3: Desafíos",
      description: "Pon a prueba tu comprensión con desafíos avanzados de colisiones elásticas. Resuelve problemas complejos paso a paso.",
      instructions: [
        "Resuelve los desafíos propuestos usando los principios aprendidos.",
        "Predice los resultados antes de ejecutar la simulación.",
        "Compara tus predicciones con los resultados reales."
      ],
      learning: "Dominar los conceptos de conservación del momento lineal y energía cinética en situaciones desafiantes."
    }
  };

  const currentLevel = levelData[level as keyof typeof levelData] || levelData["1"];

  const handleStartGame = () => {
    navigate(`/simulador/${level}`);
  };

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-cyan-300 to-blue-400 relative">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          {currentLevel.title}
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Descripción del Nivel */}
        <Card className="bg-white/95 p-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Descripción del Nivel
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {currentLevel.description}
          </p>
        </Card>

        {/* Imagen del Choque Directo */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 text-center">
              CHOQUE<br />DIRECTO
            </h2>
            <p className="text-xs text-center mb-4 opacity-90">
              PHYSICAL FUN!<br />Collision Simulation
            </p>
            {/* Simulación visual simple de carros */}
            <div className="flex justify-center items-center space-x-4 my-6">
              <div className="w-16 h-8 bg-red-500 rounded-sm relative">
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-0 h-0 border-l-4 border-l-red-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>
              <div className="text-yellow-300 text-2xl animate-pulse">💥</div>
              <div className="w-16 h-8 bg-blue-500 rounded-sm relative">
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-0 h-0 border-r-4 border-r-blue-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instrucciones */}
        <Card className="bg-white/95 p-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Instrucciones
          </h2>
          <ol className="text-sm text-gray-700 space-y-2">
            {currentLevel.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="font-semibold mr-2 text-blue-600">
                  {index + 1}.
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Aprendizaje */}
        <Card className="bg-white/95 p-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Aprendizaje
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {currentLevel.learning}
          </p>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center space-x-4 py-8">
        <Button
          onClick={handleBack}
          variant="secondary"
          className="bg-white/90 hover:bg-white text-gray-800 px-6 py-3"
        >
          Volver
        </Button>
        <Button
          onClick={handleStartGame}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold"
        >
          Iniciar Juego
        </Button>
      </div>
    </div>
  );
};

export default LevelInfo;