import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type ScenarioKey = "1" | "2" | "3";

// Altura del header (baja para ganar espacio)
const HEADER_H = 68;

// Catálogo de escenarios
const SCENARIOS: Record<
  ScenarioKey,
  {
    title: string;
    cover: string;
    description: string;
    instructions: string[];
    learning: string;
    startRoute: (level: string | undefined) => string;
    badge: string;
    colorCard: string;   // color para la tarjeta del sidebar cuando está seleccionada
    startBtn: string;    // clases del botón Iniciar
    selectBtn?: string;  // clases del botón Seleccionado
  }
> = {
  "1": {
    title: "Nivel 1: Choque Elástico",
    cover: "/assets/cars/choque-directo.png",
    description:
      "Dos objetos se mueven en un plano unidimensional (una pista) y chocan de frente. La colisión es perfectamente elástica: se conservan el momento lineal total y la energía cinética total del sistema.",
    instructions: [
      "Ajusta masa (kg) y velocidad inicial (m/s) con los deslizadores.",
      "Presiona «Iniciar» para ver el choque.",
      "Compara el momento total y la energía cinética total antes y después del choque.",
    ],
    learning:
      "En una colisión elástica: Ptotal,inicial = Ptotal,final y Ktotal,inicial = Ktotal,final.",
    startRoute: (level) => `/nivel/${level ?? "1"}/jugar`,
    badge: "Choque Elástico",
    colorCard: "border-emerald-700 bg-emerald-100",
    startBtn: "bg-red-600 hover:bg-red-700",
    selectBtn: "bg-emerald-600 hover:bg-emerald-700",
  },
  "2": {
    title: "Nivel 1: Choque Inelástico",
    cover: "/assets/cars/choque-inelastico.png",
    description:
      "Tras el impacto, los objetos quedan unidos y se mueven como un solo sistema con una velocidad final común. El momento se conserva, pero la energía cinética total disminuye.",
    instructions: [
      "Configura las masas y velocidades iniciales de los dos carritos.",
      "Antes de iniciar, predice Vᶠ = (m₁v₁ + m₂v₂)/(m₁ + m₂).",
      "Inicia y compara la velocidad real con tu predicción.",
    ],
    learning:
      "En choques inelásticos se conserva el momento lineal total, pero no la energía cinética total.",
    startRoute: () => `/nivel/1/escenario/2`,
    badge: "Choque Inelástico",
    colorCard: "border-blue-700 bg-blue-100",
    startBtn: "bg-blue-600 hover:bg-blue-700",
    selectBtn: "bg-blue-600 hover:bg-blue-700",
  },
  "3": {
    title: "Nivel 1: Rebota en la Pared",
    cover: "/assets/cars/rebote-pared.png", // pon aquí tu portada específica si la tienes
    description:
      "Un carrito se mueve en una pista 1D, choca contra una pared fija y rebota. Analiza cómo cambia el momento lineal del carrito al interactuar con un objeto de masa mucho mayor (la pared) y cómo el impulso se relaciona con ese cambio.",
    instructions: [
      "Ajusta la masa y la velocidad inicial del carrito.",
      "Inicia la simulación para ver el choque contra la pared y el rebote.",
      "Observa la velocidad inicial, la velocidad final, el cambio de momento (Δp) y los momentos antes/después.",
      "Nota cómo la dirección de la velocidad y del momento se invierten tras el rebote.",
    ],
    learning:
      "El cambio de momento del carrito es igual al impulso ejercido por la pared. Aunque el sistema «carrito+pared» conserva el momento, el carrito individual cambia su momento por la fuerza externa.",
    startRoute: () => `/nivel/1/escenario/3`,
    badge: "Rebote en Pared",
    colorCard: "border-indigo-700 bg-indigo-100",
    startBtn: "bg-indigo-600 hover:bg-indigo-700",
    selectBtn: "bg-indigo-600 hover:bg-indigo-700",
  },
};

