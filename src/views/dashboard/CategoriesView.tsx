import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, deleteCategory, deleteMultipleCategories } from '../../api/categories';
import ErrorMessage from '../../components/ErrorMessage';
import { PlusIcon, TagIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import CategoryModal from '../../components/library/CategoryModal';
import LibraryTable from '../../components/library/LibraryTable';
import type { Category } from '../../types/library';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import BulkActionsBar from '../../components/library/BulkActionsBar';

export default function CategoriesView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada');
      setIsConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteMultipleCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`${selectedIds.length} categorías eliminadas`);
      setIsBulkConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
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

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role?.toLowerCase() || '';
  const isAdmin = ['administrador', 'docente', 'bibliotecario', 'administrator', 'teacher', 'librarian', 'admin'].includes(role);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat => 
      cat.activeState && 
      cat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isError) return <ErrorMessage>{error.message}</ErrorMessage>;

  const columns = [
    {
      header: 'Categoría',
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TagIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{category.title}</p>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <CategoryModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        editingCategory={editingCategory}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title="¿Eliminar Categoría?"
        description="Esta acción eliminará la categoría de forma permanente. No se podrán recuperar sus datos."
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal 
        isOpen={isBulkConfirmOpen}
        setIsOpen={setIsBulkConfirmOpen}
        title="¿Eliminar Categorías Seleccionadas?"
        description={`Esta acción eliminará ${selectedIds.length} categorías de forma permanente. No se podrán recuperar sus datos.`}
        onConfirm={handleConfirmBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Categorías</h1>
          <p className="text-slate-400 mt-1">Organiza los libros por temas y géneros</p>
        </div>

        <div className="flex items-center gap-4">
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onDelete={() => setIsBulkConfirmOpen(true)}
            onClearSelection={() => setSelectedIds([])}
            itemName="categorías"
          />

          {isAdmin && (
            <button
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
              onClick={handleCreate}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nueva Categoría</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
          <div className="relative max-w-md">
            <TagIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
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
            data={paginatedCategories}
            columns={columns}
            emptyMessage="No se encontraron categorías"
            emptyIcon={TagIcon}
            selectable={isAdmin}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            idExtractor={(cat) => cat.categoryId}
            renderActions={(category) => (
              <div className="flex justify-end gap-2">
                <button 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" 
                  title="Editar"
                  onClick={() => handleEdit(category)}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" 
                  title="Eliminar"
                  onClick={() => handleDeleteClick(category.categoryId)}
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
