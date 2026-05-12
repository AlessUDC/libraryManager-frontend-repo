import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, getCopiesByBook, deleteCopy, deleteMultipleCopies } from '../../api/books';
import { BookOpenIcon, PlusIcon, TrashIcon, MapPinIcon, ArrowLeftIcon, PencilSquareIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import LibraryTable from '../../components/library/LibraryTable';
import ConfirmModal from '../../components/ConfirmModal';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { Copy, CopyStatus, CopyCondition } from '../../types/library';
import CopyModal from '../../components/library/CopyModal';
import Pagination from '../../components/Pagination';
import BulkActionsBar from '../../components/library/BulkActionsBar';

export default function BookCopiesView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCopy, setEditingCopy] = useState<Copy | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: book, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => getBookById(slug!),
    enabled: !!slug
  });

  const { data: copies = [], isLoading: isLoadingCopies } = useQuery({
    queryKey: ['copies', slug],
    queryFn: () => getCopiesByBook(slug!),
    enabled: !!slug
  });

  // Calculate Paginated Data
  const totalPages = Math.ceil(copies.length / itemsPerPage);
  const paginatedCopies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return copies.slice(start, start + itemsPerPage);
  }, [copies, currentPage]);

  const deleteMutation = useMutation({
    mutationFn: deleteCopy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', slug] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Ejemplar eliminado');
      setIsConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteMultipleCopies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', slug] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(`${selectedIds.length} ejemplares eliminados`);
      setIsBulkConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role?.toLowerCase() || '';
  const isAdmin = ['administrador', 'docente', 'bibliotecario', 'administrator', 'teacher', 'librarian', 'admin'].includes(role);

  const handleEdit = (copy: Copy) => {
    setEditingCopy(copy);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCopy(null);
    setIsModalOpen(true);
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

  const getStatusColor = (status: CopyStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'LENT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'RESERVED': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'MAINTENANCE': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const columns = [
    {
      header: 'Código de Barras',
      render: (copy: Copy) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 border border-slate-700">
            <QrCodeIcon className="w-5 h-5" />
          </div>
          <span className="font-mono font-bold text-white text-sm">{copy.barcode}</span>
        </div>
      )
    },
    {
      header: 'Ubicación',
      render: (copy: Copy) => (
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <MapPinIcon className="w-4 h-4 text-slate-500" />
          {copy.location || 'No asignada'}
        </div>
      )
    },
    {
      header: 'Estado',
      render: (copy: Copy) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(copy.status)}`}>
          {copy.status}
        </span>
      )
    },
    {
      header: 'Condición',
      render: (copy: Copy) => (
        <span className="text-xs font-medium text-slate-400">
          {copy.condition === 'NEW' ? 'Nuevo' : copy.condition === 'GOOD' ? 'Bueno' : 'Dañado'}
        </span>
      )
    }
  ];

  if (isLoadingBook || isLoadingCopies) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {book && (
        <CopyModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          bookId={book.bookId}
          slug={slug!}
          editingCopy={editingCopy}
        />
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title="¿Eliminar Ejemplar?"
        description="Esta acción eliminará el ejemplar físico de forma permanente. No se puede deshacer."
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal 
        isOpen={isBulkConfirmOpen}
        setIsOpen={setIsBulkConfirmOpen}
        title="¿Eliminar Ejemplares Seleccionados?"
        description={`Esta acción eliminará ${selectedIds.length} ejemplares físicos de forma permanente. No se puede deshacer.`}
        onConfirm={handleConfirmBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/catalogue')}
            className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">Ejemplares</h1>
            <p className="text-blue-400 font-bold mt-1">{book?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onDelete={() => setIsBulkConfirmOpen(true)}
            onClearSelection={() => setSelectedIds([])}
            itemName="ejemplares"
          />

          {isAdmin && (
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              onClick={handleCreate}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Añadir Ejemplar</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
      <LibraryTable
        data={paginatedCopies}
        columns={columns}
        emptyMessage="No hay ejemplares registrados para este libro"
        emptyIcon={QrCodeIcon}
        selectable={isAdmin}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        idExtractor={(copy) => copy.copyId}
        renderActions={(copy) => isAdmin ? (
          <div className="flex justify-end gap-2">
            <button 
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" 
              title="Editar"
              onClick={() => handleEdit(copy)}
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" 
              title="Eliminar"
              onClick={() => handleDeleteClick(copy.copyId)}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      />

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
