import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COVER_URL = "/assets/cars/choque-directo.png";

// Alturas reservadas aproximadas para título + botones (ajústalas si quieres)
const HEADER_H = 78;   // título + subrayado + márgenes
const BUTTONS_H = 64;  // barra de botones fija

export default function LevelInfo() {
  const navigate = useNavigate();
  const { level } = useParams();

  const start = () => navigate(`/nivel/${level ?? "1"}/jugar`);
  const back = () => navigate("/home");

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* velo sutil */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Título compacto */}
      <header className="relative z-10 pt-3">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-black drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
          Nivel 1: Choque Directo
        </h1>
        <div className="mx-auto mt-1.5 h-1 w-28 rounded-full bg-black/80" />
      </header>

      {/* Contenido con altura calculada para evitar scroll general */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-4"
        style={{
          // deja libre el espacio del header y de los botones fijos
          height: `calc(100vh - ${HEADER_H + BUTTONS_H}px)`,
          minHeight: 0,
        }}
      >
        <div className="flex h-full flex-col gap-3 md:gap-4">
          {/* 1) Imagen arriba (más grande y separada del título) */}
          <section className="flex items-center justify-center shrink-0 mt-1">
            <img
              src={COVER_URL}
              alt="Choque directo"
              className="
                select-none pointer-events-none mx-auto object-contain w-auto
                max-h-[180px] sm:max-h-[200px] md:max-h-[210px] lg:max-h-[220px]
                drop-shadow-[6px_10px_0_rgba(0,0,0,0.55)] rounded-lg
              "
            />
          </section>

          {/* 2) Descripción a TODO el ancho */}
          <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-[6px_8px_0_#000]">
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-2">
              Descripción del Nivel
            </h2>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-slate-800">
              Dos objetos se mueven en un plano unidimensional (una pista) y chocan de
              frente. La colisión es perfectamente elástica: se conservan el momento
              lineal total y la energía cinética total del sistema.
            </p>
          </section>

          {/* 3) Instrucciones y Aprendizaje (2 columnas en desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-[6px_8px_0_#000]">
              <h2 className="text-base md:text-lg font-extrabold tracking-tight mb-2">
                Instrucciones
              </h2>
              <ol className="text-[14px] md:text-[15px] leading-relaxed text-slate-800 list-decimal ml-5 space-y-1.5">
                <li>Ajusta masa (kg) y velocidad inicial (m/s) con los deslizadores.</li>
                <li>Presiona <b>Iniciar Simulación</b> para ver el choque.</li>
                <li>
                  Compara el <i>momento total</i> y la <i>energía cinética total</i> antes y
                  después del choque.
                </li>
              </ol>
            </section>

            <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-[6px_8px_0_#000]">
              <h2 className="text-base md:text-lg font-extrabold tracking-tight mb-2">
                Aprendizaje
              </h2>
              <p className="text-[14px] md:text-[15px] leading-relaxed text-slate-800">
                Verifica que en una colisión elástica:
                <br />
                <b>P</b><sub>total,inicial</sub> = <b>P</b><sub>total,final</sub> y{" "}
                <b>K</b><sub>total,inicial</sub> = <b>K</b><sub>total,final</sub>.
              </p>
            </section>
          </div>

          {/* separador flexible para no chocar con los botones */}
          <div className="grow" />
        </div>
      </main>

      {/* Botones fijos (centrados) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <Button
          onClick={start}
          className="bg-red-600 hover:bg-red-700 text-white text-base md:text-lg px-6 md:px-7 py-2.5 md:py-3 rounded-xl border-4 border-black shadow-[0_6px_0_#000]"
        >
          Iniciar Juego
        </Button>
        <Button
          onClick={back}
          variant="secondary"
          className="bg-white/95 hover:bg-white text-slate-900 text-base px-6 py-2.5 rounded-xl border-4 border-black shadow-[0_6px_0_#000]"
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
