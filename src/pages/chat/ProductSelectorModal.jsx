import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiLoader, FiExternalLink } from "react-icons/fi";
import { ProductService } from "../../services/ProductService";
import "./ProductSelectorModal.css";

const ProductSelectorModal = ({ isOpen, onClose, onSelect, shopId }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && shopId) {
      loadProducts();
    }
  }, [isOpen, shopId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProductShop(shopId, 20);
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products for chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDetail = (productId) => {
    navigate(`/products/${productId}`);
    onClose();
  };

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="product-selector-overlay" onClick={onClose}>
      <div className="product-selector-content" onClick={(e) => e.stopPropagation()}>
        <div className="selector-header">
          <h3>Chọn sản phẩm</h3>
          <button className="close-btn" onClick={onClose} title="Đóng">
            <FiX size={20} />
          </button>
        </div>

        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="product-list custom-scrollbar">
          {loading ? (
            <div className="loading-state">
              <FiLoader className="spin-icon" size={32} />
              <span>Đang tải danh sách sản phẩm...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>Không tìm thấy sản phẩm nào trong cửa hàng này</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-item">
                <div 
                  className="product-clickable-area"
                  onClick={() => handleGoToDetail(product.id)}
                  title="Xem chi tiết sản phẩm"
                >
                  <img
                    src={product.thumbnail || "https://via.placeholder.com/60"}
                    alt={product.name}
                    className="product-thumb"
                  />
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">
                      {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                    </span>
                  </div>
                </div>
                <button
                  className="send-product-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(product);
                  }}
                >
                  Gửi
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;
