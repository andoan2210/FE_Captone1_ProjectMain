import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, 
  CheckCircle2, XCircle, AlertCircle, Loader2,
  Layers, Tag
} from 'lucide-react';
import { CategoryService } from '../../services/CategoryService';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State - Tối giản theo phong cách Shopee (chỉ cần tên)
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAllCategoriesAdmin();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        CategoryName: formData.name.trim(),
        ParentId: null // Mặc định là null theo phong cách Shopee phẳng
      };

      if (selectedCategory) {
        await CategoryService.updateCategory(selectedCategory.id, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await CategoryService.createCategory(payload);
        toast.success('Thêm danh mục mới thành công');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await CategoryService.deleteCategory(selectedCategory.id);
      toast.success('Đã ẩn danh mục thành công');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Không thể xoá danh mục này');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-blue-600" size={24} />
            Quản lý Danh mục
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Thiết lập các nhóm ngành hàng giúp người mua dễ dàng tìm kiếm sản phẩm.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Thêm danh mục mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên danh mục (ví dụ: Áo thun, Điện thoại...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="h-10 w-[1px] bg-gray-100 hidden md:block"></div>
          <p className="text-sm font-bold text-gray-500 whitespace-nowrap">
            Tổng cộng: <span className="text-blue-600">{filteredCategories.length}</span>
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider w-24">ID</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Tên danh mục</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5 text-sm font-medium text-gray-400">#{cat.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                          <Tag size={18} />
                        </div>
                        <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {cat.IsActive ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100">
                          <CheckCircle2 size={14} />
                          Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100">
                          <XCircle size={14} />
                          Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Sửa tên"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Ẩn danh mục"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={40} className="text-gray-200" />
                      <p className="text-gray-400 italic">Không tìm thấy danh mục nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedCategory ? 'Sửa tên danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ví dụ: Thời Trang Nam, Mỹ Phẩm..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-base font-medium"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-6 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {selectedCategory ? 'Cập nhật' : 'Thêm ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ẩn danh mục?</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Sản phẩm thuộc danh mục <span className="font-bold text-gray-800">"{selectedCategory?.name}"</span> sẽ khó tìm kiếm hơn. Bạn chắc chắn chứ?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-4 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-6 py-4 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-xl shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  Đồng ý ẩn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
