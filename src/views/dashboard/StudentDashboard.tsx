export default function StudentDashboard() {
  return (
    <div className="space-y-6">      
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
