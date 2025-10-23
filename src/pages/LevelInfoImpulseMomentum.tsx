import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LevelInfoImpulseMomentum() {
  const navigate = useNavigate();

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
          Nivel 2: Teorema Del Impulso y Momento
        </h1>
        <div className="mx-auto mt-2 h-1 w-32 rounded-full bg-black/80" />
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-8">
        {/* Descripción del Nivel */}
        <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-6 shadow-[6px_8px_0_#000] mb-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-3">
            Descripción del Nivel
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-800">
            Un solo objeto se encuentra en reposo o en movimiento y recibe una fuerza que actúa durante un
            período de tiempo. Esto produce un cambio en su momento lineal. El impulso es el producto de la fuerza
            aplicada y el tiempo que dura la aplicación de esa fuerza (I = F * Δt).
          </p>
        </section>

        {/* Grid: Ilustración + Instrucciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ilustración */}
          <section className="rounded-2xl border-4 border-black bg-gradient-to-br from-cyan-400 to-blue-300 backdrop-blur-sm p-8 shadow-[6px_8px_0_#000] flex flex-col items-center justify-center">
            <div className="bg-white/20 rounded-xl p-6 mb-4 text-center">
              <h3 className="text-2xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] mb-2">
                TEORÉMA DEL
              </h3>
              <h3 className="text-3xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] mb-1">
                IMPULSO Y MOMENTO
              </h3>
              <p className="text-sm text-white/90 font-bold">PHYSICS FUN!</p>
              <p className="text-xs text-white/80">lovable.app</p>
            </div>
            
            {/* Ilustración simple */}
            <div className="relative w-full max-w-sm">
              <div className="flex items-center justify-center gap-4">
                {/* Objeto con resorte */}
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-lg border-4 border-black shadow-lg" />
                  <div className="flex flex-col ml-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-8 h-1 bg-blue-600 mb-0.5 rounded" />
                    ))}
                  </div>
                </div>
                
                {/* Flecha */}
                <div className="flex items-center">
                  <div className="w-16 h-1 bg-green-600" />
                  <div 
                    className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-green-600"
                    style={{ borderLeftWidth: '12px' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/90 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-slate-700">
                I = F × Δt = Δp
              </p>
            </div>
          </section>

          {/* Instrucciones */}
          <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-6 shadow-[6px_8px_0_#000]">
            <h2 className="text-xl font-extrabold tracking-tight mb-3">
              Instrucciones
            </h2>
            <ol className="text-[15px] leading-relaxed text-slate-800 list-decimal ml-5 space-y-2">
              <li>
                Ajusta la magnitud de la fuerza y la duración de aplicación.
              </li>
              <li>
                Observa cómo el impulso se representa como el área bajo la curva de la fuerza en función del tiempo.
              </li>
              <li>
                La simulación mostrará que el cambio en el momento del objeto es numéricamente igual al impulso recibido (Δp = I).
              </li>
            </ol>
          </section>
        </div>

        {/* Aprendizaje */}
        <section className="rounded-2xl border-4 border-black bg-white/90 backdrop-blur-sm p-6 shadow-[6px_8px_0_#000] mb-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-3">
            Aprendizaje
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-800">
            Relacionar directamente el concepto de impulso con el cambio en el momento lineal de un objeto,
            entendiendo el Teorema del Impulso y el Momento como una herramienta para resolver problemas de dinámica.
          </p>
        </section>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            onClick={() => navigate("/nivel/2/escenario/1")}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-10 py-6 rounded-2xl border-4 border-black shadow-[6px_8px_0_#000]"
          >
            Iniciar Juego
          </Button>
          
          <Button
            onClick={() => navigate("/home")}
            variant="secondary"
            className="bg-white/95 hover:bg-white text-slate-900 font-bold text-lg px-10 py-6 rounded-2xl border-4 border-black shadow-[6px_8px_0_#000]"
          >
            Volver
          </Button>
        </div>
      </main>
    </div>
  );
}
