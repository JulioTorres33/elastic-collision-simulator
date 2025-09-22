import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

/* ================= Configuración visual/física ================= */
const PIXELS_PER_METER = 40;      // m/s -> px/s
const CAR_VISUAL_WIDTH = 200;     // ancho visual PNG (px)
const CAR_VISUAL_HEIGHT = 72;     // alto visual (px)
const CAR_HIT_WIDTH = 80;         // ancho efectivo de colisión (px)
const ROAD_PADDING = 24;
const WHEEL_OFFSET = 6;

// Alinear carretera con el arte del fondo
const ROAD_ALIGN_OFFSET = 16;     // ajusta a tu gusto (16 recomendado)
const DASH_TOP_OFFSET = 42;       // 42 recomendado

// Globos más arriba del auto
const BUBBLE_OFFSET = 72;

// Tras el primer choque, cuánto tiempo dejar correr para ver el rebote
const POST_COLLISION_RUN_MS = 1000;

/* ================= Tipos ================= */
interface Car {
  mass: number;
  initialVelocity: number;   // v0 (m/s)
  currentVelocity: number;   // v (m/s)
  position: number;          // px, centro del carro en X
  id: string;
  color: string;
}

/* ================= Componente ================= */
export function CollisionSimulator() {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCollided, setHasCollided] = useState(false);
  const [flash, setFlash] = useState(false);

  // Config por defecto: A hacia +X, B hacia -X para asegurar choque
  const [carA, setCarA] = useState<Car>({
    mass: 4.0,
    initialVelocity: 5.0,
    currentVelocity: 5.0,
    position: 220,
    id: "A",
    color: "red",
  });
  const [carB, setCarB] = useState<Car>({
    mass: 4.0,
    initialVelocity: -3.0,
    currentVelocity: -3.0,
    position: 780,
    id: "B",
    color: "blue",
  });

  // Refs para leer SIEMPRE el estado más reciente dentro del RAF
  const carARef = useRef(carA);
  const carBRef = useRef(carB);
  const hasCollidedRef = useRef(hasCollided);
  useEffect(() => { carARef.current = carA; }, [carA]);
  useEffect(() => { carBRef.current = carB; }, [carB]);
  useEffect(() => { hasCollidedRef.current = hasCollided; }, [hasCollided]);

  // Layout
  const containerRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const [laneTop, setLaneTop] = useState<number>(130);

  // RAF / parada diferida tras el primer choque
  const animationRef = useRef<number>();
  const stopAtRef = useRef<number | null>(null);

  // Magnitudes antes del choque (con v0)
  const p0 = carA.mass * carA.initialVelocity + carB.mass * carB.initialVelocity;
  const K0 =
    0.5 * carA.mass * carA.initialVelocity ** 2 +
    0.5 * carB.mass * carB.initialVelocity ** 2;

  /* ============ Centramos autos y calculamos Y del carril ============ */
  useEffect(() => {
    const placeCars = () => {
      const w = containerRef.current?.clientWidth ?? 1000;
      const cx = w / 2;
      const gap = 200;
      setCarA((c) => ({ ...c, position: cx - gap }));
      setCarB((c) => ({ ...c, position: cx + gap }));

      const road = roadRef.current;
      const wrap = containerRef.current;
      if (road && wrap) {
        const roadRect = road.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const y =
          roadRect.top - wrapRect.top +
          roadRect.height / 2 -
          CAR_VISUAL_HEIGHT / 2 -
          WHEEL_OFFSET;
        setLaneTop(y);
      }
    };

    placeCars();

    // Observer seguro (fallback a resize)
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

  /* ================== Animación — un solo choque con post-rebote ================== */
  useEffect(() => {
    if (!isPlaying) return;

    let last = performance.now();

    const step = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      let a = { ...carARef.current };
      let b = { ...carBRef.current };

      // Predicción de este frame
      const nextAx = a.position + a.currentVelocity * PIXELS_PER_METER * dt;
      const nextBx = b.position + b.currentVelocity * PIXELS_PER_METER * dt;

      const approaching =
        (b.position - a.position) * (b.currentVelocity - a.currentVelocity) < 0;
      const overlap = Math.abs(nextAx - nextBx) <= CAR_HIT_WIDTH;

      if (!hasCollidedRef.current && approaching && overlap) {
        // Resolver choque elástico 1D
        const m1 = a.mass, m2 = b.mass;
        const u1 = a.currentVelocity, u2 = b.currentVelocity;
        const v1 = ((m1 - m2) / (m1 + m2)) * u1 + ((2 * m2) / (m1 + m2)) * u2;
        const v2 = ((2 * m1) / (m1 + m2)) * u1 + ((m2 - m1) / (m1 + m2)) * u2;

        // Posicionarlos en el punto de contacto
        const mid = (nextAx + nextBx) / 2;
        a.position = mid - CAR_HIT_WIDTH / 2;
        b.position = mid + CAR_HIT_WIDTH / 2;

        a.currentVelocity = v1;
        b.currentVelocity = v2;

        setCarA(a);
        setCarB(b);

        // Marcar choque, flash, y programar parada diferida
        setHasCollided(true);
        hasCollidedRef.current = true;
        setFlash(true);
        setTimeout(() => setFlash(false), 220);
        stopAtRef.current = t + POST_COLLISION_RUN_MS;
      } else {
        // Movimiento normal
        a.position = nextAx;
        b.position = nextBx;

        // Bordes laterales (rebote simple)
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

      // Parar tras el tiempo de post-rebote
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
  }, [isPlaying]);

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

    const w = containerRef.current?.clientWidth ?? 1000;
    const cx = w / 2;
    const gap = 200;
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

  /* ================== UI ================== */
  return (
    <div
      className="min-h-screen w-full text-slate-900 relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Botón volver al Home */}
      <div className="absolute left-4 top-4 z-20">
        <Button
          variant="secondary"
          className="bg-white/90 hover:bg-white border"
          onClick={() => navigate("/")}
        >
          ← Volver al inicio
        </Button>
      </div>

      <h1 className="text-center pt-6 text-4xl font-extrabold">Choque Directo</h1>
      <p className="text-center text-slate-700">Simulación de Colisión Elástica</p>

      {/* Paneles */}
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-3">
        <Card className="border-slate-300/60 bg-white/90 p-5">
          <h3 className="mb-2 font-semibold">Masa A (kg)</h3>
          <Slider value={[carA.mass]} min={1} max={10} step={0.5} onValueChange={(v) => setMassA(v[0])} />
          <div className="mt-4">
            <h3 className="mb-2 font-semibold">Velocidad Inicial A (m/s)</h3>
            <Slider value={[carA.initialVelocity]} min={-10} max={10} step={0.5} onValueChange={(v) => setVA0(v[0])} />
          </div>
        </Card>

        <Card className="border-slate-300/60 bg-white/90 p-5">
          <h3 className="font-semibold">Conservación del momento y la energía cinética</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md border bg-white/70 px-3 py-2">
              <span>Momento Total (Kg·m/s):</span>
              <span className="font-semibold">{p0.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-white/70 px-3 py-2">
              <span>Energía Cinética Total (J):</span>
              <span className="font-semibold">{K0.toFixed(1)}</span>
            </div>
          </div>
        </Card>

        <Card className="border-slate-300/60 bg-white/90 p-5">
          <h3 className="mb-2 font-semibold">Masa B (kg)</h3>
          <Slider value={[carB.mass]} min={1} max={10} step={0.5} onValueChange={(v) => setMassB(v[0])} />
          <div className="mt-4">
            <h3 className="mb-2 font-semibold">Velocidad Inicial B (m/s)</h3>
            <Slider value={[carB.initialVelocity]} min={-10} max={10} step={0.5} onValueChange={(v) => setVB0(v[0])} />
          </div>
        </Card>
      </div>

      {/* Escena */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-6 h-[260px] max-w-6xl overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-b from-sky-200/50 to-sky-300/50"
      >
        {/* flash de colisión */}
        {flash && <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 animate-pulse" />}

        {/* Carretera alineada con el fondo */}
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

        {/* Carro A */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ top: laneTop, width: CAR_VISUAL_WIDTH, height: CAR_VISUAL_HEIGHT, ...xStyle(carA.position) }}
        >
          <img src="/assets/cars/car-red.png" alt="Carro A" className="h-full w-auto drop-shadow-lg" draggable={false} />
          <Bubble text={`m = ${carA.mass.toFixed(1)} kg  •  V(A) = ${carA.currentVelocity.toFixed(1)} m/s`} />
        </div>

        {/* Carro B */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ top: laneTop, width: CAR_VISUAL_WIDTH, height: CAR_VISUAL_HEIGHT, ...xStyle(carB.position) }}
        >
          <img src="/assets/cars/car-blue.png" alt="Carro B" className="h-full w-auto drop-shadow-lg" draggable={false} />
          <Bubble text={`m = ${carB.mass.toFixed(1)} kg  •  V(B) = ${carB.currentVelocity.toFixed(1)} m/s`} />
        </div>
      </div>

      {/* Controles inferiores (esquina inferior derecha) */}
      <div className="mx-auto mt-6 max-w-6xl px-4 pb-10">
        <div className="flex items-center justify-end gap-3">
          <div
            className="hidden md:block rounded-md border bg-white/90 px-3 py-1 text-sm font-medium text-slate-800 shadow"
            aria-live="polite"
          >
            {hasCollided
              ? "¡Colisión realizada! (mostrando rebote…)"
              : isPlaying
              ? "Simulando…"
              : "Listo para colisionar."}
          </div>

          <Button onClick={start} className="bg-emerald-600 hover:bg-emerald-700">Inicio</Button>
          <Button onClick={pause} variant="secondary">Pausa</Button>
          <Button onClick={reset} variant="destructive">Reiniciar</Button>
        </div>

        {/* En móviles el mensaje pasa debajo */}
        <div className="mt-2 block text-right md:hidden" aria-live="polite">
          <span className="inline-block rounded-md border bg-white/90 px-3 py-1 text-sm font-medium text-slate-800 shadow">
            {hasCollided
              ? "¡Colisión realizada! (mostrando rebote…)"
              : isPlaying
              ? "Simulando…"
              : "Listo para colisionar."}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CollisionSimulator;
