// Sản phẩm
import React, { useState, useRef, useEffect } from 'react';
import {
  FiArrowLeft, FiUpload, FiPlus, FiSave, FiX,
  FiBold, FiItalic, FiList, FiLink, FiInfo, FiImage, FiGrid, FiCheck, FiTrash2, FiDollarSign
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { ProductService } from '../../services/ProductService';

// =============================================================================
// [1] KHỞI TẠO COMPONENT & QUẢN LÝ TRẠNG THÁI (STATE)
// =============================================================================
const ProductForm = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ...initialData,
    name: initialData?.name || '',
    category: initialData?.category || '',
    status: initialData?.status || 'Đang hoạt động',
    description: initialData?.description || '',
    variants: initialData?.variants || [
      { id: Date.now(), size: '', color: '', stock: '', price: '' }
    ],
    images: initialData?.images || (initialData?.image ? [initialData.image] : [])
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]); // Lưu các File mới chờ upload
  const fileInputRef = useRef(null);

  // =============================================================================
  // [2] CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT HANDLERS)
  // =============================================================================

  // Xử lý Xóa sản phẩm
  const handleDeleteConfirmed = async () => {
    try {
      await ProductService.deleteProduct(formData.id);
      setSuccessMessage('Đã xóa sản phẩm thành công!');
      setShowDeleteModal(false);
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/shop-owner/products');
      }, 1500);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const validateForm = (isDraft = false) => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    } else if (/^\d+$/.test(formData.name.trim())) {
      newErrors.name = 'Tên sản phẩm không được chỉ chứa chữ số';
    }
    if (!isDraft) {
      if (!formData.category) newErrors.category = 'Vui lòng chọn danh mục';
  
      if (!formData.variants || formData.variants.length === 0) {
        newErrors.variants = 'Vui lòng thêm ít nhất một biến thể sản phẩm';
      } else {
        const variantErrors = [];
        formData.variants.forEach((v, idx) => {
          if (!v.size.trim() || !v.color.trim() || v.price === '' || v.stock === '') {
            variantErrors.push(`Biến thể ${idx + 1} chưa nhập đủ thông tin`);
          } else if (Number(v.price) <= 0) {
            variantErrors.push(`Biến thể ${idx + 1}: Giá phải lớn hơn 0`);
          } else if (Number(v.stock) < 0) {
            variantErrors.push(`Biến thể ${idx + 1}: Kho hàng không được âm`);
          }
        });
        if (variantErrors.length > 0) newErrors.variants = variantErrors[0];
      }
  
      if (formData.images.length === 0) newErrors.images = 'Vui lòng tải lên ít nhất một hình ảnh sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images];
    const imageErrors = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        imageErrors.push(`File ${file.name} quá lớn (tối đa 5MB)`);
      } else if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        imageErrors.push(`File ${file.name} không đúng định dạng (JPG, PNG, WebP)`);
      } else {
        newImages.push(URL.createObjectURL(file));
        setPendingFiles(prev => [...prev, file]);
      }
    });

    if (imageErrors.length > 0) {
      setErrors(prev => ({ ...prev, images: imageErrors[0] }));
    } else {
      setFormData(prev => ({ ...prev, images: newImages }));
      setIsDirty(true);
      setErrors(prev => ({ ...prev, images: null }));
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setIsDirty(true);
  };
  
  // --- QUẢN LÝ BIẾN THỂ ---
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { id: Date.now(), size: '', color: '', stock: '', price: '' }]
    }));
    setIsDirty(true);
  };
  
  const removeVariant = (id) => {
    if (formData.variants.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id)
    }));
    setIsDirty(true);
  };
  
  const updateVariant = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
    setIsDirty(true);
    if (errors.variants) {
      setErrors(prev => ({ ...prev, variants: null }));
    }
  };
  
  // Xử lý LƯU SẢN PHẨM (Add hoặc Update)
  const handleSave = async (isDraft = false) => {
    if (!validateForm(isDraft)) return;

    setLoading(true);
    try {
      let finalImages = [...formData.images];

      // 1. Tải các ảnh mới lên Server (nếu có)
      if (pendingFiles.length > 0) {
        try {
          const uploadedUrls = await ProductService.uploadProductImages(pendingFiles);
          // Thay thế các blob URL bằng URL thật từ server
          finalImages = finalImages.filter(img => !img.startsWith('blob:')).concat(uploadedUrls);
        } catch (uploadError) {
          console.error("Image upload failed", uploadError);
          // Vẫn tiếp tục lưu với ảnh cũ hoặc báo lỗi tùy yêu cầu
        }
      }

      // 2. Lưu sản phẩm với danh sách ảnh cuối cùng
      const updatedData = { ...formData, images: finalImages };
      await ProductService.saveProduct(updatedData, isEdit);

      setSuccessMessage(isDraft ? 'Đã lưu bản nháp thành công!' : (isEdit ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới thành công!'));
      setIsDirty(false);
      setPendingFiles([]);

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/shop-owner/products');
      }, 2000);
    } catch (error) {
      console.error("Save failed", error);
      setErrors(prev => ({ ...prev, submit: "Có lỗi xảy ra khi lưu sản phẩm." }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    handleSave(false);
  };

  const handleSaveDraft = () => {
    handleSave(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      navigate('/shop-owner/products');
    }
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Đang hoạt động' ? 'Tạm ẩn' : 'Đang hoạt động'
    }));
  };

  // =============================================================================
  // [3] PHẦN GIAO DIỆN (RENDER JSX)
  // =============================================================================
  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 3.1 Tiêu đề & Nút quay lại */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 mb-2 gap-2 font-medium">
            <span>Trang chủ</span>
            <span className="text-slate-300">/</span>
            <span>Cửa hàng</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Cập nhật chi tiết sản phẩm và quản lý tồn kho của bạn.' : 'Tạo sản phẩm mới để hiển thị trên cửa hàng của bạn.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/shop-owner/products')}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
        >
          <FiArrowLeft size={18} />
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: Nhập liệu thông tin */}
        <div className="lg:col-span-2 space-y-8">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold animate-in fade-in zoom-in duration-300">
              <div className="bg-emerald-500 text-white p-1 rounded-full">
                <FiCheck size={16} />
              </div>
              {successMessage}
            </div>
          )}
          {/* Thông tin chung */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FiInfo size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Thông tin chung</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Áo sơ mi Oxford Slim Fit"
                  className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                />
                {errors.name && <p className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${errors.category ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Thời trang">Thời trang</option>

                  </select>
                  {errors.category && <p className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Trạng thái</label>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className={`text-sm font-bold ${formData.status === 'Đang hoạt động' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {formData.status}
                    </span>
                    <button
                      onClick={toggleStatus}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'Đang hoạt động' ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 'Đang hoạt động' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Mô tả sản phẩm</label>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100">
                    {[FiBold, FiItalic, FiList, FiLink].map((Icon, idx) => (
                      <button key={idx} className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-lg transition-all" type="button">
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Nhập mô tả chi tiết sản phẩm..."
                    className="w-full px-4 py-3 text-sm focus:outline-none resize-none bg-white font-medium"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* 3.2 Nhóm: Biến thể sản phẩm (THAY CHO GIÁ & KHO HÀNG) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FiGrid size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Biến thể sản phẩm</h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                <FiPlus size={16} />
                Thêm biến thể
              </button>
            </div>
  
            <div className="overflow-x-auto -mx-4 px-4 custom-scrollbar">
              <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}</style>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">Size</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">Màu</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">Kho hàng</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">Giá bán (VND)</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2 text-center w-16">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {formData.variants.map((v, idx) => (
                    <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2">
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                          placeholder="L, XL, 40..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                          placeholder="Đỏ, Xanh..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(v.id, 'stock', e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className={`p-2 rounded-lg transition-all ${formData.variants.length > 1 ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50' : 'text-slate-200 cursor-not-allowed'}`}
                          disabled={formData.variants.length <= 1}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.variants && (
              <p className="text-rose-500 text-xs font-bold mt-2 ml-1 flex items-center gap-2">
                <FiInfo size={14} /> {errors.variants}
              </p>
            )}
            <p className="text-slate-400 text-[11px] font-medium italic mt-2">
              * Mẹo: Bạn có thể nhập nhiều biến thể khác nhau về kích thước và màu sắc cho cùng một sản phẩm.
            </p>
          </div>

          {isEdit && (
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-rose-600">Xóa sản phẩm</h3>
                <p className="text-sm text-slate-500">Hành động này không thể hoàn tác. Mọi dữ liệu liên quan sẽ biến mất.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-95"
              >
                <FiTrash2 size={18} />
                Xóa sản phẩm
              </button>
            </div>
          )}

        </div>

        {/* CỘT PHẢI: Hình ảnh & Xem trước */}
        <div className="space-y-8">
          {/* 3.3 Nhóm: Quản lý Hình ảnh */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-2">
              <FiImage className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">Hình ảnh</h2>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${errors.images ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${errors.images ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                <FiUpload size={24} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${errors.images ? 'text-rose-600' : 'text-slate-700'}`}>
                  {errors.images || 'Click để tải lên hoặc kéo thả'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG tối đa 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(formData.images || []).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group animate-in zoom-in duration-300">
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-2 bg-white text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                </div>
              ))}
              {formData.images.length < 6 && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-400 cursor-pointer transition-all"
                >
                  <FiPlus size={20} />
                </div>
              )}
            </div>
          </div>

          {/* 3.4 Nhóm: Xem trước Giao diện Shop */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <FiGrid className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Xem trước cửa hàng</h2>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ring-1 ring-emerald-100">Công khai</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
              <div className="aspect-square rounded-xl bg-white shadow-sm border border-slate-200/50 overflow-hidden relative">
                {formData.images.length > 0 ? (
                  <img src={formData.images[0]} className="w-full h-full object-cover animate-in fade-in duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <FiImage size={48} className="opacity-20" />
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Chưa có ảnh</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded w-fit">CÒN HÀNG</div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{formData.category || 'DANH MỤC'}</p>
                <h4 className="font-extrabold text-slate-800 leading-tight">{formData.name || 'Tên sản phẩm sẽ hiển thị ở đây'}</h4>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-blue-600 font-black">
                    {formData.variants && formData.variants.length > 0 && formData.variants[0].price
                      ? Number(formData.variants[0].price).toLocaleString('vi-VN') + 'đ'
                      : '0đ'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold italic">
                    {formData.variants && formData.variants.length > 0
                      ? `Còn ${formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)} sản phẩm`
                      : 'Hết hàng'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FiInfo /> Thông tin hệ thống
              </h3>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex justify-between py-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Product ID:</span>
                  <span className="text-slate-800">PROD-12345</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Store ID:</span>
                  <span className="text-slate-800">STORE-88</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Ngày tạo:</span>
                  <span className="text-slate-800">12/05/2023</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Cập nhật:</span>
                  <span className="text-slate-800 uppercase tracking-tighter">Vừa mới đây</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3.5 THANH CÔNG CỤ NỔI (ACTION BAR) */}
      <div className="fixed bottom-8 right-8 z-30 flex gap-3 animate-in slide-in-from-right-10 duration-700">
        <button
          onClick={handleCancel}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-50 transition-all active:scale-95"
        >
          Hủy
        </button>
        {!isEdit && (
          <button
            onClick={handleSaveDraft}
            className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-900 transition-all active:scale-95"
          >
            Lưu nháp
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang xử lý...
            </div>
          ) : (
            <>
              <FiCheck size={20} />
              {isEdit ? 'Lưu thay đổi' : 'Lưu sản phẩm'}
            </>
          )}
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => navigate('/shop-owner/products')}
        title="Hủy bỏ thay đổi?"
        message="Những thông tin bạn vừa nhập sẽ không được lưu lại. Bạn có chắc chắn muốn rời đi?"
        confirmText="Rời khỏi trang"
        cancelText="Tiếp tục chỉnh sửa"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirmed}
        title="Xác nhận xóa sản phẩm?"
        message={`Bạn có chắc chắn muốn xóa "${formData.name}"? Hành động này không thể hoàn tác và dữ liệu sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        isDanger={true}
      />
    </div>
  );
};

export default ProductForm;
