// src/pages/Login.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FaUserAlt, FaLock } from "react-icons/fa"; // Usamos react-icons para iconos
import { useNavigate } from "react-router-dom";

type FormData = {
  username: string;
  password: string;
};

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = (data: FormData) => {
    // Simulando una validación sencilla
    if (data.username === "admin" && data.password === "admin") {
      // Redirigir a la página principal después de un inicio de sesión exitoso
      navigate("/home");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-4 text-blue-600">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 mt-1">
              <FaUserAlt className="text-gray-500 mr-2" />
              <input
                type="text"
                id="username"
                {...register("username", { required: "El usuario es obligatorio" })}
                className="w-full outline-none"
                placeholder="Ingresa tu usuario"
              />
            </div>
            {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 mt-1">
              <FaLock className="text-gray-500 mr-2" />
              <input
                type="password"
                id="password"
                {...register("password", { required: "La contraseña es obligatoria" })}
                className="w-full outline-none"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
