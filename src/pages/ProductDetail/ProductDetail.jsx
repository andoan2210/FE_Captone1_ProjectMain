import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaShoppingCart,
  FaSearch,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaHeart,
  FaShareAlt,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaUserCircle,
  FaBox,
  FaSignOutAlt,
  FaUser,
  FaCheck,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import * as ProductService from "../../services/ProductService";
import * as CartService from "../../services/CartService";
import * as ProductDetailService from "../../services/ProductDetailService";
import { CuahangService } from "../../services/CuahangService";
import { CategoryService } from "../../services/CategoryService";
import chatService from "../../services/chatService";

import "../LandingPage/LandingPage.css";
import "./ProductDetail.css";

// Reuse user label logic
function getUserDisplayNameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return (
      payload.email ||
      payload.name ||
      payload.fullName ||
      payload.username ||
      payload.sub ||
      null
    );
  } catch {
    return null;
  }
}

function PageHeader({ userLabel, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const handleNavClick = (categoryId) => {
    if (categoryId === "all") {
      navigate("/");
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <label className="search-wrap">
            <span className="visually-hidden">Tìm kiếm sản phẩm</span>
            <FaSearch className="search-icon" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="search-bar"
              autoComplete="off"
            />
          </label>
          <div className="user-actions">
            <Link to="/cart" className="icon-link" aria-label="Giỏ hàng">
              <FaShoppingCart />
            </Link>
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
                  <FaUserCircle
                    style={{ fontSize: "20px", color: "var(--lp-accent)" }}
                  />
                  <span className="user-profile">{userLabel}</span>
                </button>
                <div className="profile-dropdown">
                  <Link
                    to="/manage/Manageinvoice"
                    className="profile-dropdown-item"
                  >
                    <FaBox /> Đơn mua
                  </Link>
                  <Link
                    to="/user/UserProfile"
                    className="profile-dropdown-item"
                  >
                    <FaUser /> Trang cá nhân
                  </Link>
                  <button
                    type="button"
                    className="profile-dropdown-item logout"
                    onClick={onLogout}
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="link-muted">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary btn-header-sm">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="main-nav" aria-label="Danh mục chính">
        <div className="container nav-links">
          <span
            onClick={() => handleNavClick("all")}
            style={{ cursor: "pointer" }}
          >
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories &&
            dbCategories.map((cat) => (
              <span
                key={cat.id}
                onClick={() => handleNavClick(cat.id)}
                style={{ cursor: "pointer" }}
              >
                {cat.name}
              </span>
            ))}
          <span className="text-red">BST Thu Đông</span>
          <span className="text-red">Đồ hiệu sale</span>
          <span className="flash-sale">⚡ Flash Sale</span>
        </div>
      </nav>
    </>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="container lp-footer-grid">
        <div className="lp-footer-brand">
          <strong className="logo">SmartAI Fashion</strong>
          <p>Thời trang thông minh — thử đồ bằng AI, giao nhanh toàn quốc.</p>
        </div>
        <div>
          <h3 className="lp-footer-title">Hỗ trợ</h3>
          <ul className="lp-footer-links">
            <li>
              <Link to="/login">Tài khoản</Link>
            </li>
            <li>
              <Link to="#">Theo dõi đơn hàng</Link>
            </li>
            <li>
              <Link to="#">Đổi trả &amp; bảo hành</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="lp-footer-title">Công ty</h3>
          <ul className="lp-footer-links">
            <li>
              <Link to="#">Về chúng tôi</Link>
            </li>
            <li>
              <Link to="#">Tuyển dụng</Link>
            </li>
            <li>
              <Link to="#">Điều khoản</Link>
            </li>
          </ul>
        </div>
        <div className="lp-footer-social">
          <h3 className="lp-footer-title">Kết nối</h3>
          <div className="lp-social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
      <div className="lp-footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.
        </div>
      </div>
    </footer>
  );
}

export default function ProductDetail() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Biến thể (Variants)
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [dbCategories, setDbCategories] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);

  // Tải danh mục
  useEffect(() => {
    async function fetchCats() {
      try {
        // Bypass cache bằng cách không truyền limit mặc định hoặc truyền limit cao
        const res = await CategoryService.getAllCategories();
        // CategoryService.getAllCategories returns response.data already
        const categories = Array.isArray(res)
          ? res
          : Array.isArray(res.data)
            ? res.data
            : [];
        setDbCategories(categories);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    }
    fetchCats();
  }, []);

  // Tải chi tiết sản phẩm
  useEffect(() => {
    async function loadProductDetail() {
      if (!idParam) return;
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const res = await ProductDetailService.getProductById(idParam);
        const data = res.data;

        if (data) {
          setProduct(data);
          setSelectedImage(
            data.thumbnail || (data.images && data.images[0]) || "",
          );

          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            setSelectedSize(firstVariant.size);
            setSelectedColor(firstVariant.color || "");
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Lỗi tải sp:", err);
        setError("Không thể tải thông tin sản phẩm. Vિય lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
  }, [idParam]);

  // Tải thông tin cửa hàng
  useEffect(() => {
    async function loadShopInfo() {
      if (!idParam) return;
      try {
        const data = await CuahangService.getStoreByProduct(idParam);
        if (data) {
          setShopInfo(data);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin shop:", err);
      }
    }
    loadShopInfo();
  }, [idParam]);

  // --- LOGIC XỬ LÝ BIẾN THỂ ---
  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return (
      product.variants.find(
        (v) =>
          v.size === selectedSize &&
          (v.color === selectedColor || (!v.color && !selectedColor)),
      ) ||
      product.variants.find((v) => v.size === selectedSize) ||
      product.variants[0]
    );
  }, [product, selectedSize, selectedColor]);

  const uniqueSizes = useMemo(() => {
    if (!product || !product.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))];
  }, [product]);

  const colorsForSelectedSize = useMemo(() => {
    if (!product || !product.variants || !selectedSize) return [];
    const colors = product.variants
      .filter((v) => v.size === selectedSize && v.color)
      .map((v) => v.color);
    return [...new Set(colors)];
  }, [product, selectedSize]);

  const displayPrice = currentVariant
    ? currentVariant.price
    : product
      ? product.price
      : 0;
  const stockAvailable = currentVariant ? currentVariant.stock : 0;

  // Find category ID for linking
  const resolvedCategoryId = useMemo(() => {
    if (!product || !dbCategories.length) return null;
    return dbCategories.find(
      (c) =>
        c.name?.toLowerCase().trim() ===
        product.categoryName?.toLowerCase().trim(),
    )?.id;
  }, [product, dbCategories]);

  // --- LOGIC ẢNH ---
  const allImages = useMemo(() => {
    if (!product) return [];
    return [product.thumbnail, ...(product.images || [])].filter(Boolean);
  }, [product]);

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const handleAddToCart = async () => {
    if (!currentVariant) {
      toast.error("Vui lòng chọn đầy đủ kích thước và màu sắc.");
      return;
    }

    if (quantity > stockAvailable) {
      toast.error(
        `Xin lỗi, chúng tôi chỉ còn ${stockAvailable} sản phẩm trong kho.`,
      );
      return;
    }

    try {
      const res = await CartService.addToCart(
        currentVariant.variantId,
        quantity,
      );
      if (res.data || res.status === 200 || res.status === 201) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!", { duration: 1000 });
        // Cập nhật lại số lượng còn lại nếu cần (optional)
      }
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.";
      toast.error(errorMessage);
    }
  };

  const handleBuyNow = () => {
    if (!currentVariant) {
      toast.error("Vui lòng chọn đầy đủ kích thước và màu sắc.");
      return;
    }

    if (quantity > stockAvailable) {
      toast.error(
        `Xin lỗi, chúng tôi chỉ còn ${stockAvailable} sản phẩm trong kho.`,
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        type: "BUY_NOW",
        variantId: currentVariant.variantId,
        quantity,
      },
    });
  };

  const handleTryOnAI = () => {
    if (!product) return;

    const productId = product.id;
    const thumbnailUrl =
      product.thumbnail || (product.images && product.images[0]) || "";
    const productName = product.name || "Sản phẩm";
    const price = product.price || 0;

    const url = `/ai-virtual-tryon?productId=${productId}&thumbnail=${encodeURIComponent(thumbnailUrl)}&productName=${encodeURIComponent(productName)}&price=${price}`;
    navigate(url);
  };

  const handleChatNow = async () => {
    if (!userLabel) {
      toast.error("Vui lòng đăng nhập để chat với cửa hàng.");
      navigate("/login");
      return;
    }

    const shopId =
      shopInfo?.StoreId ||
      shopInfo?.storeId ||
      product?.StoreId ||
      product?.storeId;
    if (!shopId) {
      toast.error("Không tìm thấy thông tin cửa hàng.");
      return;
    }

    try {
      const res = await chatService.startChat(shopId);
      if (res && res.ConversationId) {
        navigate("/chat", { state: { conversationId: res.ConversationId } });
      } else {
        navigate("/chat");
      }
    } catch (err) {
      console.error("Lỗi bắt đầu chat:", err);
      navigate("/chat");
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="pd-error-container">
        <h2>404</h2>
        <p>Sản phẩm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="btn-primary">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="pd-page-wrapper">
      <PageHeader
        userLabel={userLabel}
        dbCategories={dbCategories}
        onLogout={handleLogout}
      />

      <main className="pd-main-content">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="pd-sep">/</span>
            {resolvedCategoryId ? (
              <Link to={`/category/${resolvedCategoryId}`}>
                {product.categoryName || "Sản phẩm"}
              </Link>
            ) : (
              <span>{product.categoryName || "Sản phẩm"}</span>
            )}
            <span className="pd-sep">/</span>
            <span className="pd-current">{product.name}</span>
          </nav>

          <div className="pd-product-grid">
            {/* Gallery */}
            <div className="pd-gallery-section">
              <div className="pd-main-image-wrap">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="pd-main-image"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      className="pd-nav-btn pd-nav-prev"
                      onClick={handlePrevImage}
                      aria-label="Ảnh trước"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="pd-nav-btn pd-nav-next"
                      onClick={handleNextImage}
                      aria-label="Ảnh tiếp"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}

                <button
                  className={`pd-wishlist-btn ${wishlisted ? "active" : ""}`}
                  onClick={() => setWishlisted(!wishlisted)}
                  aria-label="Thêm vào yêu thích"
                >
                  <FaHeart />
                </button>
              </div>
              {product.images && product.images.length > 0 && (
                <div className="pd-thumbnail-grid">
                  {[product.thumbnail, ...product.images]
                    .filter(Boolean)
                    .map((img, idx) => (
                      <div
                        key={idx}
                        className={`pd-thumb-item ${selectedImage === img ? "active" : ""}`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt={`Xem thêm ${idx}`} />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="pd-info-section">
              <div className="pd-badge-row">
                <span className="pd-badge pd-badge-dark">CỬA HÀNG</span>
                {resolvedCategoryId ? (
                  <Link
                    to={`/category/${resolvedCategoryId}`}
                    className="pd-category-link"
                  >
                    {product.categoryName}
                  </Link>
                ) : (
                  <span className="pd-category-link">
                    {product.categoryName}
                  </span>
                )}
              </div>

              <h1 className="pd-title">{product.name}</h1>

              <div
                className="pd-meta-row"
                style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}
              >
                Lượt bán:{" "}
                <strong style={{ color: "#1f2937", marginLeft: "4px" }}>
                  {product.sold || 0}
                </strong>
              </div>

              <div className="pd-price-card">
                <div className="pd-price-row">
                  <span className="pd-current-price">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(displayPrice)}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="pd-options-container">
                {/* Size */}
                <div className="pd-option-item">
                  <div className="pd-option-label-wrap">
                    <span className="pd-option-label">Kích thước</span>
                  </div>
                  <div className="pd-size-grid">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        className={`pd-size-chip ${selectedSize === size ? "active" : ""}`}
                        onClick={() => {
                          setSelectedSize(size);
                          // Chọn màu đầu tiên khả dụng của size này
                          const firstColor = product.variants.find(
                            (v) => v.size === size,
                          )?.color;
                          if (firstColor) setSelectedColor(firstColor);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                {colorsForSelectedSize.length > 0 && (
                  <div className="pd-option-item">
                    <span className="pd-option-label">Màu sắc</span>
                    <div className="pd-color-grid">
                      {colorsForSelectedSize.map((color) => (
                        <button
                          key={color}
                          className={`pd-color-chip ${selectedColor === color ? "active" : ""}`}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="pd-option-item">
                  <span className="pd-option-label">Số lượng</span>
                  <div className="pd-quantity-row">
                    <div className="pd-qty-selector">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min="1"
                        max={stockAvailable}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(
                            Math.min(Math.max(1, val), stockAvailable || 1),
                          );
                        }}
                      />
                      <button
                        onClick={() =>
                          setQuantity(Math.min(quantity + 1, stockAvailable))
                        }
                        disabled={quantity >= stockAvailable}
                      >
                        +
                      </button>
                    </div>
                    <span className="pd-stock-status">
                      {stockAvailable > 0 ? (
                        `Còn ${stockAvailable} sản phẩm`
                      ) : (
                        <span className="text-red">Hết hàng</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pd-action-btns">
                <button
                  className="pd-btn pd-btn-outline pd-btn-large"
                  onClick={handleAddToCart}
                  disabled={stockAvailable <= 0}
                >
                  <FaShoppingCart /> Thêm vào giỏ hàng
                </button>
                <button
                  className="pd-btn pd-btn-primary pd-btn-large"
                  onClick={handleBuyNow}
                  disabled={stockAvailable <= 0}
                >
                  Mua ngay
                </button>
              </div>

              <button className="pd-magic-fit-btn" onClick={handleTryOnAI}>
                <span className="sparkle-icon" style={{ fontSize: "20px" }}>
                  ✨
                </span>{" "}
                Thử đồ ngay với AI Magic Fit
              </button>

              {/* Features */}
              <div className="pd-features-list">
                <div className="pd-feature-item">
                  <FaShieldAlt className="icon-blue" />
                  <span>7 ngày trả hàng</span>
                </div>
                <div className="pd-feature-item">
                  <FaCheck className="icon-green" />
                  <span>100% Chính hãng</span>
                </div>
                <div className="pd-feature-item">
                  <FaTruck className="icon-blue" />
                  <span>Miễn phí vận chuyển</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Banner */}
          <section className="pd-store-section">
            <div className="pd-store-info">
              <div className="pd-store-avatar-wrap">
                <img
                  src={
                    shopInfo?.logoUrl ||
                    "https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg"
                  }
                  alt={shopInfo?.storeName || "Cửa hàng"}
                  className="pd-store-avatar"
                />
                <span className="pd-store-badge">YÊU THÍCH +</span>
              </div>
              <div className="pd-store-details">
                <h3 className="pd-store-name">
                  {shopInfo?.storeName || "SmartAI Fashion Flagship Store"}
                </h3>
                <div className="pd-store-stats">
                  <div className="pd-stat-item">
                    Phản hồi:{" "}
                    <span className="text-blue">99% (trong vài phút)</span>
                  </div>
                  <span className="pd-store-sep">|</span>
                  <div className="pd-stat-item">
                    Sản phẩm:{" "}
                    <span className="text-blue">
                      {shopInfo?.productCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pd-store-actions">
              <button
                className="pd-btn-store pd-btn-chat"
                onClick={handleChatNow}
              >
                Chat ngay
              </button>

              <button
                className="pd-btn-store pd-btn-view-store"
                onClick={() => navigate(`/shop-owner/store`)}
              >
                Xem cửa hàng
              </button>
            </div>
          </section>

          {/* Description */}
          <section className="pd-description-section">
            <h2
              className="pd-section-title"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <FaStar style={{ color: "#0ea5e9", fontSize: "20px" }} />
              Chi tiết sản phẩm
            </h2>
            <div
              className="pd-description-content"
              style={{
                background: "#f8fafc",
                padding: "32px",
                borderRadius: "20px",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)",
                border: "1px solid #e2e8f0",
                minHeight: "150px",
              }}
            >
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
