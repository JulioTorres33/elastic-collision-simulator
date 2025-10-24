import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check, X } from "lucide-react";

/* ================= Configuración visual/física ================= */
const PIXELS_PER_METER = 40;
const CAR_VISUAL_WIDTH = 200;
const CAR_VISUAL_HEIGHT = 72;
const CAR_HIT_WIDTH = 20;
const ROAD_PADDING = 24;
const WHEEL_OFFSET = 6;
const ROAD_ALIGN_OFFSET = 16;
const DASH_TOP_OFFSET = 42;
const BUBBLE_OFFSET = 72;
const POST_COLLISION_RUN_MS = 1000;

// Alturas fijas aproximadas para layout sin scroll:
const HEADER_H = 90;   // título + margen superior
const BAR_H = 64;      // barra fija inferior

/* ================= Tipos ================= */
interface Car {
  mass: number;
  initialVelocity: number;
  currentVelocity: number;
  position: number;
  id: string;
  color: string;
}

/* ================= Componente ================= */
export function InelasticCollisionSimulator() {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCollided, setHasCollided] = useState(false);
  const [flash, setFlash] = useState(false);
  const [restitution, setRestitution] = useState(0.5); // Coeficiente de restitución

  const [carA, setCarA] = useState<Car>({
    mass: 4.0,
    initialVelocity: 10.0,
    currentVelocity: 10.0,
    position: 50,
    id: "A",
    color: "red",
  });
  const [carB, setCarB] = useState<Car>({
    mass: 4.0,
    initialVelocity: 10.0,
    currentVelocity: 10.0,
    position: 550,
    id: "B",
    color: "blue",
  });

  // Velocidades finales después del choque (para mostrar)
  const [finalVelocityA, setFinalVelocityA] = useState<number | null>(null);
  const [finalVelocityB, setFinalVelocityB] = useState<number | null>(null);

  const carARef = useRef(carA);
  const carBRef = useRef(carB);
  const hasCollidedRef = useRef(hasCollided);
  useEffect(() => { carARef.current = carA; }, [carA]);
  useEffect(() => { carBRef.current = carB; }, [carB]);
  useEffect(() => { hasCollidedRef.current = hasCollided; }, [hasCollided]);

  const containerRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const [laneTop, setLaneTop] = useState<number>(130);

  const animationRef = useRef<number>();
  const stopAtRef = useRef<number | null>(null);

  // Bloquear scroll del body mientras este componente está activo
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Cálculos antes del choque
  const p0 = carA.mass * carA.initialVelocity + carB.mass * carB.initialVelocity;
  const K0 = 0.5 * carA.mass * carA.initialVelocity ** 2 + 0.5 * carB.mass * carB.initialVelocity ** 2;

  // Cálculos después del choque
  const pf = hasCollided && finalVelocityA !== null && finalVelocityB !== null
    ? carA.mass * finalVelocityA + carB.mass * finalVelocityB
    : p0;
  const Kf = hasCollided && finalVelocityA !== null && finalVelocityB !== null
    ? 0.5 * carA.mass * finalVelocityA ** 2 + 0.5 * carB.mass * finalVelocityB ** 2
    : K0;
  const energyLost = K0 - Kf;

  
  useEffect(() => {
    const placeCars = () => {
      const w = containerRef.current?.clientWidth ?? 1000;
      const cx = w / 2;
      const gap = 250;
      setCarA((c) => ({ ...c, position: cx - gap }));
      setCarB((c) => ({ ...c, position: cx + gap }));

      const road = roadRef.current;
      const wrap = containerRef.current;
      if (road && wrap) {
        const roadRect = road.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const y = roadRect.top - wrapRect.top + roadRect.height / 2 - CAR_VISUAL_HEIGHT / 2 - WHEEL_OFFSET;
        setLaneTop(y);
      }
    };

    placeCars();
    let ro: any = null;
    const hasWindow = typeof window !== "undefined";
    const hasRO = hasWindow && (window as any).ResizeObserver;
    if (hasRO) {
      ro = new (window as any).ResizeObserver(placeCars);
      if (containerRef.current) ro.observe(containerRef.current);
    } else if (hasWindow) {
      window.addEventListener("resize", placeCars);
    }
    return () => {
      if (ro) {
        try {
          if (containerRef.current) ro.unobserve(containerRef.current);
          ro.disconnect();
        } catch {}
      } else if (hasWindow) {
        window.removeEventListener("resize", placeCars);
      }
    };
  }, []);

  /* ================== Animación con colisión inelástica ================== */
  useEffect(() => {
    if (!isPlaying) return;

    let last = performance.now();

    const step = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      let a = { ...carARef.current };
      let b = { ...carBRef.current };

      const nextAx = a.position + a.currentVelocity * PIXELS_PER_METER * dt;
      const nextBx = b.position + b.currentVelocity * PIXELS_PER_METER * dt;

      const approaching = (b.position - a.position) * (b.currentVelocity - a.currentVelocity) < 0;
      const overlap = Math.abs(nextAx - nextBx) <= CAR_HIT_WIDTH;

      if (!hasCollidedRef.current && approaching && overlap) {
        // Colisión inelástica con coeficiente de restitución
        const m1 = a.mass, m2 = b.mass;
        const u1 = a.currentVelocity, u2 = b.currentVelocity;
        const e = restitution;

        // Velocidades finales con coeficiente de restitución
        const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
        const v2 = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / (m1 + m2);

        const mid = (nextAx + nextBx) / 2;
        a.position = mid - CAR_HIT_WIDTH / 2;
        b.position = mid + CAR_HIT_WIDTH / 2;

        a.currentVelocity = v1;
        b.currentVelocity = v2;

        setCarA(a);
        setCarB(b);
        setFinalVelocityA(v1);
        setFinalVelocityB(v2);

        setHasCollided(true);
        hasCollidedRef.current = true;
        setFlash(true);
        setTimeout(() => setFlash(false), 220);
        stopAtRef.current = t + POST_COLLISION_RUN_MS;
      } else {
        a.position = nextAx;
        b.position = nextBx;

        const w = containerRef.current?.clientWidth ?? 1000;
        const leftLimit = ROAD_PADDING + CAR_VISUAL_WIDTH / 2;
        const rightLimit = w - ROAD_PADDING - CAR_VISUAL_WIDTH / 2;

        if (a.position <= leftLimit && a.currentVelocity < 0) {
          a.position = leftLimit;
          a.currentVelocity = -a.currentVelocity;
        }
        if (a.position >= rightLimit && a.currentVelocity > 0) {
          a.position = rightLimit;
          a.currentVelocity = -a.currentVelocity;
        }
        if (b.position <= leftLimit && b.currentVelocity < 0) {
          b.position = leftLimit;
          b.currentVelocity = -b.currentVelocity;
        }
        if (b.position >= rightLimit && b.currentVelocity > 0) {
          b.position = rightLimit;
          b.currentVelocity = -b.currentVelocity;
        }

        setCarA(a);
        setCarB(b);
      }

      if (hasCollidedRef.current && stopAtRef.current && t >= stopAtRef.current) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setIsPlaying(false);
        stopAtRef.current = null;
        return;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, restitution]);

  /* ================== Handlers ================== */
  const setMassA = (m: number) => setCarA((c) => ({ ...c, mass: m }));
  const setMassB = (m: number) => setCarB((c) => ({ ...c, mass: m }));

  const setVA0 = (v: number) =>
    setCarA((c) => ({
      ...c,
      initialVelocity: v,
      currentVelocity: isPlaying ? c.currentVelocity : v,
    }));
  const setVB0 = (v: number) =>
    setCarB((c) => ({
      ...c,
      initialVelocity: v,
      currentVelocity: isPlaying ? c.currentVelocity : v,
    }));

  const start = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setHasCollided(false);
    hasCollidedRef.current = false;
    stopAtRef.current = null;
    setFinalVelocityA(null);
    setFinalVelocityB(null);

    const w = containerRef.current?.clientWidth ?? 1000;
    const cx = w / 2;
    const gap = 250;
    setCarA((c) => ({ ...c, position: cx - gap, currentVelocity: c.initialVelocity }));
    setCarB((c) => ({ ...c, position: cx + gap, currentVelocity: c.initialVelocity }));
  };

  /* ================== Helpers de render ================== */
  const xStyle = (x: number) => ({
    transform: `translateX(${x - CAR_VISUAL_WIDTH / 2}px)`,
  });

  const Bubble = ({ text }: { text: string }) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 rounded-2xl bg-white/90 border border-black/10 px-3 py-1 text-xs shadow"
      style={{ top: -BUBBLE_OFFSET }}
    >
      {text}
    </div>
  );

  
  return (
    <div
      className="h-screen w-screen overflow-hidden text-slate-900 relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Botón volver */}
      <div className="absolute left-4 top-4 z-20">
        <Button
          variant="secondary"
          className="bg-white/90 hover:bg-white border"
          onClick={() => navigate("/nivel/1/intro")}
        >
          ← Volver al inicio
        </Button>
      </div>

      {/* Título compacto */}
      <header className="pt-4" style={{ height: HEADER_H }}>
        <h1 className="text-center text-3xl md:text-4xl font-extrabold">Choque Inelástico</h1>
      </header>

      {/* Contenido con altura calculada para que no haya scroll */}
      <main
        className="mx-auto w-full max-w-6xl px-4"
        style={{
          height: `calc(100vh - ${HEADER_H + BAR_H}px)`,
          minHeight: 0,
        }}
      >
        <div className="grid h-full grid-rows-[auto_1fr] gap-3 md:gap-4">
          {/* Paneles (altura auto) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* === PANEL IZQUIERDO: A === */}
          <Card className="border-slate-300/60 bg-white/90 p-4">
            <h3 className="mb-2 font-semibold">Masa A (kg)</h3>
        <div className="flex items-center gap-2">
          <Slider value={[carA.mass]} min={1} max={10} step={0.5} onValueChange={(v) => setMassA(v[0])} className="flex-1" />
        <span className="min-w-[3rem] text-right font-mono text-sm">{carA.mass.toFixed(1)}</span>
    </div>

      <div className="mt-4">
        <h3 className="mb-2 font-semibold">Velocidad Inicial A (m/s)</h3>
        <div className="flex items-center gap-2">
          <Slider value={[carA.initialVelocity]} min={0} max={20} step={0.5} onValueChange={(v) => setVA0(v[0])} className="flex-1" />
          <span className="min-w-[3rem] text-right font-mono text-sm">{carA.initialVelocity.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 font-semibold">Inelástico (e)</h3>
        <div className="flex items-center gap-2">
          <Slider value={[restitution]} min={0} max={1} step={0.1} onValueChange={(v) => setRestitution(v[0])} className="flex-1" />
          <span className="min-w-[3rem] text-right font-mono text-sm">{restitution.toFixed(1)}</span>
        </div>
      </div>
    </Card>

    {/* === PANEL CENTRAL: Conservación === */}
    <Card className="border-slate-300/60 bg-white/90 p-4">
      <h3 className="font-semibold mb-3">Conservación del momento y energía cinética</h3>
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold mb-2">
        <div className="text-center">Antes</div>
        <div className="text-center">Después</div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">
            {p0.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md border bg-white/70 px-2 py-2 text-sm">
            {pf.toFixed(1)}
            {hasCollided && Math.abs(p0 - pf) < 0.1 && <Check className="w-4 h-4 text-green-600" />}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">
            {K0.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md border bg-white/70 px-2 py-2 text-sm">
            {Kf.toFixed(1)}
            {hasCollided && Math.abs(K0 - Kf) > 0.1 && <X className="w-4 h-4 text-red-600" />}
          </div>
        </div>
      </div>
      {hasCollided && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
          Energía Cinética Inicial (J): {K0.toFixed(1)}<br />
          Energía Cinética Final (J): {Kf.toFixed(1)}<br />
          Energía Perdida: {energyLost.toFixed(1)} J
        </div>
    )}
  </Card>

  {/* === PANEL DERECHO: B (Masa + Velocidad B) === */}
  <Card className="border-slate-300/60 bg-white/90 p-4">
    <h3 className="mb-2 font-semibold">Masa B (kg)</h3>
    <div className="flex items-center gap-2">
      <Slider value={[carB.mass]} min={1} max={10} step={0.5} onValueChange={(v) => setMassB(v[0])} className="flex-1" />
      <span className="min-w-[3rem] text-right font-mono text-sm">{carB.mass.toFixed(1)}</span>
    </div>

    <div className="mt-4">
  <h3 className="mb-2 font-semibold">
    Velocidad Inicial B (m/s)
    <span className="ml-2 text-xs font-normal text-slate-600"></span>
  </h3>
  <div className="flex items-center gap-2">
    {/* Permitimos valores negativos para ir hacia atrás */}
    <Slider
      value={[carB.initialVelocity]}
      min={-20}
      max={20}
      step={0.5}
      onValueChange={(v) => setVB0(v[0])}
      className="flex-1"
    />
    <span className="min-w-[3.5rem] text-right font-mono text-sm">
      {carB.initialVelocity.toFixed(1)}
    </span>
  </div>
</div>

  </Card>
</div>

          {/* Escena (toma el resto del alto) */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-b from-sky-200/50 to-sky-300/50"
          >
            {flash && <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 animate-pulse" />}

            <div
              ref={roadRef}
              className="absolute left-0 right-0 h-32 bg-neutral-700"
              style={{
                top: `calc(50% + ${ROAD_ALIGN_OFFSET}px)`,
                transform: "translateY(-50%)",
                paddingLeft: ROAD_PADDING,
                paddingRight: ROAD_PADDING,
              }}
            >
              <div className="mx-8 flex h-1 justify-between" style={{ marginTop: DASH_TOP_OFFSET }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-1 w-24 bg-yellow-300" />
                ))}
              </div>
            </div>

            {/* Indicador de velocidad final */}
            {hasCollided && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 border-2 border-black rounded-lg px-4 py-2 text-sm font-semibold shadow-lg">
                Vfinal = {((((finalVelocityA || 0) + (finalVelocityB || 0)) / 2)).toFixed(2)} m/s
              </div>
            )}

            {/* Carros */}
            <div
              className="absolute pointer-events-none select-none"
              style={{ top: laneTop, width: CAR_VISUAL_WIDTH, height: CAR_VISUAL_HEIGHT, ...xStyle(carA.position) }}
            >
              <img src="/assets/cars/car-red.png" alt="Carro A" className="h-full w-auto drop-shadow-lg" draggable={false} />
              <Bubble text={`m = ${carA.mass.toFixed(1)} kg  •  V(A) = ${carA.currentVelocity.toFixed(1)} m/s`} />
            </div>

            <div
              className="absolute pointer-events-none select-none"
              style={{ top: laneTop, width: CAR_VISUAL_WIDTH, height: CAR_VISUAL_HEIGHT, ...xStyle(carB.position) }}
            >
              <img src="/assets/cars/car-blue.png" alt="Carro B" className="h-full w-auto drop-shadow-lg" draggable={false} />
              <Bubble text={`m = ${carB.mass.toFixed(1)} kg  •  V(B) = ${carB.currentVelocity.toFixed(1)} m/s`} />
            </div>
          </div>
        </div>
      </main>

      {/* Barra fija inferior */}
      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3"
        style={{ height: BAR_H }}
      >
        <div className="hidden md:block rounded-md border bg-white/90 px-3 py-1 text-sm font-medium text-slate-800 shadow">
          {hasCollided ? "¡Colisión realizada!" : isPlaying ? "Simulando…" : "Listo para colisionar."}
        </div>
        <Button onClick={start} className="bg-emerald-600 hover:bg-emerald-700">Inicio</Button>
        <Button onClick={pause} variant="secondary">Pausa</Button>
        <Button onClick={reset} variant="destructive">Reiniciar</Button>
      </div>
    </div>
  );
}

export default InelasticCollisionSimulator;
