import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";

export default function ImpulseMomentumSimulator() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parámetros del sistema
  const [mass] = useState(2.0); // kg (fijo en este escenario)
  const [force, setForce] = useState(15); // N
  const [duration, setDuration] = useState(2); // s

  // Estado de la simulación
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [time, setTime] = useState(0);

  // Valores calculados
  const impulse = force * duration;
  const initialMomentum = mass * velocity;
  const finalMomentum = initialMomentum + impulse;
  const finalVelocity = finalMomentum / mass;
  const deltaMomentum = finalMomentum - initialMomentum;

  // Constantes de renderizado
  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 300;
  const GROUND_Y = 220;
  const CAR_WIDTH = 80;
  const CAR_HEIGHT = 40;
  const SCALE = 3; // píxeles por metro

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const forceAppliedRef = useRef(false);
  const forceStartTimeRef = useRef(0);

  // Aplicar fuerza
  const applyForce = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      forceAppliedRef.current = true;
      forceStartTimeRef.current = 0;
      lastTimeRef.current = performance.now();
    }
  };

  // Control de pausa
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Reiniciar
  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCarPosition(0);
    setVelocity(0);
    setTime(0);
    forceAppliedRef.current = false;
    forceStartTimeRef.current = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Loop de animación
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      setTime((prevTime) => {
        const newTime = prevTime + deltaTime;

        // Si la fuerza aún está siendo aplicada
        if (forceAppliedRef.current && newTime - forceStartTimeRef.current < duration) {
          const acceleration = force / mass;
          setVelocity((v) => v + acceleration * deltaTime);
        } else if (forceAppliedRef.current) {
          forceAppliedRef.current = false;
        }

        return newTime;
      });

      setCarPosition((pos) => {
        const newPos = pos + velocity * deltaTime * SCALE;
        // Si sale del canvas, detener
        if (newPos > CANVAS_WIDTH - CAR_WIDTH - 50) {
          setIsRunning(false);
          return CANVAS_WIDTH - CAR_WIDTH - 50;
        }
        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, isPaused, velocity, force, mass, duration]);

  // Dibujar en canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpiar
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Fondo cielo
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#B0E0E6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pasto
    ctx.fillStyle = "#90EE90";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 30);

    // Pista
    ctx.fillStyle = "#696969";
    ctx.fillRect(0, GROUND_Y + 30, CANVAS_WIDTH, 50);

    // Líneas de pista
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, GROUND_Y + 55);
      ctx.lineTo(i + 20, GROUND_Y + 55);
      ctx.stroke();
    }

    // Carro (usando imagen)
    const carImg = new Image();
    carImg.src = "/assets/cars/car-red.png";
    ctx.drawImage(
      carImg,
      50 + carPosition,
      GROUND_Y + 30 - CAR_HEIGHT,
      CAR_WIDTH,
      CAR_HEIGHT
    );

    // Etiqueta de masa
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(50 + carPosition - 5, GROUND_Y + 30 - CAR_HEIGHT - 25, 90, 20);
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Masa = ${mass.toFixed(1)} kg`,
      50 + carPosition,
      GROUND_Y + 30 - CAR_HEIGHT - 10
    );

    // Flecha de fuerza (si se está aplicando)
    if (forceAppliedRef.current && time < duration) {
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.lineWidth = 3;
      const arrowStartX = 50 + carPosition - 20;
      const arrowEndX = arrowStartX - 60;
      const arrowY = GROUND_Y + 30 - CAR_HEIGHT / 2;

      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(arrowEndX, arrowY);
      ctx.stroke();

      // Punta de flecha
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(arrowStartX - 10, arrowY - 5);
      ctx.lineTo(arrowStartX - 10, arrowY + 5);
      ctx.closePath();
      ctx.fill();

      // Etiqueta de fuerza
      ctx.fillStyle = "red";
      ctx.font = "bold 14px Arial";
      ctx.fillText(`F = ${force} N`, arrowEndX - 40, arrowY - 10);
    }
  }, [carPosition, mass, force, duration, time]);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/10" />

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-black drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
          Impulso y Momento
        </h1>
        <div className="mx-auto mt-2 h-1 w-32 rounded-full bg-black/80" />
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel de controles (izquierda) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border-4 border-black bg-white/95 backdrop-blur-sm p-5 shadow-[6px_8px_0_#000]">
              <h2 className="text-xl font-extrabold mb-4">Controles</h2>

              <div className="space-y-5">
                {/* Magnitud de la Fuerza */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Magnitud De La Fuerza (N)
                  </label>
                  <Slider
                    value={[force]}
                    onValueChange={(vals) => setForce(vals[0])}
                    min={5}
                    max={50}
                    step={1}
                    disabled={isRunning}
                    className="mb-2"
                  />
                  <div className="text-center font-bold bg-slate-100 rounded p-2 border-2 border-black">
                    {force}
                  </div>
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Duración (s)
                  </label>
                  <Slider
                    value={[duration]}
                    onValueChange={(vals) => setDuration(vals[0])}
                    min={0.5}
                    max={5}
                    step={0.1}
                    disabled={isRunning}
                    className="mb-2"
                  />
                  <div className="text-center font-bold bg-slate-100 rounded p-2 border-2 border-black">
                    {duration.toFixed(1)}
                  </div>
                </div>

                {/* Botón Aplicar Fuerza */}
                <Button
                  onClick={applyForce}
                  disabled={isRunning}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl border-3 border-black shadow-[4px_4px_0_#000]"
                >
                  Aplicar Fuerza
                </Button>
              </div>
            </div>
          </div>

          {/* Panel central: Canvas + Datos */}
          <div className="lg:col-span-9 space-y-4">
            {/* Información de cálculos */}
            <div className="rounded-2xl border-4 border-black bg-white/95 backdrop-blur-sm p-5 shadow-[6px_8px_0_#000]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold">
                    Momento Inicial = {initialMomentum.toFixed(1)} kg*m/s
                  </p>
                </div>
                <div>
                  <p className="font-bold">
                    Impulso (I) = {impulse.toFixed(1)} N*s
                    <span className="ml-4">
                      {finalMomentum.toFixed(1)} kg*m/s
                    </span>
                    <span className="ml-2">Δt={duration.toFixed(1)}</span>
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm font-bold">
                Δp = momento final - momento inicial = {deltaMomentum.toFixed(1)} (kg*m/s)
                <span className="ml-4">
                  {finalMomentum.toFixed(1)} = {deltaMomentum.toFixed(1)} ✓
                </span>
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-2xl border-4 border-black bg-white/95 backdrop-blur-sm p-4 shadow-[6px_8px_0_#000] flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-2 border-slate-300 rounded-lg"
              />
            </div>

            {/* Botones de control */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={reset}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl border-3 border-black shadow-[4px_4px_0_#000]"
              >
                Inicio
              </Button>
              <Button
                onClick={togglePause}
                disabled={!isRunning}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl border-3 border-black shadow-[4px_4px_0_#000]"
              >
                {isPaused ? "Reanudar" : "Pausa"}
              </Button>
              <Button
                onClick={reset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl border-3 border-black shadow-[4px_4px_0_#000]"
              >
                Reiniciar
              </Button>
            </div>

            {/* Botón Volver */}
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => navigate("/nivel/2/intro")}
                variant="secondary"
                className="bg-white/95 hover:bg-white text-slate-900 font-bold px-8 py-3 rounded-xl border-3 border-black shadow-[4px_4px_0_#000]"
              >
                Volver a Información
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
