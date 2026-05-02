import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import {
  Search, Filter, Shield, User, Store, Ban, Trash2, CheckCircle2,
  AlertCircle, Edit, X, Eye, UserPlus, Mail, Phone, Calendar,
  ChevronLeft, ChevronRight, RefreshCw, MoreHorizontal, Users
} from 'lucide-react';

const ROLES = [
  { value: 'All', label: 'Tất cả vai trò' },
  { value: 'Client', label: 'Client' },
  { value: 'ShopOwner', label: 'ShopOwner' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'Tất cả trạng thái' },
  { value: 'Active', label: 'Hoạt động' },
  { value: 'Blocked', label: 'Đã khóa' },
];

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [editModal, setEditModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'Client', phone: '' });

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger',
    confirmText: 'Xác nhận',
  });

  // Edit form
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', role: '' });

  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => {
    if (editModal) setEditForm({ fullName: editModal.fullName || '', phone: editModal.phone || '', role: editModal.role || 'Client' });
  }, [editModal]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);

  const fetchAccounts = async () => {
    try {
      setLoading(true); setError(null);
      const data = await adminService.getAllAccounts();
      setAccounts(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // === ACTIONS ===
  const handleToggleStatus = (acc) => {
    const action = acc.status === 'Active' ? 'khóa' : 'mở khóa';
    setConfirmModal({
      show: true,
      title: `Xác nhận ${action} tài khoản`,
      message: `Bạn muốn ${action} tài khoản "${acc.fullName}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      type: acc.status === 'Active' ? 'warning' : 'success',
      onConfirm: async () => {
        try {
          setProcessing(true);
          await adminService.toggleAccountStatus(acc.id);
          toast.success(`Đã ${action} tài khoản "${acc.fullName}"`);
          await fetchAccounts();
          setEditModal(null);
        } catch (err) { toast.error(err.message); }
        finally {
          setProcessing(false);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const handleDelete = (acc) => {
    setConfirmModal({
      show: true,
      title: 'Xóa tài khoản vĩnh viễn',
      message: `⚠️ XÓA VĨNH VIỄN tài khoản "${acc.fullName}" (${acc.email})?\nHành động này không thể hoàn tác!`,
      confirmText: 'Xóa vĩnh viễn',
      type: 'danger',
      onConfirm: async () => {
        try {
          setProcessing(true);
          await adminService.deleteAccount(acc.email);
          toast.success(`Đã xóa tài khoản "${acc.fullName}"`);
          setAccounts(prev => prev.filter(a => a.id !== acc.id));
          setEditModal(null);
        } catch (err) { toast.error('Không thể xóa (tài khoản có dữ liệu liên quan)'); }
        finally {
          setProcessing(false);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    try {
      setProcessing(true);
      await adminService.updateUserInfo(editModal.id, editForm);
      toast.success('Cập nhật thành công!');
      await fetchAccounts();
      setEditModal(null);
    } catch (err) { toast.error(err.message); }
    finally { setProcessing(false); }
  };

  const handleCreateUser = async () => {
    if (!addForm.name || !addForm.email) {
      toast.error('Vui lòng điền đầy đủ họ tên và email'); return;
    }
    try {
      setProcessing(true);
      await adminService.createUser(addForm);
      toast.success('Tạo tài khoản thành công!');
      setAddModal(false);
      setAddForm({ name: '', email: '', role: 'Client', phone: '' });
      await fetchAccounts();
    } catch (err) { toast.error(err.message); }
    finally { setProcessing(false); }
  };

  const handleViewDetail = async (acc) => {
    try {
      setDetailLoading(true);
      setDetailModal(acc); // show immediately with basic info
      const detail = await adminService.getAccountDetail(acc.id);
      setDetailModal({
        ...acc,
        phone: detail.Phone || 'Chưa cập nhật',
        gender: detail.Gender || 'Chưa cập nhật',
        dob: detail.DateOfBirth ? new Date(detail.DateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
        authProvider: detail.AuthProvider || 'local',
      });
    } catch { /* keep basic info */ }
    finally { setDetailLoading(false); }
  };

  // === FILTER & PAGINATE ===
  const filtered = accounts.filter(acc => {
    if (acc.role === 'Admin') return false;
    const matchSearch = `${acc.fullName} ${acc.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'All' || acc.role === roleFilter;
    const matchStatus = statusFilter === 'All' || acc.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: accounts.filter(a => a.role !== 'Admin').length,
    active: accounts.filter(a => a.role !== 'Admin' && a.status === 'Active').length,
    blocked: accounts.filter(a => a.role !== 'Admin' && a.status !== 'Active').length,
    shopOwners: accounts.filter(a => a.role === 'ShopOwner').length,
  };

  // === RENDER ===
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            Quản lý Tài khoản
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý danh sách người dùng và nhà bán hàng trên hệ thống.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng tài khoản', value: stats.total, icon: <User size={20} />, color: 'blue' },
          { label: 'Đang hoạt động', value: stats.active, icon: <CheckCircle2 size={20} />, color: 'emerald' },
          { label: 'Đã khóa', value: stats.blocked, icon: <Ban size={20} />, color: 'red' },
          { label: 'Nhà bán hàng', value: stats.shopOwners, icon: <Store size={20} />, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-${s.color}-50 text-${s.color}-500 flex items-center justify-center`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Danh sách tài khoản</h2>
            <p className="text-sm text-gray-400 mt-0.5">{filtered.length} kết quả</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text" placeholder="Tìm tên, email..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-52"
              />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={fetchAccounts} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Làm mới">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
              <UserPlus size={15} /> Thêm tài khoản
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-64 text-red-500 gap-3">
            <AlertCircle size={32} />
            <p className="font-medium">{error}</p>
            <button onClick={fetchAccounts} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Không tìm thấy tài khoản nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left font-semibold">Người dùng</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Vai trò</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Trạng thái</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Ngày tạo</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(acc => (
                  <tr key={acc.id} className="hover:bg-blue-50/30 transition group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-sm">
                          {acc.avatar ? <img src={acc.avatar} alt="" className="w-full h-full object-cover" /> : (acc.fullName?.[0] || '?')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-[13px]">{acc.fullName}</p>
                          <p className="text-xs text-gray-400">{acc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${acc.role === 'ShopOwner' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>
                        {acc.role === 'ShopOwner' ? <Store size={11} /> : <User size={11} />}
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${acc.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {acc.status === 'Active' ? <><CheckCircle2 size={11} /> Hoạt động</> : <><Ban size={11} /> Đã khóa</>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 font-medium">{acc.joinDate}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button onClick={() => handleViewDetail(acc)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition" title="Xem chi tiết"><Eye size={16} /></button>
                        <button onClick={() => setEditModal(acc)} className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition" title="Chỉnh sửa"><Edit size={16} /></button>
                        <button onClick={() => handleToggleStatus(acc)}
                          className={`p-2 rounded-lg transition ${acc.status === 'Active' ? 'hover:bg-orange-50 text-gray-400 hover:text-orange-600' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`}
                          title={acc.status === 'Active' ? 'Khóa' : 'Mở khóa'}>
                          {acc.status === 'Active' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                        <button onClick={() => handleDelete(acc)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition" title="Xóa"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Hiển thị <span className="font-bold text-gray-600">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</span> / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* === MODAL: Chi tiết tài khoản === */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white relative">
              <button onClick={() => setDetailModal(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition"><X size={20} /></button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold overflow-hidden shadow-lg">
                  {detailModal.avatar ? <img src={detailModal.avatar} alt="" className="w-full h-full object-cover" /> : (detailModal.fullName?.[0] || '?')}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{detailModal.fullName}</h3>
                  <p className="text-white/70 text-sm flex items-center gap-1.5"><Mail size={13} />{detailModal.email}</p>
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ID', value: `#${detailModal.id}` },
                  { label: 'Vai trò', value: detailModal.role },
                  { label: 'Trạng thái', value: detailModal.status === 'Active' ? '✅ Hoạt động' : '🔒 Đã khóa' },
                  { label: 'Ngày tạo', value: detailModal.joinDate },
                  { label: 'Số điện thoại', value: detailModal.phone || 'Chưa cập nhật' },
                  { label: 'Giới tính', value: detailModal.gender || 'Chưa cập nhật' },
                  { label: 'Ngày sinh', value: detailModal.dob || 'Chưa cập nhật' },
                  { label: 'Đăng nhập qua', value: (detailModal.authProvider || 'local') === 'google' ? '🔵 Google' : '📧 Email' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setDetailModal(null)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition">Đóng</button>
                <button onClick={() => { setEditModal(detailModal); setDetailModal(null); }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                  <Edit size={14} className="inline mr-1.5 -mt-0.5" />Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: Chỉnh sửa === */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => !processing && setEditModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Chỉnh sửa tài khoản</h3>
              <button onClick={() => setEditModal(null)} disabled={processing} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0 text-sm">
                  {editModal.avatar ? <img src={editModal.avatar} alt="" className="w-full h-full object-cover" /> : (editModal.fullName?.[0] || '?')}
                </div>
                <div><p className="font-bold text-gray-800 text-sm">{editModal.fullName}</p><p className="text-xs text-gray-400">{editModal.email}</p></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên</label>
                <input type="text" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="0901234567" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vai trò</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-gray-50">
                  <option value="Client">Client</option><option value="ShopOwner">ShopOwner</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => handleToggleStatus(editModal)} disabled={processing} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${editModal.status === 'Active' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'}`}>
                  {editModal.status === 'Active' ? <><Ban size={14} /> Khóa</> : <><CheckCircle2 size={14} /> Mở khóa</>}
                </button>
                <button onClick={() => handleDelete(editModal)} disabled={processing} className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition">
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditModal(null)} disabled={processing} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">Hủy</button>
              <button onClick={handleSaveEdit} disabled={processing} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50">
                {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: Thêm tài khoản === */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => !processing && setAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><UserPlus size={18} /></div>
                <div><h3 className="text-lg font-bold text-gray-800">Thêm tài khoản</h3><p className="text-xs text-gray-400">Tạo tài khoản mới cho hệ thống</p></div>
              </div>
              <button onClick={() => setAddModal(false)} disabled={processing} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Nguyễn Văn A" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="example@email.com" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <span className="text-blue-500 text-sm mt-0.5">🔐</span>
                <p className="text-xs text-blue-600">Mật khẩu sẽ được <strong>tạo tự động</strong> và gửi về email.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                  <input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} placeholder="0901234567" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vai trò</label>
                  <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-gray-50">
                    <option value="Client">Client</option><option value="ShopOwner">ShopOwner</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setAddModal(false)} disabled={processing} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">Hủy</button>
              <button onClick={handleCreateUser} disabled={processing} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50">
                {processing ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: Xác nhận === */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className={`p-6 text-center ${confirmModal.type === 'danger' ? 'bg-red-50' :
              confirmModal.type === 'warning' ? 'bg-orange-50' : 'bg-emerald-50'
              }`}>
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' :
                confirmModal.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                {confirmModal.type === 'danger' ? <Trash2 size={32} /> :
                  confirmModal.type === 'warning' ? <Ban size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{confirmModal.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center whitespace-pre-line leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  disabled={processing}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition shadow-lg shadow-opacity-20 ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    confirmModal.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                      'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                  {processing ? 'Đang xử lý...' : confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
    </div>
  );
};

export default AccountManagement;
