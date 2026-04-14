import React, { useState, useEffect, useMemo } from 'react';
import adminService from '../../services/adminService';
import { Search, Filter, Shield, User, Store, Ban, Trash2, CheckCircle2, AlertCircle, Edit, X, Eye } from 'lucide-react';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of items per page

  // Modal State
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [viewAccount, setViewAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    fullName: '',
    email: '',
    role: 'CLIENT'
  });
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      setEditRole(selectedAccount.role);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (accountId, currentStatus) => {
    try {
      const res = await adminService.toggleAccountStatus(accountId, currentStatus);
      const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
      setAccounts(accounts.map(acc =>
        acc.id === accountId ? { ...acc, status: newStatus } : acc
      ));
      if (selectedAccount && selectedAccount.id === accountId) {
        setSelectedAccount({ ...selectedAccount, status: newStatus });
      }
    } catch (err) {
      console.error("Lỗi khi khóa/mở khóa:", err);
      alert("Không thể thay đổi trạng thái lúc này!");
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này khỏi hệ thống không? Hành động này không thể hoàn tác!")) return;

    try {
      await adminService.deleteAccount(accountId);
      setAccounts(accounts.filter(acc => acc.id !== accountId));
      setSelectedAccount(null);
    } catch (err) {
      console.error("Lỗi khi xóa tài khoản:", err);
      alert("Không thể xóa tài khoản lúc này!");
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Gọi service cập nhật.
      // Vì mockup hiện tại chưa sửa được nhiều nên ta chỉ update locally role.
      await adminService.updateAccount(selectedAccount.id, { role: editRole });
      setAccounts(accounts.map(acc => acc.id === selectedAccount.id ? { ...acc, role: editRole } : acc));
      setSelectedAccount(null);
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  // 1. Lọc dữ liệu theo Từ khóa và Role
  const filteredAccounts = accounts.filter(acc => {
    const isNotAdmin = acc.role !== 'Admin';

    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      acc.role.toUpperCase() === roleFilter.toUpperCase();

    return isNotAdmin && matchesSearch && matchesRole;
  });

  // Reset pagination to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // 2. Cắt dữ liệu cho từng trang
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Shield size={16} className="text-purple-600" />;
      case 'ShopOwner': return <Store size={16} className="text-blue-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return <span className="text-gray-700 text-sm font-semibold">{getRoleIcon(role)} Admin System</span>;
      case 'ShopOwner': return <span className="text-gray-700 text-sm font-semibold">ShopOwner</span>;
      default: return <span className="text-gray-700 text-sm font-semibold">Client</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden flex flex-col h-full animate-fadeIn relative z-0">

      {/* HEADER & FILTERS */}
      <div className="p-6 border-b border-gray-100 flex flex-col gap-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Tài khoản</h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý thông tin, phân quyền và trạng thái cả người dùng trên hệ thống.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-sm text-sm shrink-0"
          >
            + Thêm tài khoản mới
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Danh sách người dùng hệ thống</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm người dùng, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56 shadow-sm"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                <option value="All">All</option>
                <option value="SHOPOWNER">ShopOwner</option>
                <option value="CLIENT">Client</option>

              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500 flex-col gap-2">
            <AlertCircle size={32} />
            <p>Lỗi: {error}</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Không tìm thấy tài khoản nào phù hợp với bộ lọc.
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white sticky top-0 border-b border-gray-200 z-10 text-gray-400 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tài khoản & Email</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((acc) => (
                <tr key={acc.id} className="hover:bg-blue-50/40 transition bg-white">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-purple-700 overflow-hidden shrink-0">
                      {acc.avatar ? <img src={acc.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{acc.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{acc.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(acc.role)}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="text-blue-600 font-bold">{acc.joinDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    {acc.status === 'Active' ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-[11px] bg-red-50 px-2.5 py-1 rounded-full w-fit">
                        <Ban size={12} /> Lock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setViewAccount(acc)}
                        className="p-1.5 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition border border-transparent hover:border-blue-200"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedAccount(acc)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold transition border border-emerald-500 text-emerald-600 hover:bg-emerald-50 inline-flex items-center"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Đang hiển thị <span className="font-bold text-gray-700">{indexOfFirstItem + 1}</span> trên tổng số <span className="font-bold text-gray-700">{filteredAccounts.length}</span> sản phẩm cần xem xét.
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT VÀ CHỈNH SỬA TÀI KHOẢN */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa tài khoản</h3>
              <button onClick={() => setSelectedAccount(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 overflow-hidden shrink-0 text-2xl">
                  {selectedAccount.avatar ? <img src={selectedAccount.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={28} />}
                </div>
                <div>
                  <h4 className="text-[19px] font-bold text-gray-800">{selectedAccount.fullName}</h4>
                  <p className="text-sm text-gray-500 font-medium">{selectedAccount.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quyền hạn (Role)</label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-gray-50"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="SHOPOWNER">ShopOwner</option>
                  <option value="CLIENT">Client</option>

                </select>
              </div>

              {/* HÀNH ĐỘNG XÓA, KHÓA */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleToggleStatus(selectedAccount.id, selectedAccount.status)}
                  disabled={selectedAccount.role === 'Admin'}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${selectedAccount.role === 'Admin' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                    : selectedAccount.status === 'Active' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                  {selectedAccount.status === 'Active' ? <><Ban size={16} /> Khóa tài khoản</> : <><CheckCircle2 size={16} /> Mở khóa tài khoản</>}
                </button>
                <button
                  onClick={() => handleDelete(selectedAccount.id)}
                  disabled={selectedAccount.role === 'Admin'}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${selectedAccount.role === 'Admin' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                >
                  <Trash2 size={16} /> Xóa tài khoản
                </button>
              </div>

              <div className="flex justify-end pt-4 gap-3 mt-4">
                <button onClick={() => setSelectedAccount(null)} className="px-5 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition font-medium text-sm">
                  Hủy
                </button>
                <button onClick={handleSaveEdit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-md">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL XEM CHI TIẾT */}
      {viewAccount && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết tài khoản</h3>
              <button onClick={() => setViewAccount(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={22} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 overflow-hidden shrink-0 text-2xl shadow-inner">
                  {viewAccount.avatar ? <img src={viewAccount.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={28}/>}
                </div>
                <div>
                  <h4 className="text-[19px] font-bold text-gray-800">{viewAccount.fullName || 'N/A'}</h4>
                  <p className="text-sm text-gray-500 font-medium">ID: {viewAccount.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">Liên hệ Email</p>
                  <p className="text-sm font-semibold text-gray-800 break-all">{viewAccount.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">Ngày tham gia</p>
                  <p className="text-sm font-semibold text-gray-800">{viewAccount.joinDate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">Phân quyền</p>
                  <div className="mt-1">{getRoleBadge(viewAccount.role)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">Trạng thái</p>
                  <div className="mt-1">
                    {viewAccount.status === 'Active' ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100 w-fit">
                        <CheckCircle2 size={14} /> ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-[11px] bg-red-50 px-2.5 py-1.5 rounded-full border border-red-100 w-fit">
                        <Ban size={14} /> BLOCKED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3 mt-4 border-t border-gray-100">
                <button onClick={() => setViewAccount(null)} className="px-5 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition font-medium text-sm">
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    setSelectedAccount(viewAccount);
                    setViewAccount(null);
                  }} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-md"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM TÀI KHOẢN MỚI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-800">Thêm tài khoản mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  await adminService.createAccount(newAccount);

                  await fetchAccounts(); // reload data
                  setCurrentPage(1);     // về trang 1

                  setIsAddModalOpen(false);

                  setNewAccount({
                    fullName: '',
                    email: '',
                    role: 'CLIENT'
                  });

                  alert("Tạo tài khoản thành công!");

                } catch (err) {
                  console.error(err);
                  alert("Tạo thất bại: " + err.message);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tên người dùng</label>
                  <input
                    required
                    type="text"
                    value={newAccount.fullName}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, fullName: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input
                    required
                    type="email"
                    value={newAccount.email}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, email: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quyền hạn</label>
                  <select
                    value={newAccount.role}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, role: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg p-2.5"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="shopowner">ShopOwner</option>

                  </select>
                </div>

                <div className="flex justify-end pt-4 mt-2 gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition font-medium text-sm">
                    Hủy
                  </button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-md flex items-center gap-2">
                    Tạo tài khoản
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountManagement;
