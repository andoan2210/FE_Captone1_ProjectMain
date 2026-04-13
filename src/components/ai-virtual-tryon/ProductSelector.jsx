import React, { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * ProductSelector Component
 * Khu vực chọn sản phẩm để thử (carousel dạng grid)
 */
const ProductSelector = ({
  products,
  selectedProduct,
  onProductSelect,
  isLoading,
}) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-lg font-bold text-gray-900 mb-2"
          style={{ fontSize: "18px", fontWeight: "600" }}
        >
          Chọn Sản Phẩm Để Thử
        </h3>
        <p className="text-sm text-gray-600">
          Lựa chọn từ bộ sưu tập các sản phẩm mặc định
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="
            flex gap-4 overflow-x-auto
            scroll-smooth
            pb-2
            scroll-hide
          "
          style={{
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {products.map((product) => (
            <button
              key={product.ProductId || product.id}
              onClick={() => onProductSelect(product)}
              disabled={isLoading}
              className={`
                flex-shrink-0 w-56 group cursor-pointer
                transition-all duration-300 ease-out
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              style={{ transform: "perspective(1000px)" }}
            >
              {/* Card */}
              <div
                className={`
                w-full h-64 rounded-xl overflow-hidden
                transition-all duration-300 ease-out
                shadow-md hover:shadow-lg
                ${
                  (selectedProduct?.ProductId || selectedProduct?.id) ===
                  (product.ProductId || product.id)
                    ? "ring-3 ring-blue-500 scale-105"
                    : "hover:scale-105"
                }
              `}
              >
                {/* Image */}
                <div className="w-full h-64 bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.ThumbnailUrl || product.image}
                    alt={product.ProductName || product.name}
                    className="
                      w-full h-full object-cover
                      transition-transform duration-300 ease-out
                      group-hover:scale-110
                    "
                  />

                  {/* Badge */}
                  <div
                    className="
                    absolute top-2 right-2
                    bg-blue-600/90 backdrop-blur-md
                    px-3 py-1 rounded-full
                    text-xs font-bold text-white
                    shadow-md
                  "
                  >
                    {product.tag || "HÀNG"}
                  </div>

                  {/* Selected Overlay */}
                  {(selectedProduct?.ProductId || selectedProduct?.id) ===
                    (product.ProductId || product.id) && (
                    <div
                      className="
                      absolute inset-0 bg-blue-600/20
                      flex items-center justify-center
                    "
                    >
                      <div
                        className="
                        w-12 h-12 bg-white rounded-full
                        flex items-center justify-center
                        shadow-lg
                      "
                      >
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate mb-1">
                    {product.ProductName || product.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {product.category || "DANH MỤC"}
                  </p>
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-1.5 shadow-md shadow-blue-600/30">
                    <p className="text-sm font-bold text-white">
                      {product.Price
                        ? `${product.Price.toLocaleString("vi-VN")}đ`
                        : product.price}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4
            w-10 h-10 rounded-full
            bg-white/80 backdrop-blur-md hover:bg-white
            shadow-lg hover:shadow-xl
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:scale-110 active:scale-95
            z-10
          "
          aria-label="Cuộn trái"
        >
          <FiChevronLeft className="w-6 h-6 text-blue-600" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-4
            w-10 h-10 rounded-full
            bg-white/80 backdrop-blur-md hover:bg-white
            shadow-lg hover:shadow-xl
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:scale-110 active:scale-95
            z-10
          "
          aria-label="Cuộn phải"
        >
          <FiChevronRight className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scroll-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductSelector;
