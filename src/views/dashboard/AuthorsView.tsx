import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthors, deleteAuthor, deleteMultipleAuthors } from '../../api/authors';
import ErrorMessage from '../../components/ErrorMessage';
import { PlusIcon, UserIcon, PencilSquareIcon, TrashIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import LibraryTable from '../../components/library/LibraryTable';
import { useNavigate } from 'react-router-dom';
import type { Author } from '../../types/library';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import BulkActionsBar from '../../components/library/BulkActionsBar';

export default function AuthorsView() {
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

  const { data: authors, isLoading, isError, error } = useQuery({
    queryKey: ['authors'],
    queryFn: getAuthors,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast.success('Autor eliminado');
      setIsConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteMultipleAuthors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast.success(`${selectedIds.length} autores eliminados`);
      setIsBulkConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleEdit = (slug: string) => {
    navigate(`/authors/${slug}/edit`);
  };

  const handleCreate = () => {
    navigate('/authors/create');
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

  const filteredAuthors = useMemo(() => {
    if (!authors) return [];
    return authors.filter(author => 
      author.activeState && (
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [authors, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const paginatedAuthors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAuthors.slice(start, start + itemsPerPage);
  }, [filteredAuthors, currentPage]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isError) return <ErrorMessage>{error.message}</ErrorMessage>;

  const columns = [
    {
      header: 'Autor',
      render: (author: Author) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            {author.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{author.name}</p>
            <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{author.biography || 'Sin biografía'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Nacionalidad',
      render: (author: Author) => (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <GlobeAltIcon className="w-4 h-4 text-slate-500" />
          {author.nationality || 'Desconocida'}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title="¿Eliminar Autor?"
        description="Esta acción eliminará al autor de forma permanente. No se podrán recuperar sus datos."
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal 
        isOpen={isBulkConfirmOpen}
        setIsOpen={setIsBulkConfirmOpen}
        title="¿Eliminar Autores Seleccionados?"
        description={`Esta acción eliminará ${selectedIds.length} autores de forma permanente. No se podrán recuperar sus datos.`}
        onConfirm={handleConfirmBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Autores</h1>
          <p className="text-slate-400 mt-1">Gestiona los escritores de tu colección</p>
        </div>

        <div className="flex items-center gap-4">
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onDelete={() => setIsBulkConfirmOpen(true)}
            onClearSelection={() => setSelectedIds([])}
            itemName="autores"
          />

          {isAdmin && (
            <button
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              onClick={handleCreate}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nuevo Autor</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
          <div className="relative max-w-md">
            <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar autor..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <LibraryTable
            data={paginatedAuthors}
            columns={columns}
            emptyMessage="No se encontraron autores"
            emptyIcon={UserIcon}
            selectable={isAdmin}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            idExtractor={(author) => author.authorId}
            renderActions={(author) => (
              <div className="flex justify-end gap-2">
                <button 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" 
                  title="Editar"
                  onClick={() => handleEdit(author.slug || author.authorId)}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" 
                  title="Eliminar"
                  onClick={() => handleDeleteClick(author.authorId)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
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
