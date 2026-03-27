import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
            <FiAlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3.5 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
