import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";

/* ================= Configuración visual ================= */
const PIXELS_PER_METER = 40;
const CAR_VISUAL_WIDTH = 200;
const CAR_VISUAL_HEIGHT = 72;
const ROAD_PADDING = 24;
const WHEEL_OFFSET = 6;
const ROAD_ALIGN_OFFSET = 16;
const DASH_TOP_OFFSET = 42;
const BUBBLE_OFFSET = 72;
const POST_REBOUND_RUN_MS = 1000;

/* ================= Componente ================= */
export default function WallBounceSimulator() {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [flash, setFlash] = useState(false);

  const [mass, setMass] = useState(2.0);
  const [v0, setV0] = useState(3.0); // m/s
  const [v, setV] = useState(0);     // velocidad actual
  const [x, setX] = useState(0);     // posición (px)

  const [laneTop, setLaneTop] = useState<number>(130);
  const [wallX, setWallX] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const stopAtRef = useRef<number | null>(null);

  // quitar scroll general de la página mientras está esta vista
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ============ Posiciones iniciales (auto más adelante y pared más visible) ============ */
  useEffect(() => {
    const place = () => {
      const wrapW = containerRef.current?.clientWidth ?? 1000;

      // Auto inicia MÁS ADELANTE (30% del ancho)
      setX(wrapW * 0.30);

      // Pared un poco más a la derecha (85% del rango útil) y muy visible
      const left = ROAD_PADDING + CAR_VISUAL_WIDTH / 2;
      const right = wrapW - ROAD_PADDING - CAR_VISUAL_WIDTH / 2;
      const wall = left + (right - left) * 0.85;
      setWallX(wall);

      // Alinear verticalmente el carril
      const road = roadRef.current;
      const wrap = containerRef.current;
      if (road && wrap) {
        const roadRect = road.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const y =
          roadRect.top - wrapRect.top + roadRect.height / 2 - CAR_VISUAL_HEIGHT / 2 - WHEEL_OFFSET;
        setLaneTop(y);
      }
    };

    place();
    let ro: any = null;
    const hasWindow = typeof window !== "undefined";
    const hasRO = hasWindow && (window as any).ResizeObserver;
    if (hasRO) {
      ro = new (window as any).ResizeObserver(place);
      if (containerRef.current) ro.observe(containerRef.current);
    } else if (hasWindow) {
      window.addEventListener("resize", place);
    }
    return () => {
      if (ro) {
        try {
          if (containerRef.current) ro.unobserve(containerRef.current);
          ro.disconnect();
        } catch {}
      } else if (hasWindow) {
        window.removeEventListener("resize", place);
      }
    };
  }, []);

  /* ================== Animación (rebote elástico con pared) ================== */
  useEffect(() => {
    if (!isPlaying) return;

    let last = performance.now();

    const step = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      let nx = x + v * PIXELS_PER_METER * dt;

      // límites laterales de seguridad
      const w = containerRef.current?.clientWidth ?? 1000;
      const leftLimit = ROAD_PADDING + CAR_VISUAL_WIDTH / 2;
      const rightLimit = w - ROAD_PADDING - CAR_VISUAL_WIDTH / 2;

      // nariz del auto
      const noseX = nx + CAR_VISUAL_WIDTH / 2;

      // choque con la pared (rebote elástico perfecto)
      if (v > 0 && noseX >= wallX) {
        nx = wallX - CAR_VISUAL_WIDTH / 2;
        setV((cur) => -cur);
        setFlash(true);
        setTimeout(() => setFlash(false), 180);
        stopAtRef.current = t + POST_REBOUND_RUN_MS;
      }

      // rebotes de seguridad en extremos
      if (nx <= leftLimit && v < 0) {
        nx = leftLimit;
        setV((cur) => -cur);
      }
      if (nx >= rightLimit && v > 0) {
        nx = rightLimit;
        setV((cur) => -cur);
      }

      setX(nx);

      if (stopAtRef.current && t >= stopAtRef.current) {
        cancelAnimationFrame(animationRef.current!);
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
  }, [isPlaying, v, wallX, x]);

  /* ================== Handlers ================== */
  const start = () => {
    if (isPlaying) return;
    setV(v0);
    setIsPlaying(true);
  };
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    stopAtRef.current = null;
    setV(0);
    const wrapW = containerRef.current?.clientWidth ?? 1000;
    // vuelve a iniciar más adelante (30%)
    setX(wrapW * 0.30);
  };

  // Panel de cálculo (momento/energía)
  const p0 = mass * v0;
  const pnow = mass * v;
  const dp = pnow - p0;
  const K0 = 0.5 * mass * v0 ** 2;
  const K = 0.5 * mass * Math.abs(v) ** 2;

  /* ================== Helpers de render ================== */
  const xStyle = (px: number) => ({
    transform: `translateX(${px - CAR_VISUAL_WIDTH / 2}px)`,
  });

  const Bubble = ({ text }: { text: string }) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 rounded-2xl bg-white/95 border border-black/10 px-3 py-1 text-xs shadow"
      style={{ top: -BUBBLE_OFFSET }}
    >
      {text}
    </div>
  );

  /* ================== UI ================== */
  return (
    <div
      className="h-screen overflow-hidden w-full text-slate-900 relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute left-4 top-4 z-20">
        <Button
          variant="secondary"
          className="bg-white/90 hover:bg-white border"
          onClick={() => navigate("/nivel/1/intro")}
        >
          ← Volver al inicio
        </Button>
      </div>

      <h1 className="text-center pt-6 text-4xl font-extrabold">Rebota en la Pared</h1>

      {/* Paneles superiores */}
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-3">
        {/* Controles */}
        <Card className="border-slate-300/60 bg-white/90 p-5">
          <h3 className="mb-2 font-semibold">Masa (kg)</h3>
          <div className="flex items-center gap-2">
            <Slider value={[mass]} min={0.5} max={10} step={0.1} onValueChange={(v) => !isPlaying && setMass(v[0])} className="flex-1" />
            <span className="min-w-[3rem] text-right font-mono text-sm">{mass.toFixed(1)}</span>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 font-semibold">Velocidad Inicial (m/s)</h3>
            <div className="flex items-center gap-2">
              <Slider value={[v0]} min={0.5} max={12} step={0.1} onValueChange={(val) => !isPlaying && setV0(val[0])} className="flex-1" />
              <span className="min-w-[3rem] text-right font-mono text-sm">{v0.toFixed(1)}</span>
            </div>
          </div>
        </Card>

        {/* Conservación */}
        <Card className="border-slate-300/60 bg-white/90 p-5">
          <h3 className="font-semibold mb-3">Conservación del momento y energía cinética</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold mb-2">
            <div className="text-center">Antes</div>
            <div className="text-center">Ahora</div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">{p0.toFixed(1)}</div>
              <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">{pnow.toFixed(1)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">{K0.toFixed(1)}</div>
              <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">{K.toFixed(1)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">Δp</div>
              <div className="flex items-center justify-center rounded-md border bg-white/70 px-2 py-2 text-sm">{dp.toFixed(1)}</div>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="border-slate-300/60 bg-white/90 p-5">
          <h3 className="font-semibold mb-2">Ley del Rebote</h3>
          <p className="text-sm text-slate-700">
            En un rebote elástico con pared fija, la rapidez se mantiene y el sentido se invierte:
            <span className="font-bold"> v<sub>f</sub> = -v<sub>i</sub></span>.
          </p>
        </Card>
      </div>

      {/* Escena */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-6 h-[260px] max-w-6xl overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-b from-sky-200/50 to-sky-300/50"
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

        {/* PARED MUY VISIBLE */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: wallX - 14,             // centrado
            width: 28,                    // más ancha
            height: 140,                  // más alta
            border: "3px solid #000",
            borderRadius: 6,
            boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
            background:
              "repeating-linear-gradient(0deg,#ffb04d 0 12px,#ff8a3d 12px 24px), repeating-linear-gradient(90deg,transparent 0 10px, rgba(0,0,0,.08) 10px 12px)",
          }}
          aria-label="pared"
        />

        {/* Auto */}
        <div
  className="absolute pointer-events-none select-none"
  style={{ top: laneTop, width: CAR_VISUAL_WIDTH, height: CAR_VISUAL_HEIGHT, ...xStyle(x) }}
>
  <img
    src="/assets/cars/car-blue.png"
    alt="Carro"
    className="h-full w-auto drop-shadow-lg"
    style={{ transform: "scaleX(-1)" }}  // ← espejado para mirar a la derecha
    draggable={false}
  />
  <Bubble text={`m = ${mass.toFixed(1)} kg  •  v = ${v.toFixed(1)} m/s`} />
</div>
      </div>

      {/* Botonera inferior */}
      <div className="mx-auto mt-6 max-w-6xl px-4 pb-10">
        <div className="flex items-center justify-end gap-3">
          <div className="hidden md:block rounded-md border bg-white/90 px-3 py-1 text-sm font-medium text-slate-800 shadow">
            {isPlaying ? "Simulando…" : "Listo para rebotar."}
          </div>
          <Button onClick={start} className="bg-emerald-600 hover:bg-emerald-700">Inicio</Button>
          <Button onClick={pause} variant="secondary">Pausa</Button>
          <Button onClick={reset} variant="destructive">Reiniciar</Button>
        </div>
      </div>
    </div>
  );
}
