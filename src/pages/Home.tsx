import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  const goNivel1 = () => {
    sessionStorage.setItem("entry:nivel1", "ok");
    navigate("/nivel/1/intro");
  };

  const goNivel2 = () => {
    sessionStorage.setItem("entry:nivel2", "ok");
    navigate("/nivel/2/intro");
  };

  return (
    <div
      className="min-h-screen w-full relative text-slate-900 overflow-hidden"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay suave para contraste */}
      <div className="pointer-events-none absolute inset-0 bg-white/10" />

      {/* Contenido centrado */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 min-h-screen flex flex-col items-center justify-center text-center">
        {/* Título grande */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-black drop-shadow-[0_4px_0_rgba(0,0,0,0.15)]">
          Impulse Quest
        </h1>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-slate-800/80">
          Simulación de Colisión Elástica
        </p>

        {/* Botones grandes */}
        <div className="mt-10 w-full max-w-2xl space-y-4">
          <Button
            onClick={goNivel1}
            className="w-full px-10 py-5 text-xl md:text-2xl bg-blue-600 hover:bg-blue-700 text-white rounded-2xl border-4 border-black shadow-[0_6px_0_#000] transition-transform hover:scale-[1.02]"
          >
            Nivel 1: Choques Básicos
          </Button>

          <Button
            onClick={goNivel2}
            className="w-full px-10 py-5 text-xl md:text-2xl bg-orange-500 hover:bg-orange-600 text-white rounded-2xl border-4 border-black shadow-[0_6px_0_#000] transition-transform hover:scale-[1.02]"
          >
            Nivel 2: Teorema del Impulso
          </Button>

          <Button
            disabled
            className="w-full px-10 py-5 text-xl md:text-2xl bg-emerald-600 text-white rounded-2xl border-4 border-black shadow-[0_6px_0_#000] opacity-70 cursor-not-allowed"
          >
            Nivel 3: Desafíos (Próximamente)
          </Button>
        </div>

        {/* Descripción burbuja */}
        <div className="mt-10 max-w-3xl rounded-3xl border-4 border-black bg-white/95 px-8 py-6 shadow-[0_6px_0_#000]">
          <p className="text-slate-900 text-base md:text-lg leading-relaxed">
            Explora cómo funciona el momento lineal en diferentes situaciones:
            choques, rebotes, impulso, centro de masa y explosiones.
          </p>
        </div>
      </main>
    </div>
  );
}