export default function LevelInfo() {
  const navigate = useNavigate();
  const { level } = useParams();

  const [selected, setSelected] = useState<ScenarioKey | null>(null);
  const data = useMemo(() => (selected ? SCENARIOS[selected] : null), [selected]);

  // seleccionar/deseleccionar (toggle)
  const toggleSelect = (key: ScenarioKey) =>
    setSelected((prev) => (prev === key ? null : key));

  // Bloquear scroll para pantalla fija
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const start = () => {
    if (!selected || !data) return;
    navigate(data.startRoute(level));
  };

  const back = () => navigate("/home");
  const reset = () => setSelected(null);

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/10" />

      {/* Header */}
      <header className="relative z-10 pt-3" style={{ height: HEADER_H }}>
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-black drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
          {data ? data.title : "Nivel 1: Selecciona un escenario"}
        </h1>
        <div className="mx-auto mt-1.5 h-1 w-28 rounded-full bg-black/80" />
      </header>

      {/* Contenido + Sidebar */}
      <main
        className="relative z-10 mx-auto px-4 max-w-6xl"
        style={{ height: `calc(100vh - ${HEADER_H}px)` }}
      >
        <div className="grid h-full grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Panel central */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-4 overflow-hidden">
            {/* Imagen (reducida) */}
            <section className="flex items-center justify-center shrink-0 mt-0">
              {data ? (
                <img
                  src={data.cover}
                  alt={data.badge}
                  className="
                    select-none pointer-events-none mx-auto object-contain w-auto
                    max-h-[140px] sm:max-h-[160px] md:max-h-[170px] lg:max-h-[180px]
                    drop-shadow-[4px_7px_0_rgba(0,0,0,0.55)] rounded-lg
                  "
                />
              ) : (
                <div className="rounded-2xl border-4 border-dashed border-black/60 bg-white/70 px-6 py-8 text-center">
                  <p className="font-semibold">Selecciona un escenario en el panel derecho</p>
                </div>
              )}
            </section>

            {/* Descripción */}
            <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-[6px_8px_0_#000]">
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-2">
                Descripción del Nivel
              </h2>
              <p className="text-[14px] md:text-[15px] leading-relaxed text-slate-800 min-h-[60px]">
                {data
                  ? data.description
                  : "Aquí verás la descripción del escenario una vez lo selecciones."}
              </p>
            </section>

            {/* Instrucciones / Aprendizaje */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-[6px_8px_0_#000]">
                <h2 className="text-base md:text-lg font-extrabold tracking-tight mb-2">
                  Instrucciones
                </h2>
                {data ? (
                  <ol className="text-[14px] md:text-[15px] leading-relaxed text-slate-800 list-decimal ml-5 space-y-1.5">
                    {data.instructions.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-[14px] text-slate-600">
                    Selecciona un escenario para ver sus pasos.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-[6px_8px_0_#000]">
                <h2 className="text-base md:text-lg font-extrabold tracking-tight mb-2">
                  Aprendizaje
                </h2>
                <p className="text-[14px] md:text-[15px] leading-relaxed text-slate-800 min-h-[48px]">
                  {data
                    ? data.learning
                    : "Aquí aparecerá lo que aprenderás en el escenario seleccionado."}
                </p>
              </section>
            </div>

            <div className="grow" />
          </div>

          {/* Sidebar derecha: selección + iniciar */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-4 flex flex-col gap-4">
              {(["1", "2", "3"] as ScenarioKey[]).map((key) => {
                const card = SCENARIOS[key];
                const isSel = selected === key;
                return (
                  <div
                    key={key}
                    className={`rounded-2xl border-4 shadow-[6px_8px_0_#000] p-4 transition ${
                      isSel ? card.colorCard : "border-black bg-white/90"
                    }`}
                  >
                    <h3 className="font-extrabold text-lg mb-1">Escenario {key}</h3>
                    <p className="text-sm text-slate-700 -mt-1 mb-3">{card.badge}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleSelect(key)}
                        variant={isSel ? "default" : "secondary"}
                        className={isSel && card.selectBtn ? card.selectBtn : ""}
                        title={isSel ? "Clic para deseleccionar" : "Seleccionar"}
                      >
                        {isSel ? "Seleccionado" : "Seleccionar"}
                      </Button>
                      {isSel ? (
                        <Button onClick={start} className={card.startBtn}>
                          Iniciar
                        </Button>
                      ) : (
                        <Button disabled variant="secondary" className="opacity-60">
                          Iniciar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Acciones */}
              <div className="rounded-2xl border-4 border-black bg-white/90 shadow-[6px_8px_0_#000] p-4 space-y-2">
                <Button
                  onClick={back}
                  variant="secondary"
                  className="w-full bg-white/95 hover:bg-white text-slate-900"
                >
                  Volver
                </Button>
                <Button
                  onClick={reset}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                >
                  Reiniciar selección
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
