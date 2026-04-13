import React from "react";
import { FiDownloadCloud } from "react-icons/fi";

/**
 * ResultPreview Component
 * Khu vực hiển thị kết quả thử đồ AI
 */
const ResultPreview = ({ isLoading, resultImage, onDownload }) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Kết Quả Thử Đồ AI
        </h2>
        <p className="text-xs text-gray-600">
          Xem kết quả thử đồ của bạn tại đây
        </p>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0">
        {isLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Loading Animation */}
            <div className="relative w-32 h-32">
              {/* Outer rotating ring */}
              <div
                className="
                absolute inset-0 rounded-full border-4 border-transparent
                border-t-blue-500 border-r-blue-500
                animate-spin
              "
              ></div>

              {/* Middle ring */}
              <div
                className="
                absolute inset-4 rounded-full border-4 border-transparent
                border-l-blue-400
                animate-spin
                opacity-70
              "
                style={{
                  animationDirection: "reverse",
                  animationDuration: "2s",
                }}
              ></div>

              {/* Inner pulsing dot */}
              <div
                className="
                absolute inset-0 flex items-center justify-center
              "
              >
                <div
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600
                  rounded-full animate-pulse shadow-lg shadow-blue-500/50"
                ></div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                🤖 AI đang xử lý...
              </p>
              <p className="text-sm text-gray-600">
                Vui lòng chờ trong giây lát
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
              <div
                className="
                h-full bg-gradient-to-r from-blue-500 to-blue-600
                animate-pulse
                rounded-full
              "
              ></div>
            </div>
          </div>
        ) : resultImage ? (
          // Result Image
          <div className="w-full h-full relative group flex items-center justify-center">
            <img
              src={resultImage}
              alt="AI Try-On Result"
              className="max-w-full max-h-full object-contain rounded-2xl"
            />

            {/* Overlay with Download Button */}
            <div
              className="
              absolute inset-0 rounded-2xl
              bg-black/0 group-hover:bg-black/30 transition-colors duration-300
              flex items-center justify-center
            "
            >
              <button
                onClick={onDownload}
                className="
                  opacity-0 group-hover:opacity-100 transition-all duration-300
                  p-3 rounded-full bg-blue-600 hover:bg-blue-700
                  shadow-lg hover:shadow-xl
                  transform hover:scale-110 active:scale-95
                "
                title="Tải ảnh xuống"
              >
                <FiDownloadCloud className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Success Badge */}
            <div
              className="
              absolute top-4 right-4
              bg-green-500/90 backdrop-blur-md px-3 py-2 rounded-lg
              text-xs font-semibold text-white
              shadow-md flex items-center gap-2
            "
            >
              <span className="text-lg">✓</span>
              <span>Hoàn tất</span>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="text-6xl opacity-30">👗</div>
            <div>
              <p className="text-lg font-semibold text-gray-500 mb-2">
                Chưa có kết quả
              </p>
              <p className="text-sm text-gray-400">
                Tải ảnh và chọn sản phẩm để bắt đầu thử đồ
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPreview;
