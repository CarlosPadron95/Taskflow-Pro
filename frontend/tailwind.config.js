/** @type {import('tailwindcss').Config} */
export default {
  // Indico las rutas de los archivos donde Tailwind debe buscar clases para generar el CSS
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Aquí puedo añadir personalizaciones como colores o bordes si el proyecto crece
    },
  },
  plugins: [],
};
