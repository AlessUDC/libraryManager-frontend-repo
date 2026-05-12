import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooks, deleteBook, deleteMultipleBooks } from '../../api/books';
import ErrorMessage from '../../components/ErrorMessage';
import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, PlusIcon, BookOpenIcon, PencilSquareIcon, TrashIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../../components/ConfirmModal';
import LibraryTable from '../../components/library/LibraryTable';
import { Link, useNavigate } from 'react-router-dom';
import type { Book } from '../../types/library';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import BulkActionsBar from '../../components/library/BulkActionsBar';

export default function CatalogueView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: books, isLoading, isError, error } = useQuery({
    queryKey: ['books'],
    queryFn: getBooks,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Libro eliminado');
      setIsConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteMultipleBooks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(`${selectedIds.length} libros eliminados`);
      setIsBulkConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleEdit = (slug: string) => {
    navigate(`/catalogue/${slug}/edit`);
  };

  const handleCreate = () => {
    navigate('/catalogue/create');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds);
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role?.toLowerCase() || '';
  const isAdmin = ['administrador', 'docente', 'bibliotecario', 'administrator', 'teacher', 'librarian', 'admin'].includes(role);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(book => 
      book.activeState && (
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authors?.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [books, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isError) return <ErrorMessage>{error.message}</ErrorMessage>;

  const columns = [
    {
      header: 'Libro',
      render: (book: Book) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 border border-blue-500/20">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <div className="max-w-xs">
            <Link 
              to={`/catalogue/${book.slug}/ejemplares`}
              className="text-sm font-bold text-white hover:text-blue-400 transition-colors line-clamp-1"
            >
              {book.title}
            </Link>
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
              {book.authors?.map(a => a.name).join(', ') || 'Autor Desconocido'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Editorial / Año',
      render: (book: Book) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white line-clamp-1">
            {book.publisher || 'Sin Editorial'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {book.publicationYear || 'Año N/A'}
          </span>
        </div>
      )
    },
    {
      header: 'Categorías',
      render: (book: Book) => (
        <div className="flex flex-wrap gap-1">
          {book.categories?.slice(0, 2).map(cat => (
            <span key={cat.categoryId} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-tighter border border-blue-500/20">
              {cat.title}
            </span>
          ))}
          {book.categories && book.categories.length > 2 && (
            <span className="text-[10px] text-slate-500">+{book.categories.length - 2}</span>
          )}
        </div>
      )
    },
    {
      header: 'Disponibilidad',
      render: (book: Book) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${(book.availableCopies || 0) > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
          <span className="text-xs font-black text-slate-200">
            {book.availableCopies || 0} / {book.totalCopies || 0}
            <span className="ml-1.5 text-slate-500 font-medium">disponibles</span>
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title="¿Eliminar Libro?"
        description="Esta acción eliminará el libro y todos sus ejemplares asociados de forma permanente."
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal 
        isOpen={isBulkConfirmOpen}
        setIsOpen={setIsBulkConfirmOpen}
        title="¿Eliminar Libros Seleccionados?"
        description={`Esta acción eliminará ${selectedIds.length} libros y todos sus ejemplares asociados de forma permanente.`}
        onConfirm={handleConfirmBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Catálogo de Libros</h1>
          <p className="text-slate-400 mt-1">Explora y gestiona la colección de la biblioteca</p>
        </div>

        <div className="flex items-center gap-4">
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onDelete={() => setIsBulkConfirmOpen(true)}
            onClearSelection={() => setSelectedIds([])}
            itemName="libros"
          />

          {isAdmin && (
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              onClick={handleCreate}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nuevo Libro</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por título, autor o editorial..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <LibraryTable
            data={paginatedBooks}
            columns={columns}
            emptyMessage="No se encontraron libros"
            emptyIcon={BookOpenIcon}
            selectable={isAdmin}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            idExtractor={(book) => book.bookId}
            renderActions={(book) => (
              <div className="flex justify-end gap-2">
                <Link 
                  to={`/catalogue/${book.slug}/ejemplares`}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" 
                  title="Gestionar Ejemplares"
                >
                  <QrCodeIcon className="w-5 h-5" />
                </Link>
                {isAdmin && (
                  <>
                    <button 
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" 
                      title="Editar"
                      onClick={() => handleEdit(book.slug || book.bookId)}
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" 
                      title="Eliminar"
                      onClick={() => handleDeleteClick(book.bookId)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}
          />

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
