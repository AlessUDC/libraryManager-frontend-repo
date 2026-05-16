import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, deleteUser, deleteMultipleUsers } from '../../api/users';
import ErrorMessage from '../../components/ErrorMessage';
import { UserPlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, UserCircleIcon, IdentificationIcon, AcademicCapIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import LibraryTable from '../../components/library/LibraryTable';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/user';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import BulkActionsBar from '../../components/library/BulkActionsBar';

export default function UsersView() {
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

  const { data: usersData, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers({}),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado');
      setIsConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteMultipleUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`${selectedIds.length} usuarios eliminados`);
      setIsBulkConfirmOpen(false);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleEdit = (slug: string) => {
    navigate(`/users/${slug}/edit`);
  };

  const handleCreate = () => {
    navigate('/users/create');
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

  // Filter out the current logged-in user from the list
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    const users = usersData.users;
    const loggedInUserString = localStorage.getItem('user');
    const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : null;
    
    return users.filter((user: User) => {
      const matchesSearch = 
        user.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userData?.documentNumber?.includes(searchTerm);
      
      const isNotLoggedInUser = user.userId !== loggedInUser?.userId;
      
      return matchesSearch && isNotLoggedInUser;
    });
  }, [usersData, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isError) return <ErrorMessage>{error.message}</ErrorMessage>;

  const columns = [
    {
      header: 'Usuario',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
            {user.userData.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user.userData.name}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contacto',
      render: (user: User) => (
        <div className="flex flex-col">
          <span className="text-xs text-slate-300">{user.userData.email}</span>
          <span className="text-[10px] text-slate-500 font-mono">{user.userData?.mobilePhone || 'Sin teléfono'}</span>
        </div>
      )
    },
    {
      header: 'Documento',
      render: (user: User) => (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <IdentificationIcon className="w-4 h-4 text-slate-600" />
          {user.userData?.documentNumber || 'N/A'}
        </div>
      )
    },
    {
        header: 'Académico',
        render: (user: User) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              <AcademicCapIcon className="w-3 h-3 text-slate-600" />
              {user.student?.school?.title || user.teacher?.faculty?.title || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
              <MapPinIcon className="w-3 h-3 text-slate-600" />
              {user.userData?.district?.title || 'N/A'}
            </div>
          </div>
        )
      },
    {
      header: 'Estado',
      render: (user: User) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          user.userData?.activeState 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {user.userData?.activeState ? 'ACTIVO' : 'INACTIVO'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title="¿Eliminar Usuario?"
        description="Esta acción eliminará al usuario y todos sus datos asociados de forma permanente."
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal 
        isOpen={isBulkConfirmOpen}
        setIsOpen={setIsBulkConfirmOpen}
        title="¿Eliminar Usuarios Seleccionados?"
        description={`Esta acción eliminará ${selectedIds.length} usuarios de forma permanente. No se podrán recuperar sus datos.`}
        onConfirm={handleConfirmBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Gestión de Usuarios</h1>
          <p className="text-slate-400 mt-1">Administra los accesos y perfiles del sistema</p>
        </div>

        <div className="flex items-center gap-4">
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onDelete={() => setIsBulkConfirmOpen(true)}
            onClearSelection={() => setSelectedIds([])}
            itemName="usuarios"
          />
          <button
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            onClick={handleCreate}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o DNI..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
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
            data={paginatedUsers}
            columns={columns}
            emptyMessage="No se encontraron usuarios"
            emptyIcon={UserCircleIcon}
            selectable={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            idExtractor={(user) => user.userId}
            renderActions={(user) => (
              <div className="flex justify-end gap-2">
                <button 
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" 
                  title="Editar"
                  onClick={() => handleEdit(user.slug || user.userId)}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" 
                  title="Eliminar"
                  onClick={() => handleDeleteClick(user.userId)}
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
