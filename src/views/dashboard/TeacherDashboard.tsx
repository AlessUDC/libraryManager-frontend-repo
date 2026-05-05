export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Panel de Docente</h2>
        <p className="text-slate-400">
          Bienvenido a tu panel de control. Desde aquí podrás gestionar el material bibliográfico y realizar seguimiento.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Libros Prestados</h3>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">12</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Material Sugerido</h3>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">5</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Avisos</h3>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">2</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Préstamos Activos</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500">Próximamente: Lista de préstamos</p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Material Sugerido para Clases</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500">Próximamente: Gestión de sugerencias</p>
          </div>
        </div>
      </div>
    </div>
  );
}
