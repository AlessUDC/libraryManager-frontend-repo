import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon, UserIcon, AdjustmentsHorizontalIcon,
  CheckIcon, ChevronRightIcon, BookOpenIcon, TagIcon,
  XMarkIcon, FunnelIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { getBooks } from '../../api/books';
import type { Book } from '../../types/library';
import BookDetailsModal from '../../components/library/BookDetailsModal';
import Pagination from '../../components/Pagination';
import CategoryDetailsModal from '../../components/library/CategoryDetailsModal';

type SearchType = 'title' | 'author' | 'category';
type SortOption = 'default' | 'title_asc' | 'title_desc' | 'available' | 'unavailable';

const GRADIENTS = [
  'from-blue-600 to-indigo-800',
  'from-emerald-500 to-teal-800',
  'from-purple-600 to-fuchsia-800',
  'from-rose-500 to-red-800',
  'from-amber-500 to-orange-800',
  'from-cyan-500 to-sky-800',
  'from-pink-500 to-rose-700',
];

const getGradient = (id: string) => {
  const code = id.charCodeAt(id.length - 1) || 0;
  return GRADIENTS[code % GRADIENTS.length];
};

export default function ExploreBooksView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; description: string } | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: getBooks,
  });

  // Derive unique categories from books
  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach(b => b.categories?.forEach(c => cats.add(c.title)));
    return Array.from(cats).sort();
  }, [books]);

  const activeBooks = useMemo(() => books.filter(b => b.activeState), [books]);
  const availableCount = useMemo(() => activeBooks.filter(b => (b.availableCopies || 0) > 0).length, [activeBooks]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (searchTerm.length < 2) { setSuggestions([]); return; }
    setIsSuggesting(true);
    const timer = setTimeout(() => {
      let pool: string[] = [];
      if (searchType === 'title') pool = books.map(b => b.title);
      else if (searchType === 'author') pool = books.flatMap(b => b.authors?.map(a => a.name) || []);
      else pool = books.flatMap(b => b.categories?.map(c => c.title) || []);
      const unique = Array.from(new Set(pool));
      setSuggestions(unique.filter(v => v.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6));
      setIsSuggesting(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, searchType, books]);

  const filteredBooks = useMemo(() => {
    let result = activeBooks.filter(book => {
      const term = searchTerm.toLowerCase();
      if (searchType === 'title' && term) return book.title.toLowerCase().includes(term);
      if (searchType === 'author' && term) return book.authors?.some(a => a.name.toLowerCase().includes(term));
      if (searchType === 'category' && term) return book.categories?.some(c => c.title.toLowerCase().includes(term));
      return true;
    });

    if (activeCategory) {
      result = result.filter(b => b.categories?.some(c => c.title === activeCategory));
    }

    if (sortBy === 'title_asc') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'available') result = [...result].sort((a, b) => (b.availableCopies || 0) - (a.availableCopies || 0));
    else if (sortBy === 'unavailable') result = result.filter(b => (b.availableCopies || 0) === 0);
    else if (sortBy === 'title_desc') result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    return result;
  }, [activeBooks, searchTerm, searchType, activeCategory, sortBy]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setShowSuggestions(false);
  };

  const handleCategoryFilter = (cat: string | null) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory(null);
    setSortBy('default');
    setCurrentPage(1);
  };

  const hasFilters = searchTerm || activeCategory || sortBy !== 'default';

  if (isLoading) return (
    <div className="min-h-screen space-y-10 pb-20">
      <div className="h-64 rounded-[3rem] bg-slate-900 border border-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-3/4 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen space-y-8 pb-20">
      <BookDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} book={selectedBook} />
      <CategoryDetailsModal isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setSelectedCategory(null); }} category={selectedCategory} />

      {/* ── Hero Search Banner ── */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 p-8 md:p-12 text-white shadow-2xl shadow-blue-900/40">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-blue-300" />
              <span className="text-blue-200 text-sm font-bold uppercase tracking-widest">Biblioteca Digital</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Explorar Biblioteca</h1>
            <p className="mt-3 text-lg text-blue-100/80 font-medium">
              Busca entre nuestra colección curada de libros y recursos educativos.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-4xl" ref={suggestionRef}>
            <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl focus-within:ring-2 focus-within:ring-white/30 transition-all">
              {/* Type selector */}
              <div className="relative border-b md:border-b-0 md:border-r border-white/10 min-w-[155px]">
                <select
                  value={searchType}
                  onChange={e => { setSearchType(e.target.value as SearchType); setSearchTerm(''); setCurrentPage(1); }}
                  className="w-full h-full bg-transparent py-4 pl-5 pr-9 text-white font-bold appearance-none cursor-pointer focus:outline-none text-sm"
                >
                  <option value="title" className="bg-slate-900">Por Título</option>
                  <option value="author" className="bg-slate-900">Por Autor</option>
                  <option value="category" className="bg-slate-900">Categoría</option>
                </select>
                <AdjustmentsHorizontalIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none" />
              </div>

              {/* Input */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="text"
                  placeholder={`Buscar por ${searchType === 'title' ? 'título' : searchType === 'author' ? 'autor' : 'categoría'}...`}
                  className="w-full bg-transparent py-4 pl-14 pr-12 text-white placeholder:text-blue-200/50 focus:outline-none text-sm font-medium"
                  value={searchTerm}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true); setCurrentPage(1); }}
                />
                {searchTerm && (
                  <button onClick={() => handleSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
                {isSuggesting && !searchTerm && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Sugerencias</p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 rounded-xl transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-white text-sm font-medium">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { label: 'Títulos', value: activeBooks.length },
              { label: 'Disponibles', value: availableCount },
              { label: 'Categorías', value: categories.length },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                <span className="text-xl font-black text-white">{stat.value}</span>
                <span className="text-blue-200 text-xs font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Carousel (only when not filtering) ── */}
      {!searchTerm && !activeCategory && books.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <span className="w-1 h-7 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
            <h2 className="text-xl font-black text-white">Novedades Destacadas</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {activeBooks.slice(0, 6).map(book => (
              <div
                key={book.bookId}
                onClick={() => { setSelectedBook(book); setIsModalOpen(true); }}
                className="snap-start shrink-0 w-72 bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all duration-300 shadow-xl"
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${getGradient(book.bookId)} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                <div className="relative z-10 flex flex-col h-full gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Recomendado</span>
                  <h3 className="text-base font-black text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{book.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 italic">{book.authors?.map(a => a.name).join(', ') || 'Autor desconocido'}</p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${(book.availableCopies || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {(book.availableCopies || 0) > 0 ? `${book.availableCopies} disp.` : 'Agotado'}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ChevronRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Category Chips ── */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <TagIcon className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Explorar por categoría</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!activeCategory ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/30' : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'}`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(activeCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/30' : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Toolbar: Results count + Sort + Clear ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="w-5 h-5 text-slate-500" />
          <span className="text-sm text-slate-400 font-medium">
            <span className="text-white font-black">{filteredBooks.length}</span> resultado{filteredBooks.length !== 1 ? 's' : ''}
            {activeCategory && <span className="text-blue-400"> en "{activeCategory}"</span>}
            {searchTerm && <span className="text-blue-400"> para "{searchTerm}"</span>}
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors font-bold border border-slate-800 hover:border-red-500/30 px-3 py-1.5 rounded-lg"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
            className="bg-slate-900/60 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="default">Orden por defecto</option>
            <option value="title_asc">A → Z por título</option>
            <option value="title_desc">Z → A por título</option>
            <option value="available">Mayor disponibilidad</option>
          </select>
        </div>
      </div>

      {/* ── Books Grid ── */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
            <MagnifyingGlassIcon className="w-9 h-9 text-slate-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Sin resultados</h3>
            <p className="text-slate-500 mt-1 font-medium max-w-xs mx-auto">
              Intenta con otros términos o cambia los filtros aplicados.
            </p>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Quitar todos los filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {paginatedBooks.map(book => {
            const isAvailable = (book.availableCopies || 0) > 0;
            const mainCategory = book.categories?.[0]?.title || 'General';
            const authorNames = book.authors?.map(a => a.name).join(', ') || 'Autor Desconocido';
            return (
              <div
                key={book.bookId}
                onClick={() => { setSelectedBook(book); setIsModalOpen(true); }}
                className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-4 hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-900/20 flex flex-col cursor-pointer"
              >
                {/* Cover */}
                <div className={`relative aspect-3/4 overflow-hidden rounded-2xl shadow-lg flex items-center justify-center bg-gradient-to-br ${getGradient(book.bookId)}`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  <span className="text-white/20 text-7xl font-black uppercase select-none group-hover:scale-110 transition-transform duration-700">
                    {book.title.charAt(0)}
                  </span>
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-slate-950/40">
                      <span className="bg-red-500/90 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Agotado</span>
                    </div>
                  )}
                  {/* Available badge */}
                  {isAvailable && (
                    <div className="absolute bottom-2 right-2">
                      <span className="bg-emerald-500/90 text-white px-2 py-0.5 rounded-lg text-[9px] font-black">{book.availableCopies} disp.</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 flex flex-col flex-1 gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full w-fit">
                    {mainCategory}
                  </span>
                  <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                    <UserIcon className="w-3 h-3 shrink-0" />
                    <span className="text-[11px] font-medium line-clamp-1 italic">{authorNames}</span>
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-bold uppercase">Ver detalles</span>
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <ChevronRightIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      )}
    </div>
  );
}
