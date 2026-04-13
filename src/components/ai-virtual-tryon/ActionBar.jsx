import React from "react";
import { FiZap, FiRefreshCw } from "react-icons/fi";

/**
 * ActionBar Component
 * Thanh hành động: Thử ngay, Chọn lại, Tải xuống
 */
const ActionBar = ({
  selectedImage,
  selectedProduct,
  isLoading,
  onTryOn,
  onReset,
  onDownload,
}) => {
  return (
    <div className="w-full pt-3 border-t border-gray-200">
      <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center justify-center">
        {/* Try On Button */}
        <button
          onClick={onTryOn}
          disabled={!selectedImage || !selectedProduct || isLoading}
          className={`
            px-4 py-2 rounded-md font-medium text-sm
            flex items-center justify-center gap-1
            transition-all duration-200 ease-out
            transform hover:scale-105 active:scale-95
            whitespace-nowrap
            ${
              !selectedImage || !selectedProduct || isLoading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white " +
                  "hover:shadow-lg hover:shadow-blue-600/50 " +
                  "shadow-md"
            }
          `}
        >
          <FiZap className="w-4 h-4" />
          <span>Thử Ngay</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-md font-medium text-sm
            flex items-center justify-center gap-1
            transition-all duration-200 ease-out
            transform hover:scale-105 active:scale-95
            bg-white/80 backdrop-blur-sm
            border-2 border-gray-300 hover:border-gray-400
            text-gray-700 hover:text-gray-900
            shadow-md hover:shadow-lg
            whitespace-nowrap
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Chọn Lại</span>
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-md font-medium text-sm
            flex items-center justify-center gap-1
            transition-all duration-200 ease-out
            transform hover:scale-105 active:scale-95
            whitespace-nowrap
            ${
              isLoading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white " +
                  "hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/50 " +
                  "shadow-md"
            }
          `}
          title="Tải ảnh kết quả xuống"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Tải</span>
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
