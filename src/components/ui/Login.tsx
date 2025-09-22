import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormEvent } from "react";

const CRASH_IMAGE_URL = "/assets/cars/crash.png";

export default function Login() {
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: validación/llamado a backend
    navigate("/home");
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
      {/* overlay suave para contraste */}
      <div className="pointer-events-none absolute inset-0 bg-white/10" />

      {/* TÍTULO CENTRADO ARRIBA */}
      <header className="relative z-10 pt-8 pb-2 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-black drop-shadow-[0_5px_0_rgba(0,0,0,0.15)]">
          Impulse Quest
        </h1>
      </header>

      {/* CONTENIDO: imagen grande + formulario */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* IMAGEN DE CHOQUE (grande, centrada en su columna) */}
        <div className="flex justify-center md:justify-start order-2 md:order-1">
          <img
            src={CRASH_IMAGE_URL}
            alt="Colisión de autos"
            className="pointer-events-none select-none w-[360px] sm:w-[460px] md:w-[560px] lg:w-[640px] drop-shadow-xl"
            draggable={false}
          />
        </div>

        {/* TARJETA DE LOGIN (a la derecha en desktop) */}
        <div className="flex justify-center md:justify-end order-1 md:order-2">
          <div className="w-full max-w-md rounded-3xl border-4 border-black bg-white/90 backdrop-blur-sm shadow-[0_12px_0_#000] p-6 md:p-7">
            {/* Chip Bienvenido */}
            <div className="mb-5 flex justify-center">
              <div className="inline-block rounded-xl border-2 border-black bg-sky-600 px-6 py-2 text-white text-lg font-extrabold shadow-[0_4px_0_#000]">
                Bienvenido
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="username">
                  Nombre de Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="w-full rounded-xl border-2 border-black bg-white px-3 py-3 outline-none shadow-[0_3px_0_#000] focus:ring-2 focus:ring-sky-500"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-black bg-white px-3 py-3 outline-none shadow-[0_3px_0_#000] focus:ring-2 focus:ring-sky-500"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-sky-600 border-2 border-black rounded"
                  />
                  <span className="text-sm font-medium">Recordarme</span>
                </label>

                <a href="#" className="text-sm font-medium text-sky-700 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-5 rounded-2xl border-2 border-black shadow-[0_8px_0_#000] transition-transform hover:scale-[1.01]"
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}


