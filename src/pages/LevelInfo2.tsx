import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  cover: string;
  description: string;
  instructions: string[];
  learning: string;
};

const SCENARIOS_LEVEL_2: Scenario[] = [
  {
    id: "n2s1",
    title: "Escenario 1",
    subtitle: "Impulso y Momento",
    route: "/nivel/2/escenario/1",
    cover: "/assets/cars/choque-impulso.png",
    description:
      "Un objeto recibe una fuerza durante un intervalo Δt; el impulso I = F·Δt es igual al cambio de momento Δp. Ajusta la fuerza y la duración, aplica la fuerza y observa cómo la velocidad del objeto cambia.",
    instructions: [
      "Ajusta la magnitud de la fuerza (N) y la duración (s) con los deslizadores.",
      "Presiona Iniciar para aplicar la fuerza y ver cómo cambia la velocidad y el momento.",
      "Compara el impulso I con el cambio de momento Δp (deben coincidir).",
    ],
    learning:
      "Relacionar el área bajo la curva fuerza-tiempo con el cambio de momento lineal (Δp = I). Entender cómo una fuerza aplicada por un intervalo de tiempo modifica la velocidad de un objeto.",
  },
  // si quieres añadir más escenarios para el nivel 2 añádelos aquí
];

export default function LevelInfoLevel2() {
  const navigate = useNavigate();
  const scenarios = useMemo(() => SCENARIOS_LEVEL_2, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = scenarios.find((s) => s.id === selectedId) ?? null;

  const onSelect = (id: string) => setSelectedId(id);
  const onStart = (route: string) => {
    if (!selectedId) return;
    navigate(route);
  };
  const clearSelection = () => setSelectedId(null);
  const goBack = () => navigate("/home");

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
      <header className="relative z-10 pt-6">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-black drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
          Nivel 2: Teorema del Impulso y Momento
        </h1>

        {/* decoracion: linea corta debajo del titulo */}
        <div className="mx-auto mt-2 h-1 w-32 rounded-full bg-black/80" />
      </header>

      {/* Caja central "Selecciona un escenario..." con estilo punteado (misma forma que LevelInfoLevel1) */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex justify-center">
          <div
            className="rounded-xl bg-white/90 px-6 py-6 text-center"
            style={{
              width: "min(720px, 90%)",
              boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
              borderRadius: "18px",
              position: "relative",
            }}
          >
            <div
              className="mx-auto"
              style={{
                maxWidth: 640,
                border: "4px dashed rgba(0,0,0,0.45)",
                borderRadius: 12,
                padding: "18px 20px",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.03)",
              }}
            >
              <p className="text-sm text-slate-800 font-semibold">
                Selecciona un escenario en el panel derecho
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal: descripción y tarjetas, con panel derecho */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Centro: descripción + instrucciones/aprendizaje */}
        <section className="lg:col-span-8 space-y-4">
          <Card className="rounded-2xl border-4 border-black bg-white/90 p-6">
            <h2 className="text-lg font-extrabold mb-3">Descripción del Nivel</h2>
            <p className="text-[15px] leading-relaxed text-slate-800">
              {selected
                ? selected.description
                : "Aquí verás la descripción del escenario una vez lo selecciones."}
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-4 border-black bg-white/90 p-6">
              <h3 className="text-base font-extrabold mb-2">Instrucciones</h3>
              {selected ? (
                <ol className="list-decimal ml-5 space-y-2 text-[15px] leading-relaxed text-slate-800">
                  {selected.instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-slate-800">Selecciona un escenario para ver sus pasos.</p>
              )}
            </Card>

            <Card className="rounded-2xl border-4 border-black bg-white/90 p-6">
              <h3 className="text-base font-extrabold mb-2">Aprendizaje</h3>
              <p className="text-[15px] leading-relaxed text-slate-800">
                {selected ? selected.learning : "Aquí aparecerá lo que aprenderás en el escenario seleccionado."}
              </p>
            </Card>
          </div>
        </section>

        {/* Derecha: lista de escenarios y botones */}
        <aside className="lg:col-span-4 space-y-4">
          {scenarios.map((s) => {
            const isSel = selectedId === s.id;
            return (
              <div
                key={s.id}
                className={`rounded-2xl border-4 shadow-[6px_8px_0_#000] overflow-hidden ${
                  isSel ? "bg-emerald-50 border-emerald-700" : "bg-white/90 border-black/80"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold">{s.title}</h4>
                      <p className="text-sm text-slate-700">{s.subtitle}</p>
                    </div>

                    <div className="text-right">
                      {isSel ? (
                        <div className="rounded-md bg-emerald-600 text-white px-3 py-1 text-sm font-semibold shadow">
                          Seleccionado
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={() => onSelect(s.id)}
                      className={`px-4 py-2 text-sm ${
                        isSel ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-cyan-100 hover:bg-cyan-200 text-slate-900"
                      }`}
                    >
                      {isSel ? "Seleccionado" : "Seleccionar"}
                    </Button>

                    <Button
                      onClick={() => onStart(s.route)}
                      disabled={!isSel}
                      className={`px-4 py-2 text-sm ${
                        isSel ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Iniciar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border-4 border-black bg-white/90 p-4 shadow-[6px_8px_0_#000]">
            <div className="flex flex-col gap-3">
              <Button onClick={goBack} variant="secondary" className="bg-white/95 hover:bg-white text-slate-900">
                Volver
              </Button>
              <Button onClick={clearSelection} className="bg-slate-900 hover:bg-slate-800 text-white">
                Reiniciar selección
              </Button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
