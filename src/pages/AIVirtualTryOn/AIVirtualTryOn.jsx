import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import {
  FaShoppingCart,
  FaSearch,
  FaUserCircle,
  FaBox,
  FaSignOutAlt,
  FaUser,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import { getCategories } from "../../services/LandingPageService";
import TryonService from "../../services/TryonService";
import UploadPanel from "../../components/ai-virtual-tryon/UploadPanel";
import ResultPreview from "../../components/ai-virtual-tryon/ResultPreview";
import ActionBar from "../../components/ai-virtual-tryon/ActionBar";
import "../LandingPage/LandingPage.css";
import "./AIVirtualTryOn.css";

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

const AIVirtualTryOn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [userLabel, setUserLabel] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserLabel(null);
        setUserAvatar(null);
      } else {
        try {
          const response = await api.get("/users/profile");
          const profile = response.data;
          setUserLabel(profile.fullName || profile.email || profile.username || getUserDisplayNameFromToken());
          setUserAvatar(profile.avatarUrl || null);
        } catch (err) {
          console.error("Lỗi tải profile:", err);
          setUserLabel(getUserDisplayNameFromToken());
        }
      }
    }
    loadUser();

    // Load categories
    async function loadCategories() {
      try {
        const res = await getCategories(100);
        const list = Array.isArray(res.data) ? res.data : [];
        setDbCategories(list);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    }

    // Lấy ProductId từ URL params
    const productId = searchParams.get("productId");
    const thumbnail = searchParams.get("thumbnail");
    const productName = searchParams.get("productName");
    const price = searchParams.get("price");

    console.log("📥 URL Parameters:", {
      productId,
      thumbnail,
      productName,
      price,
    });

    if (productId && thumbnail) {
      // Tự động set sản phẩm từ trang chủ
      setSelectedProduct({
        ProductId: parseInt(productId),
        ThumbnailUrl: thumbnail,
        ProductName: productName || `Sản phẩm #${productId}`,
        Price: price ? parseInt(price) : 0,
      });
      console.log("✅ Sản phẩm được set từ URL");
    }

    loadCategories();
  }, [searchParams]);

  const handleImageSelected = (imageData) => {
    setSelectedImage(imageData);
    setResultImage(null);
    setError(null);
  };

  const handleTryOn = async () => {
    if (!selectedImage || !selectedProduct) {
      setError("Vui lòng tải ảnh và chọn sản phẩm");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Lấy ProductId
      const productId = selectedProduct.ProductId || selectedProduct.id;

      // Lấy Thumbnail URL
      const thumbnailUrl =
        selectedProduct.ThumbnailUrl || selectedProduct.image;

      console.log("📤 Gửi try-on request:", {
        productId,
        thumbnailUrl,
        fileName: selectedImage.file.name,
      });

      const response = await TryonService.tryon(
        selectedImage.file,
        productId,
        thumbnailUrl,
        [],
      );

      if (response && response.imageUrl) {
        console.log("✅ Try-on thành công:", response.imageUrl);
        setResultImage(response.imageUrl);
      } else {
        setError("Không nhận được kết quả từ API");
      }
    } catch (err) {
      console.error("❌ Lỗi khi thử đồ:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi xử lý yêu cầu. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResultImage(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `ai-tryon-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await TryonService.getTryonHistory(1, 50);
      console.log("📋 History Response:", response);
      setHistory(response.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải lịch sử:", err);
      setHistoryError("Không thể tải lịch sử. Vui lòng thử lại.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShowHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  return (
    <>
      {/* HEADER */}
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

            <Link to="/chat" className="icon-link" aria-label="Tin nhắn">
              <FiMessageCircle />
            </Link>

            {userLabel ? (
              <div className="user-profile-wrapper">
                <button
                  type="button"
                  className="user-profile-btn"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      style={{ width: "24px", height: "24px", borderRadius: "50%", marginRight: "8px", objectFit: "cover" }}
                    />
                  ) : (
                    <FaUserCircle
                      style={{ fontSize: "20px", color: "var(--lp-accent)" }}
                    />
                  )}
                  <span className="user-profile">{userLabel}</span>
                </button>

                {isProfileOpen && (
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
                    {localStorage
                      .getItem("userRole")
                      ?.toLowerCase()
                      .includes("shop") && (
                        <Link
                          to="/shop-owner/store"
                          className="profile-dropdown-item"
                          style={{ color: "var(--lp-accent)" }}
                        >
                          <FaBox /> Kênh Shop{" "}
                          <span
                            style={{
                              fontSize: "10px",
                              marginLeft: "auto",
                              background: "var(--lp-accent)",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            PRO
                          </span>
                        </Link>
                      )}
                    <button
                      type="button"
                      className="profile-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Đăng xuất
                    </button>
                  </div>
                )}
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

      {/* NAVIGATION MENU */}
      <nav className="main-nav" aria-label="Danh mục chính">
        <div className="container nav-links">
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories.map((cat) => (
            <span
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              style={{ cursor: "pointer" }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="ai-tryon-page-container">
        <div className="ai-tryon-wrapper">
          <div className="ai-tryon-header">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div>
                <h1>🤖 Thử Đồ Bằng AI</h1>
                <p>
                  Tải ảnh của bạn lên và khám phá cách sản phẩm trông trên bạn
                </p>
              </div>
              <button
                onClick={handleShowHistory}
                type="button"
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(to right, #667eea, #764ba2)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                📋 {showHistory ? "Ẩn Lịch Sử" : "Xem Lịch Sử"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
              height: "100%",
            }}
          >
            {/* LEFT: Upload Panel */}
            <div className="ai-panel">
              <UploadPanel
                onImageSelected={handleImageSelected}
                selectedImage={selectedImage}
              />
            </div>

            {/* CENTER: Product Preview */}
            <div className="ai-panel">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: "0.75rem" }}>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: "0 0 0.25rem 0",
                      color: "#333",
                    }}
                  >
                    Sản Phẩm
                  </h2>
                  <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>
                    {selectedProduct ? "✓ Đã chọn" : "Chưa chọn"}
                  </p>
                </div>

                {selectedProduct ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "0.5rem",
                      border: "2px solid #0066cc",
                      padding: "0.75rem",
                      minHeight: "0",
                      position: "relative",
                    }}
                  >
                    {/* Selected Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        left: "0.75rem",
                        background:
                          "linear-gradient(to right, #0066cc, #0052a3)",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✓ ĐÃ CHỌN
                    </div>

                    <img
                      src={selectedProduct.ThumbnailUrl}
                      alt={selectedProduct.ProductName}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "65%",
                        objectFit: "contain",
                        borderRadius: "0.4rem",
                      }}
                    />
                    <div
                      style={{
                        marginTop: "0.75rem",
                        textAlign: "center",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#333",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedProduct.ProductName}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/products/${selectedProduct.ProductId}`)
                        }
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "0.4rem",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#0052a3";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#0066cc";
                        }}
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "0.5rem",
                      border: "2px dashed #ddd",
                      color: "#999",
                      textAlign: "center",
                      minHeight: "0",
                    }}
                  >
                    <div style={{ fontSize: "36px", marginBottom: "0.3rem" }}>
                      👗
                    </div>
                    <p
                      style={{ fontSize: "12px", fontWeight: "500", margin: 0 }}
                    >
                      Chưa chọn
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Result Preview */}
            <div className="ai-panel">
              <ResultPreview
                isLoading={isLoading}
                resultImage={resultImage}
                onDownload={handleDownload}
                onTryAgain={handleReset}
              />
            </div>
          </div>

          {error && (
            <div
              className="ai-error-banner"
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#fee",
                color: "#c33",
                borderRadius: "0.5rem",
                border: "1px solid #fcc",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          <div className="ai-action-section">
            <ActionBar
              selectedImage={selectedImage}
              selectedProduct={selectedProduct}
              isLoading={isLoading}
              onTryOn={handleTryOn}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>

      {/* HISTORY MODAL OVERLAY */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "3rem",
              position: "relative",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowHistory(false)}
              type="button"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#333")}
              onMouseLeave={(e) => (e.target.style.color = "#666")}
            >
              ✕
            </button>

            {/* Modal Title */}
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "0 0 2rem 0",
                color: "#333",
              }}
            >
              📋 Lịch Sử Thử Đồ AI
            </h2>

            {/* Loading State */}
            {historyLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "#666",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f0f0f0",
                    borderTop: "4px solid #667eea",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "1rem",
                  }}
                />
                <p style={{ fontSize: "14px", margin: 0 }}>
                  ⏳ Đang tải lịch sử...
                </p>
              </div>
            ) : historyError ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  color: "#c33",
                }}
              >
                <p style={{ fontSize: "16px", margin: 0 }}>⚠️ {historyError}</p>
              </div>
            ) : history.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "#999",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "1rem" }}>👗</div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  Chưa có lịch sử thử đồ
                </p>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  Hãy thử đồ để xem lịch sử ở đây!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "2rem",
                }}
              >
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      border: "1px solid #e0e0e0",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Image Container */}
                    <div
                      style={{
                        width: "100%",
                        height: "250px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={item.TryImageUrl}
                        alt={item.Products?.ProductName || "Try-on result"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: "1.25rem" }}>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#999",
                          margin: "0 0 0.75rem 0",
                        }}
                      >
                        {item.CreatedAt
                          ? new Date(item.CreatedAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                          : "N/A"}
                      </p>
                      {item.Products && (
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#333",
                            margin: "0.75rem 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.Products.ProductName}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = item.TryImageUrl;
                          link.download = `tryon-${item.TryId || Date.now()}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        type="button"
                        style={{
                          width: "100%",
                          padding: "0.8rem",
                          marginTop: "1rem",
                          backgroundColor: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "0.4rem",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#0052a3";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#0066cc";
                        }}
                      >
                        📥 Tải
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* FOOTER */}
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
                <a href="#main-content">Theo dõi đơn hàng</a>
              </li>
              <li>
                <a href="#main-content">Đổi trả &amp; bảo hành</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="lp-footer-title">Công ty</h3>
            <ul className="lp-footer-links">
              <li>
                <a href="#main-content">Về chúng tôi</a>
              </li>
              <li>
                <a href="#main-content">Tuyển dụng</a>
              </li>
              <li>
                <a href="#main-content">Điều khoản</a>
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
                title="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                title="YouTube"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <p>&copy; 2024 SmartAI Fashion. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default AIVirtualTryOn;
