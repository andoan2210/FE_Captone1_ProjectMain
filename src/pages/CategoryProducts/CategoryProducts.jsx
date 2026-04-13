import React, { useState, useEffect, useMemo } from "react";
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

function PageHeader({ userLabel, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const handleNavClick = (catId) => {
    navigate(`/category/${catId}`);
  };

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <label className="search-wrap">
            <FaSearch className="search-icon" />
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="search-bar"
            />
          </label>
          <div className="user-actions">
            <Link to="/cart" className="icon-link">
              <FaShoppingCart />
            </Link>
            <Link to="/chat" className="icon-link">
              <FiMessageCircle />
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

      <nav className="main-nav">
        <div className="container nav-links">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            TRANG CHỦ
          </Link>
          {dbCategories &&
            dbCategories.slice(0, 8).map((cat) => (
              <span
                key={cat.id}
                onClick={() => handleNavClick(cat.id)}
                style={{ cursor: "pointer" }}
              >
                {cat.name}
              </span>
            ))}
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
  );
}

export default function CategoryProducts() {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

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
        const categories = catRes.data || [];
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

      const rawData = res.data || [];
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

      <Footer />
    </div>
  );
}
