// src/app/admin/users/UsersTable.tsx
'use client';

import { useState, useTransition } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  status: string;
  createdAt: string | Date;
};

type UsersTableProps = {
  users: User[];
  addUserAction: (formData: FormData) => Promise<void>;
  editUserAction: (id: number, formData: FormData) => Promise<void>;
  deleteUserAction: (id: number, type: 'real' | 'demo') => Promise<void>;
  type: 'real' | 'demo';
  isDemoAdmin?: boolean; // Whether the logged-in admin is a demo account
};

export default function UsersTable({ 
  users, 
  addUserAction, 
  editUserAction, 
  deleteUserAction,
  type,
  isDemoAdmin = false
}: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'LECTURER' | 'STUDENT'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  // Determine permissions based on type and admin role
  const canAdd = type === 'demo' && isDemoAdmin; // Only demo admins can add demo users
  const canEdit = type === 'demo' && isDemoAdmin; // Only demo admins can edit demo users
  const canDelete = type === 'demo' && isDemoAdmin; // Only demo admins can delete demo users
  const isReadOnly = type === 'real' || (!isDemoAdmin && type === 'demo'); // Real accounts are always read-only

  const filteredUsers = users
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    .filter(u => roleFilter === 'ALL' || u.role === roleFilter);

  const handleDelete = (id: number) => {
    if (confirm(`Delete this ${type} user permanently from the database?`)) {
      startTransition(async () => {
        await deleteUserAction(id, type);
      });
    }
  };

  const handleAddUser = async (formData: FormData) => {
    startTransition(async () => {
      await addUserAction(formData);
      setShowAddModal(false);
    });
  };

  const handleEditUser = async (formData: FormData) => {
    startTransition(async () => {
      const id = parseInt(formData.get('id') as string);
      await editUserAction(id, formData);
      setEditingUser(null);
    });
  };

  return (
    <>
      {/* Controls */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 pl-11 py-3 rounded-2xl focus:outline-none focus:border-teal-400 text-base"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-white border border-zinc-200 px-6 py-3 rounded-2xl focus:outline-none focus:border-teal-400"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="LECTURER">Lecturer</option>
            <option value="STUDENT">Student</option>
          </select>
          {canAdd && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all active:scale-95"
            >
              <Plus className="h-5 w-5" /> Add Demo User
            </button>
          )}
        </div>
      </div>

      {/* Read-only Notice */}
      {isReadOnly && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-amber-700 text-sm">
            <strong>Read-only mode:</strong> {type === 'real' 
              ? 'Real accounts cannot be modified for security reasons.' 
              : 'You are viewing demo accounts in read-only mode. Demo accounts can only be modified by demo administrators.'}
          </p>
        </div>
      )}

      {/* Modern Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left py-5 px-8 font-semibold text-zinc-500">User</th>
              <th className="text-left py-5 px-8 font-semibold text-zinc-500">Role</th>
              <th className="text-left py-5 px-8 font-semibold text-zinc-500">Status</th>
              <th className="text-left py-5 px-8 font-semibold text-zinc-500">Joined</th>
              <th className="text-left py-5 px-8 font-semibold text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b hover:bg-zinc-50 transition-all">
                <td className="py-5 px-8">
                  <div>
                    <p className="font-semibold text-zinc-900">{user.name}</p>
                    <p className="text-sm text-zinc-500">{user.email}</p>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className={`px-4 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                    user.role === 'LECTURER' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-5 px-8">
                  <span className="px-4 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                    {user.status}
                  </span>
                </td>
                <td className="py-5 px-8 text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-5 px-8">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowViewModal(user)} 
                      className="p-2 hover:bg-zinc-100 rounded-xl transition"
                      disabled={isPending}
                    >
                      <Eye className="h-5 w-5 text-zinc-500" />
                    </button>
                    {canEdit && (
                      <button 
                        onClick={() => setEditingUser(user)} 
                        className="p-2 hover:bg-zinc-100 rounded-xl transition"
                        disabled={isPending}
                      >
                        <Edit className="h-5 w-5 text-zinc-500" />
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="p-2 hover:bg-red-50 rounded-xl transition"
                        disabled={isPending}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingUser) && (
        <Modal
          user={editingUser || undefined}
          onSubmit={editingUser ? handleEditUser : handleAddUser}
          onClose={() => { setShowAddModal(false); setEditingUser(null); }}
          isPending={isPending}
        />
      )}

      {/* View Modal */}
      {showViewModal && (
        <ModalView user={showViewModal} onClose={() => setShowViewModal(null)} />
      )}
    </>
  );
}

// ====================== MODALS ======================
function Modal({ 
  user, 
  onSubmit, 
  onClose,
  isPending
}: { 
  user?: User; 
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
  isPending: boolean;
}) {
  const isEdit = !!user;

  const handleSubmit = async (formData: FormData) => {
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-semibold mb-6">{isEdit ? 'Edit Demo User' : 'Add New Demo User'}</h3>
        
        <form action={handleSubmit} className="space-y-6">
          {isEdit && <input type="hidden" name="id" value={user.id} />}
          
          <input 
            type="text" 
            name="name" 
            defaultValue={user?.name} 
            placeholder="Full Name" 
            className="w-full border border-zinc-200 rounded-2xl px-5 py-3 focus:outline-none focus:border-teal-400" 
            required 
            disabled={isPending}
          />
          <input 
            type="email" 
            name="email" 
            defaultValue={user?.email} 
            placeholder="Email (must end with @example.com, @demo.com, or @test.com)" 
            className="w-full border border-zinc-200 rounded-2xl px-5 py-3 focus:outline-none focus:border-teal-400" 
            required 
            pattern=".*@(example\.com|demo\.com|test\.com)$"
            title="Email must be from demo domains: @example.com, @demo.com, or @test.com"
            disabled={isPending}
          />
          <select 
            name="role" 
            defaultValue={user?.role || 'STUDENT'} 
            className="w-full border border-zinc-200 rounded-2xl px-5 py-3 focus:outline-none focus:border-teal-400"
            disabled={isPending}
          >
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ADMIN">Admin</option>
          </select>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 border border-zinc-200 rounded-2xl font-medium hover:bg-zinc-50"
              disabled={isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-teal-600 text-white rounded-2xl font-medium hover:bg-teal-700 disabled:bg-teal-300"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalView({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-semibold mb-6">User Details</h3>
        <div className="space-y-4 text-zinc-700">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.status}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={onClose} 
          className="mt-8 w-full py-3 border border-zinc-200 rounded-2xl font-medium hover:bg-zinc-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}