import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaBars,
  FaListUl,
  FaUserCircle,
  FaBox,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import { ShopProductService } from "../../services/ShopProductService";
import * as LandingPageService from "../../services/LandingPageService";
import "./CategoryProducts.css";

// Reuse common logic
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

function PageHeader({ userLabel, userAvatar, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const handleNavClick = (catId) => {
    navigate(`/category/${catId}`);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSelectSuggestion = (keyword) => {
    setSearchTerm(keyword);
    setShowSuggestions(false);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  // Xử lý gợi ý từ khóa (Debounce 300ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const suggestionData = await ShopProductService.getSuggestions(searchTerm);
          setSuggestions(suggestionData);
          setShowSuggestions(true);
        } catch (err) {
          console.error("Lỗi lấy gợi ý:", err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <div className="search-wrap" ref={searchRef}>
            <span className="visually-hidden">Tìm kiếm sản phẩm</span>
            <FaSearch className="search-icon" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="search-bar"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleSearch}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <FaSearch className="suggestion-icon" />
                    <span className="suggestion-keyword">{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="user-actions">
            <Link to="/cart" className="icon-link" aria-label="Giỏ hàng">
              <FaShoppingCart />
            </Link>
            <Link to="/chat" className="icon-link" aria-label="Tin nhắn">
              <FiMessageCircle />
            </Link>
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
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
          {dbCategories.map((cat) => (
            <span
              key={cat.id}
              onClick={() => handleNavClick(cat.id)}
              style={{ cursor: "pointer" }}
            >
              {cat.name}
            </span>
          ))}
          <Link
            to={localStorage.getItem("userRole")?.toLowerCase().includes("shop") ? "/shop-owner/store" : "/register-shop"}
            style={{
              marginLeft: "auto",
              color: "#fff",
              backgroundColor: "var(--lp-accent, #2563eb)",
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
              fontSize: "13px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Trở thành Người bán hàng
          </Link>
        </div>
      </nav>
    </>
  );
}



export default function CategoryProducts() {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [userLabel, setUserLabel] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

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
  }, []);

  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categoryName, setCategoryName] = useState("Danh mục");

  // --- Logic Xây dựng Cây danh mục ---
  const categoryTree = useMemo(() => {
    if (!dbCategories.length) return [];

    const map = {};
    const roots = [];

    dbCategories.forEach((cat) => {
      map[cat.id] = { ...cat, children: [] };
    });

    dbCategories.forEach((cat) => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    return roots;
  }, [dbCategories]);

  useEffect(() => {
    async function loadInitial() {
      try {
        const catRes = await LandingPageService.getCategories(100);
        const categories = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []);
        setDbCategories(categories);

        if (categoryId === "all") {
          setCategoryName("Tất cả sản phẩm");
        } else {
          const currentCat = categories.find(
            (c) => String(c.id) === String(categoryId),
          );
          if (currentCat) setCategoryName(currentCat.name);
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    }
    loadInitial();
  }, [categoryId]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, true);
  }, [categoryId]);

  async function fetchProducts(pageNum, isReset = false) {
    setLoading(true);
    try {
      let res;
      let currentLimit = 12;
      if (categoryId === "all") {
        currentLimit = pageNum * 12;
        res = await LandingPageService.getNewProducts(currentLimit);
      } else {
        res = await LandingPageService.getProductsByCategory(
          categoryId,
          pageNum,
          8,
        );
      }

      const rawData = Array.isArray(res.data)
        ? res.data
        : res.data?.products || res.data?.data || [];
      const newItems = rawData.map((p) => ({
        id: p.id ?? p.ProductId,
        name: p.name ?? p.ProductName,
        price: p.price ?? p.Price ?? 0,
        image:
          p.thumbnail ??
          p.ThumbnailUrl ??
          p.image ??
          "https://via.placeholder.com/300x400?text=No+Image",
      }));

      if (isReset || categoryId === "all") {
        setProducts(newItems);
      } else {
        setProducts((prev) => [...prev, ...newItems]);
      }

      if (categoryId === "all") {
        setHasMore(rawData.length >= currentLimit);
      } else {
        setHasMore(rawData.length >= 8);
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm theo danh mục:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";

  };

  return (
    <div className="category-page">
      <PageHeader
        userLabel={userLabel}
        userAvatar={userAvatar}
        dbCategories={dbCategories}
        onLogout={handleLogout}
      />

      <main className="cp-layout">
        {/* Sidebar Bên trái */}
        <aside className="cp-sidebar">
          <h2 className="sidebar-title">
            <FaListUl /> Danh mục
          </h2>
          <ul className="category-tree">
            <li className="tree-item">
              <Link
                to="/category/all"
                className={`tree-link ${categoryId === "all" ? "active" : ""}`}
              >
                Tất cả sản phẩm
              </Link>
            </li>
            {categoryTree.map((parent) => (
              <li key={parent.id} className="tree-item">
                <Link
                  to={`/category/${parent.id}`}
                  className={`tree-link ${String(categoryId) === String(parent.id) ? "active" : ""}`}
                >
                  {parent.name}
                  {parent.children.length > 0 && (
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>
                      ({parent.children.length})
                    </span>
                  )}
                </Link>
                {parent.children.length > 0 && (
                  <ul className="subcategory-list">
                    {parent.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to={`/category/${child.id}`}
                          className={`sub-tree-link ${String(categoryId) === String(child.id) ? "active" : ""}`}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Content Bên phải */}
        <div className="cp-main">
          <header className="cp-header">
            <nav className="cp-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <span style={{ color: "#1e293b", fontWeight: 600 }}>
                {categoryName}
              </span>
            </nav>
            <h1 className="cp-title">{categoryName}</h1>
          </header>

          {products.length === 0 && !loading ? (
            <div className="cp-empty">
              <p>Hiện chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="cp-product-grid">
              {products.map((product) => (
                <article key={product.id} className="cp-product-card">
                  <Link
                    to={`/products/${product.id}`}
                    className="cp-image-wrap"
                  >
                    <img
                      src={
                        product.thumbnail ||
                        product.image ||
                        "https://via.placeholder.com/300x400?text=Sản+phẩm"
                      }
                      alt={product.name}
                    />
                  </Link>
                  <div className="cp-card-content">
                    <h3 className="cp-product-name">{product.name}</h3>
                    <p className="cp-product-price">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </p>
                    <div className="cp-card-footer">
                      <Link
                        to={`/products/${product.id}`}
                        className="cp-btn-detail"
                      >
                        Chi tiết
                      </Link>
                      <button className="cp-btn-buy" aria-label="Mua nhanh">
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {loading && (
            <div className="cp-loading">
              <div className="cp-spinner"></div>
              <p>Đang tìm kiếm sản phẩm cho bạn...</p>
            </div>
          )}

          {hasMore && !loading && (
            <div className="cp-pagination">
              <button className="cp-btn-loadmore" onClick={handleLoadMore}>
                Tải thêm sản phẩm
              </button>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}
