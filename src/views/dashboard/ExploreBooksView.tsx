import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, UserIcon, AdjustmentsHorizontalIcon, CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getBooks } from '../../api/books';
import type { Book } from '../../types/library';
import BookDetailsModal from '../../components/library/BookDetailsModal';
import Pagination from '../../components/Pagination';
import CategoryDetailsModal from '../../components/library/CategoryDetailsModal';


// Static categories (example)
const staticCategories = [
  { name: 'Ficción', description: 'Narrativas imaginativas y creadas.' },
  { name: 'Historia', description: 'Obras sobre hechos y periodos históricos.' },
  { name: 'Ciencia', description: 'Libros de divulgación y textos académicos.' },
  { name: 'Arte', description: 'Colección de libros visuales y críticos.' },
  { name: 'Tecnología', description: 'Recursos sobre innovaciones y desarrollo.' },
];


type SearchType = 'title' | 'author' | 'category';

export default function ExploreBooksView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  // Category Modal State
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; description: string } | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const openCategoryModal = (cat: { name: string; description: string }) => {
    setSelectedCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: getBooks,
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate API call for suggestions based on real data
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSuggesting(true);
    const timer = setTimeout(() => {
      let allValues: string[] = [];
      if (searchType === 'title') {
        allValues = books.map(b => b.title);
      } else if (searchType === 'author') {
        allValues = books.flatMap(b => b.authors?.map(a => a.name) || []);
      } else if (searchType === 'category') {
        allValues = books.flatMap(b => b.categories?.map(c => c.title) || []);
      }

      const uniqueValues = Array.from(new Set(allValues));
      const filtered = uniqueValues.filter(v =>
        v.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 5));
      setIsSuggesting(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, searchType, books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (!book.activeState) return false;

      const term = searchTerm.toLowerCase();
      if (searchType === 'title') return book.title.toLowerCase().includes(term);
      if (searchType === 'author') return book.authors?.some(a => a.name.toLowerCase().includes(term));
      if (searchType === 'category') return book.categories?.some(c => c.title.toLowerCase().includes(term));
      return true;
    });
  }, [books, searchTerm, searchType]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleOpenDetails = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Helper for linear colors based on ID
  const getlinearForBook = (id: string) => {
    const charCode = id.charCodeAt(id.length - 1) || 0;
    const linears = [
      'from-blue-600 to-indigo-800',
      'from-emerald-500 to-teal-800',
      'from-purple-600 to-fuchsia-800',
      'from-rose-500 to-red-800',
      'from-amber-500 to-orange-800',
    ];
    return linears[charCode % linears.length];
  };

  if (isLoading) return (
    <div className="min-h-screen space-y-10 pb-20">
      <div className="h-64 md:h-80 rounded-[3rem] bg-slate-900 border border-slate-800 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-3/4 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen space-y-10 pb-20">
      <BookDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={selectedBook}
      />

      {/* Category Carousels */}
      <section className="space-y-12">
        {staticCategories.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{cat.name}</h2>
              <button
                onClick={() => openCategoryModal(cat)}
                className="text-xs text-blue-400 hover:underline"
              >
                Ver más
              </button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
              {books.filter(b => b.categories?.some(c => c.title === cat.name)).slice(0, 8).map(book => (
                <div key={book.bookId} className="min-w-[140px] bg-slate-800/40 p-3 rounded-xl hover:bg-slate-800 transition-colors">
                  <img src={book.coverImage || '/placeholder.png'} alt={book.title} className="w-full h-40 object-cover rounded-md mb-2" />
                  <p className="text-sm text-white truncate">{book.title}</p>
                </div>
              ))}
              {/* Show placeholder if no books */}
              {books.filter(b => b.categories?.some(c => c.title === cat.name)).length === 0 && (
                <div className="min-w-[140px] flex items-center justify-center bg-slate-700/30 rounded-xl text-slate-500">
                  No hay libros disponibles
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
      <CategoryDetailsModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        category={selectedCategory}
      />
      {/* Header & Search Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-blue-600 to-indigo-900 p-8 md:p-12 text-white shadow-2xl shadow-blue-900/40">
        <div className="relative z-10 space-y-8">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <h1 className="text-4xl md:text-4xl font-black tracking-tight">Explorar Biblioteca</h1>
            <p className="mt-4 text-lg md:text-lg text-blue-100 font-medium">
              Busca entre nuestra colección curada de libros y recursos educativos.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto md:mx-0" ref={suggestionRef}>
            <div className="flex flex-col md:flex-row gap-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl transition-all focus-within:ring-4 focus-within:ring-white/20">
              {/* Search Type Selector */}
              <div className="relative border-b md:border-b-0 md:border-r border-white/10 min-w-[160px] group/select">
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value as SearchType);
                    setSearchTerm('');
                  }}
                  className="w-full h-full bg-transparent py-4 pl-6 pr-10 text-white font-bold appearance-none cursor-pointer focus:outline-hidden"
                >
                  <option value="title" className="bg-slate-900">Por Título</option>
                  <option value="author" className="bg-slate-900">Por Autor</option>
                  <option value="category" className="bg-slate-900">Categoría</option>
                </select>
                <AdjustmentsHorizontalIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none group-hover/select:text-white transition-colors" />
              </div>

              {/* Main Search Input */}
              <div className="relative flex-1 group/input">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-300 transition-colors group-focus-within/input:text-white" />
                <input
                  type="text"
                  placeholder={`Escribe el ${searchType === 'title' ? 'título' : searchType === 'author' ? 'nombre del autor' : 'nombre de la categoría'}...`}
                  className="w-full h-full bg-transparent py-3 pl-16 pr-12 text-white placeholder:text-blue-200/50 focus:outline-hidden text-md font-medium"
                  value={searchTerm}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                />

                {isSuggesting && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-3 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">Sugerencias encontradas</div>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <span className="text-white font-medium group-hover:translate-x-1 transition-transform">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      </section>

      {/* Featured Books Carousel (Simplified) */}
      {!searchTerm && books.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-blue-500"></span>
              Novedades Destacadas
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
            {books.slice(0, 5).map(book => (
              <div
                key={book.bookId}
                onClick={() => handleOpenDetails(book)}
                className="snap-start shrink-0 w-80 h-48 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all shadow-xl"
              >
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-linear-to-br ${getlinearForBook(book.bookId)} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Recomendado</span>
                    <h3 className="text-lg font-black text-white line-clamp-2 leading-tight">{book.title}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{book.authors?.map(a => a.name).join(', ') || 'Autor Desconocido'}</p>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ChevronRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {paginatedBooks.map((book) => {
          const isAvailable = (book.availableCopies || 0) > 0;
          const mainCategory = book.categories?.[0]?.title || 'General';
          const authorNames = book.authors?.map(a => a.name).join(', ') || 'Autor Desconocido';

          return (
            <div
              key={book.bookId}
              onClick={() => handleOpenDetails(book)}
              className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-[2.5rem] p-5 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20 flex flex-col cursor-pointer"
            >
              {/* Iconic Cover */}
              <div className={`relative aspect-3/4 overflow-hidden rounded-4xl shadow-xl flex items-center justify-center bg-linear-to-br ${getlinearForBook(book.bookId)}`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="text-white/30 text-8xl font-black uppercase select-none transform group-hover:scale-110 transition-transform duration-700">
                  {book.title.charAt(0)}
                </div>


                {!isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-slate-950/40">
                    <span className="bg-red-500/90 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10">Agotado</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                    {mainCategory}
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold">
                    {book.availableCopies || 0} disponibles
                  </span>
                </div>

                <div className="flex-1 min-h-14">
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <UserIcon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium line-clamp-1 italic">{authorNames}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                        <div className={`w-full h-full bg-linear-to-br ${getlinearForBook(i.toString())} opacity-50`} />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">+12 lectores</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination & Empty State */}
      {filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 border border-slate-700 shadow-inner">
            <MagnifyingGlassIcon className="w-10 h-10" />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-2xl font-black text-white">No encontramos nada</h3>
            <p className="text-slate-500 mt-2 font-medium">Intenta con otros términos o cambia el criterio de búsqueda.</p>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
