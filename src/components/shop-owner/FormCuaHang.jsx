// Cửa hàng
/**
 * File: FormCuaHang.jsx
 * Mục đích: Form quản lý thông tin cửa hàng, cho phép người dùng thay đổi Logo, Tên, Mô tả và Bật/tắt trạng thái.
 * Chứa logic gọi API Upload ảnh, Submit form cập nhật data, và nhận dữ liệu khởi tạo thông qua props.
 */
import React, { useEffect, useState, useRef } from 'react';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';
import { CuahangService } from '@/services/CuahangService';

export default function FormCuaHang({ initialData, onUpdateSuccess }) {
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true, logoUrl: '' });
  const [selectedFile, setSelectedFile] = useState(null); // File ảnh đang được chọn ở client
  const [previewUrl, setPreviewUrl] = useState(''); // Ảnh preview tạm thời

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const resetFormToInitial = () => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        isActive: initialData.isActive !== false,
        logoUrl: initialData.logoUrl || ''
      });
    }
    setSelectedFile(null);
    setPreviewUrl('');
    // Không nên reset message ở đây vì khi parent cập nhật props (lúc báo lưu thành công), effect này sẽ vô tình xóa chữ báo thành công.
  };

  useEffect(() => {
    resetFormToInitial();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  // Chỉ Preview ảnh ở Client, chưa up lên API vội
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Kích thước ảnh tối đa là 5MB.' });
      return;
    }

    setMessage('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    resetFormToInitial();
    setMessage({ type: 'info', text: 'Đã khôi phục lại dữ liệu gốc.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dữ liệu đầu vào (Frontend Validation)
    if (!formData.name || !formData.name.trim()) {
      setMessage({ type: 'error', text: 'Tên cửa hàng không được để trống.' });
      return;
    }
    if (formData.name.trim().length < 3) {
      setMessage({ type: 'error', text: 'Tên cửa hàng phải có ít nhất 3 ký tự.' });
      return;
    }
    if (formData.name.length > 100) {
      setMessage({ type: 'error', text: 'Tên cửa hàng không vượt quá 100 ký tự.' });
      return;
    }
    if (formData.description && formData.description.length > 500) {
      setMessage({ type: 'error', text: 'Mô tả không được vượt quá 500 ký tự.' });
      return;
    }

    setIsSaving(true);
    setMessage('');

    let finalLogoUrl = formData.logoUrl;

    try {
      // Gọi PATCH /store/me với multipart/form-data (storeName, description, logo)
      const dto = { storeName: formData.name, description: formData.description };
      await CuahangService.updateMyStore(dto, selectedFile || undefined);

      setMessage({ type: 'success', text: 'Đã lưu thay đổi thành công!' });
      setSelectedFile(null);
      setPreviewUrl('');

      if (onUpdateSuccess) onUpdateSuccess({ name: formData.name, description: formData.description, isActive: formData.isActive, logoUrl: previewUrl || formData.logoUrl });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Lưu thất bại. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentLogoDisplay = previewUrl || formData.logoUrl;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/60 p-7 flex-1">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100/60 pb-5">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Cập nhật thông tin</h2>
        {message && (
          <span className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' :
            message.type === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200/50' :
              'bg-slate-100 text-slate-700'
            }`}>
            {message.type === 'success' && <FiCheck className="inline mr-1" />}
            {message.text}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Logo cửa hàng</label>
          <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/png, image/jpeg, image/gif" className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center px-6 py-10 border-2 border-slate-200/80 border-dashed rounded-2xl bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400/80 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            {currentLogoDisplay ? (
              <img src={currentLogoDisplay} alt="Store logo" className="h-28 w-auto object-contain mx-auto drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="space-y-3 text-center">
                <div className="w-14 h-14 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:shadow group-hover:-translate-y-1 transition-all duration-300">
                  <FiUploadCloud className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-sm text-slate-600">
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    Tải lên ảnh mới
                  </span> <span className="text-slate-400 font-light">(Bấm để chọn lại)</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">PNG, JPG, GIF tối đa 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Tên cửa hàng</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm text-slate-800 placeholder-slate-400 shadow-sm" required />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Mô tả cửa hàng</label>
          <textarea id="description" name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none shadow-sm leading-relaxed" />
        </div>



        <div className="pt-6 mt-8 border-t border-slate-100/80 flex items-center justify-end gap-4">
          <button type="button" onClick={handleCancel} disabled={isSaving} className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm hover:shadow disabled:opacity-50">Hủy bỏ</button>
          <button type="submit" disabled={isSaving} className={`px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSaving ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}>
            {isSaving ? 'Đang xuất bản...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
