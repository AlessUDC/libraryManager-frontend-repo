export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Panel de Estudiante</h2>
        <p className="text-slate-400">
          Bienvenido a la biblioteca virtual. Explora, descubre y aprende.
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-blue-600 to-indigo-600 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-white mb-2">¿Buscas tu próxima lectura?</h3>
            <p className="text-blue-100 max-w-md">
              Explora nuestro catálogo con más de 10,000 títulos disponibles en diferentes áreas del conocimiento.
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors focus:ring-4 focus:ring-white/30">
            Ir al Catálogo
          </button>
        </div>
      </div>

      {/* Stats / Quick info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex items-center">
          <div className="p-4 bg-teal-500/20 text-teal-400 rounded-2xl mr-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-slate-400 font-medium">Libros por Devolver</h3>
            <p className="text-3xl font-bold text-white mt-1">1</p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex items-center">
          <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl mr-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-slate-400 font-medium">Libros Favoritos</h3>
            <p className="text-3xl font-bold text-white mt-1">4</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Novedades y Recomendados</h3>
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-500">Próximamente: Carrusel de libros</p>
        </div>
      </div>
    </div>
  );
}
