import React, { useRef, useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

/**
 * UploadPanel Component
 * Khu vực tải ảnh người dùng lên với drag & drop, preview
 */
const UploadPanel = ({ onImageSelected, selectedImage }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelected({
          file,
          preview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileChange(file);
  };

  const handleClear = () => {
    onImageSelected(null);
    fileInputRef.current.value = "";
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Tải Ảnh Của Bạn
        </h2>
        <p className="text-xs text-gray-600">
          <span className="text-blue-600 font-semibold">💡 Mẹo:</span> Tải ảnh
          toàn thân để có kết quả tốt nhất
        </p>
      </div>

      {/* Upload Area */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        {!selectedImage ? (
          // Drag & Drop Area
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              w-full h-full rounded-2xl border-2 border-dashed
              flex flex-col items-center justify-center cursor-pointer
              transition-all duration-300 ease-out
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
              }
              backdrop-blur-sm shadow-lg shadow-blue-100/20
            `}
          >
            {/* Icon */}
            <div
              className={`
              mb-4 transition-transform duration-300
              ${isDragging ? "scale-120" : "hover:scale-110"}
            `}
            >
              <FiUploadCloud
                className={`
                w-16 h-16 transition-colors duration-300
                ${isDragging ? "text-blue-600" : "text-gray-400"}
              `}
              />
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-700 mb-1">
                {isDragging
                  ? "Thả ảnh của bạn vào đây"
                  : "Kéo & thả ảnh vào đây"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                hoặc nhấp để chọn từ máy tính
              </p>
              <p className="text-xs text-gray-400">
                Hỗ trợ: JPG, PNG, WebP (tối đa 10MB)
              </p>
            </div>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              aria-label="Chọn ảnh"
            />
          </div>
        ) : (
          // Preview Image
          <div className="w-full h-full relative group flex items-center justify-center">
            <img
              src={selectedImage.preview}
              alt="Upload Preview"
              className="max-w-full max-h-full object-contain rounded-2xl"
            />

            {/* Overlay with Clear Button */}
            <div
              className="
              absolute inset-0 rounded-2xl
              bg-black/0 group-hover:bg-black/30 transition-colors duration-300
              flex items-center justify-center
            "
            >
              <button
                onClick={handleClear}
                className="
                  opacity-0 group-hover:opacity-100 transition-all duration-300
                  p-3 rounded-full bg-white/90 hover:bg-white
                  shadow-lg hover:shadow-xl
                  transform hover:scale-110 active:scale-95
                "
                title="Chọn lại ảnh"
              >
                <FiX className="w-6 h-6 text-red-600" />
              </button>
            </div>

            {/* Image Info */}
            <div
              className="
              absolute bottom-4 left-4 right-4
              bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg
              text-xs text-gray-700 truncate shadow-md
              hidden group-hover:block transition-all duration-300
            "
            >
              📁 {selectedImage.file.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPanel;
