import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COVER_URL = "/assets/cars/choque-directo.png";

export default function LevelInfo() {
  const navigate = useNavigate();
  const { level } = useParams();

  const handleStart = () => navigate(`/nivel/${level ?? "1"}/jugar`);
  const handleBack = () => navigate("/home");

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay suave */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Título */}
      <header className="relative z-10 pt-4 pb-2">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-black drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
          Nivel 1: Choque Directo
        </h1>
      </header>

      {/* Tablero compacto 2×2 */}
      <main className="relative z-10 max-w-6xl mx-auto px-4">
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border-4 border-black bg-white/40 p-3 shadow-[0_8px_0_#000]"
          style={{ height: "calc(100vh - 200px)" }}
        >
          {/* 1) Descripción — arriba izquierda */}
          <section className="order-1 md:order-1 rounded-xl border-4 border-black bg-white/95 p-4 shadow-[0_6px_0_#000] overflow-auto">
            <h2 className="text-base font-semibold mb-2">Descripción del Nivel</h2>
            <p className="text-sm leading-snug text-slate-800">
              Dos objetos se mueven en un plano unidimensional (una pista) y chocan de
              frente. La colisión es perfectamente elástica, lo que significa que tanto
              el momento lineal como la energía cinética total del sistema se conservan.
            </p>
          </section>

          {/* 2) Instrucciones — arriba derecha (SUBE aquí) */}
          <section className="order-3 md:order-2 rounded-xl border-4 border-black bg-white/95 p-4 shadow-[0_6px_0_#000] overflow-auto">
            <h2 className="text-base font-semibold mb-2">Instrucciones</h2>
            <ol className="text-sm leading-snug text-slate-800 list-decimal ml-5 space-y-1.5">
              <li>
                Ajusta los deslizadores para establecer la masa (en kg) y la
                velocidad inicial (en m/s) de cada carrito.
              </li>
              <li>
                Usa el botón <strong>“Iniciar Simulación”</strong> para observar el
                choque.
              </li>
              <li>
                Revisa la tabla de datos. Compara los valores de momento lineal total y
                energía cinética total antes y después del choque.
              </li>
            </ol>
          </section>

          {/* 3) Imagen — abajo izquierda (BAJA aquí) y centrada */}
          <section className="order-2 md:order-3 rounded-xl border-4 border-black bg-white/95 p-2 shadow-[0_6px_0_#000] overflow-hidden flex items-center justify-center">
            <img
              src={COVER_URL}
              alt="Choque directo"
              className="max-h-[90%] max-w-[90%] object-contain mx-auto rounded-lg border-2 border-black"
            />
          </section>

          {/* 4) Aprendizaje — abajo derecha */}
          <section className="order-4 md:order-4 rounded-xl border-4 border-black bg-white/95 p-4 shadow-[0_6px_0_#000] overflow-auto">
            <h2 className="text-base font-semibold mb-2">Aprendizaje</h2>
            <p className="text-sm leading-snug text-slate-800">
              Comprender y verificar visualmente que, en una colisión elástica, el
              momento lineal total antes del choque es igual al momento lineal total
              después del choque (P<sub>total,inicial</sub> = P<sub>total,final</sub>) y
              que la energía cinética total también se conserva
              (K<sub>total,inicial</sub> = K<sub>total,final</sub>).
            </p>
          </section>
        </div>
      </main>

      {/* Botones fijos */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <Button
          onClick={handleStart}
          className="bg-red-600 hover:bg-red-700 text-white text-lg px-6 py-3 rounded-xl border-4 border-black shadow-[0_6px_0_#000]"
        >
          Iniciar Juego
        </Button>
        <Button
          onClick={handleBack}
          variant="secondary"
          className="bg-white/95 hover:bg-white text-slate-900 px-5 py-3 rounded-xl border-4 border-black shadow-[0_6px_0_#000]"
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
