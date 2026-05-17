import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
    FaBox,
    FaFacebookF,
    FaInstagram,
    FaSearch,
    FaShoppingCart,
    FaSignOutAlt,
    FaUser,
    FaUserCircle,
    FaYoutube,
    FaBell,
    FaTrash,
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { useNotification } from '../../hooks/useNotification';
import { CompareService } from "../../services/CompareService";
import { CategoryService } from "../../services/CategoryService";
import "../LandingPage/LandingPage.css";
import "./Compare.css";

const MAX_COMPARE_ITEMS = 3;
const RECENT_COMPARE_KEY = "compare_recent_products";
const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

function normalizeText(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

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

function getSpecList(product) {
    if (!product) return [];
    const description = (product.description || "").trim();
    return [
        `Danh mục: ${product.categoryName || "Đang cập nhật"}`,
        `Giá bán: ${VND.format(product.price || 0)}`,
        `Đã bán: ${product.sold || 0} sản phẩm`,
        `Kích thước: ${product.sizes?.length ? product.sizes.join(", ") : "-"}`,
        `Màu sắc: ${product.colors?.length ? product.colors.join(", ") : "-"}`,
        `Tồn kho: ${product.totalStock || 0}`,
        `Mô tả: ${description ? `${description.slice(0, 100)}${description.length > 100 ? "..." : ""}` : "Chưa có mô tả"}`,
    ];
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
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
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

function PageHeader({ userLabel, dbCategories, onLogout }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const notifPanelRef = useRef(null);
    const {
      unreadCount,
      notifications,
      loading: notifLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      loadMore,
      nextCursor,
    } = useNotification();

    const handleNotificationClick = async (n) => {
      if (!n.IsRead) {
        await markAsRead(n.NotificationId);
      }
      setShowNotifPanel(false);
      const textToSearch = `${n.Title || ''} ${n.Content || ''}`;
      const orderMatch = textToSearch.match(/#(\d+)/) || textToSearch.match(/ORD-(\d+)/i);
      if (orderMatch && orderMatch[1]) {
        navigate(`/manage/invoice-detail/${orderMatch[1]}`);
      } else {
        navigate('/manage/Manageinvoice');
      }
    };

    // Đóng notification panel khi click ra ngoài
    useEffect(() => {
      const handleClickOutsideNotif = (e) => {
        if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
          setShowNotifPanel(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutsideNotif);
      return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            try {
                const data = await CompareService.getSuggestions(searchTerm);

                setSuggestions(data);
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setShowSuggestions(false);
                                    navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
                                }
                            }}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions-dropdown">
                                {suggestions.map((item, index) => (
                                    <button
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => navigate(`/search?keyword=${encodeURIComponent(item)}`)}
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
                        {userLabel && (
                          <div className="notif-bell-wrapper" ref={notifPanelRef}>
                            <button
                              className="icon-link"
                              aria-label="Thông báo"
                              onClick={() => {
                                setShowNotifPanel((prev) => {
                                  if (!prev) fetchNotifications();
                                  return !prev;
                                });
                              }}
                              type="button"
                              style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <FaBell />
                              {unreadCount > 0 && (
                                <span className="cart-quantity-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                              )}
                            </button>
                            {showNotifPanel && (
                              <div className="notif-dropdown-panel">
                                <div className="notif-panel-header">
                                  <h4>Thông báo</h4>
                                  {unreadCount > 0 && (
                                    <button type="button" className="notif-mark-all" onClick={markAllAsRead}>Đánh dấu tất cả đã đọc</button>
                                  )}
                                </div>
                                <div className="notif-panel-list">
                                  {notifications.length === 0 && !notifLoading && (
                                    <div className="notif-empty">Chưa có thông báo nào</div>
                                  )}
                                  {notifications.map((n) => (
                                    <div
                                      key={n.NotificationId}
                                      className={`notif-item ${!n.IsRead ? 'notif-unread' : ''}`}
                                      onClick={() => handleNotificationClick(n)}
                                    >
                                      <div className="notif-item-content">
                                        <div className="notif-item-title">{n.Title}</div>
                                        <div className="notif-item-body">{n.Content}</div>
                                        <div className="notif-item-time">
                                          {n.CreatedAt ? new Date(typeof n.CreatedAt === 'string' ? n.CreatedAt.replace('Z', '') : n.CreatedAt).toLocaleString('vi-VN') : ''}
                                          {!n.IsRead && (
                                            <button
                                              type="button"
                                              className="notif-item-read-btn"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(n.NotificationId);
                                              }}
                                            >
                                              Đánh dấu đã đọc
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="notif-item-delete"
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.NotificationId); }}
                                        title="Xóa"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  ))}
                                  {notifLoading && <div className="notif-loading">Đang tải...</div>}
                                  {nextCursor && !notifLoading && (
                                    <button type="button" className="notif-load-more" onClick={loadMore}>Xem thêm</button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {userLabel ? (
                            <div className="user-profile-wrapper">
                                <button type="button" className="user-profile-btn">
                                    <FaUserCircle style={{ fontSize: "20px", color: "var(--lp-accent)" }} />
                                    <span className="user-profile">{userLabel}</span>
                                </button>
                                <div className="profile-dropdown">
                                    <Link to="/manage/Manageinvoice" className="profile-dropdown-item">
                                        <FaBox /> Đơn mua
                                    </Link>
                                    <Link to="/user/UserProfile" className="profile-dropdown-item">
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
                                    <button type="button" className="profile-dropdown-item logout" onClick={onLogout}>
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
                    <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                        TẤT CẢ DANH MỤC
                    </span>
                    {dbCategories.map((cat) => (
                        <span key={cat.id} onClick={() => navigate(`/category/${cat.id}`)} style={{ cursor: "pointer" }}>
                            {cat.name}
                        </span>
                    ))}
                
          <Link
            to={
              localStorage.getItem('userRole')?.toLowerCase().includes('shop')
                ? '/shop-owner/store'
                : '/register-shop'
            }
            style={{
              marginLeft: 'auto',
              color: '#fff',
              backgroundColor: 'var(--lp-accent, #2563eb)',
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
              fontSize: '13px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
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

export default function Compare() {
    const navigate = useNavigate();
    const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);
    const [searchParams, setSearchParams] = useSearchParams();
    const [dbCategories, setDbCategories] = useState([]);
    const [loadingInit, setLoadingInit] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [error, setError] = useState("");
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerKeyword, setPickerKeyword] = useState("");
    const [pickerResults, setPickerResults] = useState([]);
    const [pickerLoading, setPickerLoading] = useState(false);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);

    const selectedIds = useMemo(
        () => new Set(selectedProducts.map((item) => String(item.id))),
        [selectedProducts],
    );

    useEffect(() => {
        async function fetchCats() {
            try {
                const res = await CategoryService.getAllCategories();
                const categories = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
                setDbCategories(categories);
            } catch {
                setDbCategories([]);
            }
        }
        fetchCats();
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(RECENT_COMPARE_KEY);
            const data = raw ? JSON.parse(raw) : [];
            setRecentProducts(Array.isArray(data) ? data : []);
        } catch {
            setRecentProducts([]);
        }
    }, []);

    useEffect(() => {
        const idQuery = searchParams.get("ids");
        if (!idQuery) {
            setLoadingInit(false);
            return;
        }

        const ids = idQuery.split(",").map((item) => item.trim()).filter(Boolean).slice(0, MAX_COMPARE_ITEMS);
        if (!ids.length) {
            setLoadingInit(false);
            return;
        }

        let active = true;
        const loadByIds = async () => {
            try {
                setLoadingInit(true);
                const data = await Promise.all(
                    ids.map(async (id) => {
                        try {
                            return await CompareService.getProductById(id);
                        } catch {
                            return null;
                        }
                    }),
                );
                if (!active) return;
                const validProducts = data.filter(Boolean);
                setSelectedProducts(validProducts);
                if (validProducts.length) {
                    saveRecentProducts(validProducts);
                }
            } finally {
                if (active) setLoadingInit(false);
            }
        };

        loadByIds();
        return () => {
            active = false;
        };
    }, [searchParams]);


    useEffect(() => {
        if (!isPickerOpen) return;
        const loadSuggestedProducts = async () => {
            try {
                const normalized = await CompareService.getBestSellerProducts(8);
                setSuggestedProducts(normalized);
            } catch {
                setSuggestedProducts([]);
            }
        };

        loadSuggestedProducts();
    }, [isPickerOpen]);

    useEffect(() => {
        if (!isPickerOpen) return;
        if (!pickerKeyword.trim()) {
            setPickerResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setPickerLoading(true);
                const data = await CompareService.searchProducts(pickerKeyword.trim());
                const apiResults = data.filter((item) => !selectedIds.has(String(item.id)));
                if (apiResults.length > 0) {
                    setPickerResults(apiResults);
                } else {
                    setPickerResults(filterByKeywordFromLocalPool(pickerKeyword));
                }
            } catch {
                setPickerResults(filterByKeywordFromLocalPool(pickerKeyword));
            } finally {
                setPickerLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [isPickerOpen, pickerKeyword, selectedIds]);

    const filterByKeywordFromLocalPool = (searchValue) => {
        const normKeyword = normalizeText(searchValue);
        if (!normKeyword) return [];

        const merged = [...recentProducts, ...suggestedProducts];
        const map = new Map();
        merged.forEach((item) => {
            if (!item?.id || selectedIds.has(String(item.id))) return;
            const haystack = `${item.name} ${item.categoryName}`;
            if (normalizeText(haystack).includes(normKeyword)) {
                map.set(String(item.id), item);
            }
        });

        return Array.from(map.values()).slice(0, 10);
    };

    const updateQueryWithIds = (products) => {
        const ids = products.map((item) => item.id).filter(Boolean);
        const next = new URLSearchParams(searchParams);
        if (ids.length) next.set("ids", ids.join(","));
        else next.delete("ids");
        setSearchParams(next);
    };

    const saveRecentProducts = (products) => {
        if (!products.length) return;
        const merged = [...products, ...recentProducts];
        const map = new Map();
        merged.forEach((item) => {
            if (!item?.id) return;
            map.set(String(item.id), item);
        });
        const compact = Array.from(map.values()).slice(0, 10);
        setRecentProducts(compact);
        localStorage.setItem(RECENT_COMPARE_KEY, JSON.stringify(compact));
    };

    const handleAddProduct = (product) => {
        if (!product || selectedIds.has(String(product.id))) return;
        if (selectedProducts.length >= MAX_COMPARE_ITEMS) {
            setError("Chỉ được so sánh tối đa 3 sản phẩm.");
            return;
        }

        const next = [...selectedProducts, product];
        setSelectedProducts(next);
        setError("");
        updateQueryWithIds(next);
        saveRecentProducts([product]);
        if (isPickerOpen) {
            setIsPickerOpen(false);
            setPickerKeyword("");
            setPickerResults([]);
        }
    };

    const handleRemoveProduct = (id) => {
        const next = selectedProducts.filter((item) => String(item.id) !== String(id));
        setSelectedProducts(next);
        setError("");
        updateQueryWithIds(next);
    };

    const handleClearAll = () => {
        setSelectedProducts([]);
        setError("");
        updateQueryWithIds([]);
    };

    const displayModalProducts = useMemo(() => {
        if (pickerKeyword.trim()) return pickerResults;
        const merged = [...recentProducts, ...suggestedProducts];
        const map = new Map();
        merged.forEach((item) => {
            if (!item?.id) return;
            if (selectedIds.has(String(item.id))) return;
            if (!map.has(String(item.id))) map.set(String(item.id), item);
        });
        return Array.from(map.values()).slice(0, 10);
    }, [pickerKeyword, pickerResults, recentProducts, suggestedProducts, selectedIds]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
    };

    return (
        <div className="compare-page-wrapper">
            <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />

            <main className="compare-page">
                <div className="compare-container">
                    <div className="compare-head">
                        <div>
                            <h1>So sánh sản phẩm</h1>
                        </div>
                        <div className="compare-actions">
                            <button type="button" className="cmp-btn cmp-btn-light" onClick={() => navigate("/")}>
                                Về trang chủ
                            </button>
                            <button type="button" className="cmp-btn cmp-btn-danger" onClick={handleClearAll}>
                                Xóa tất cả
                            </button>
                        </div>
                    </div>

                    {error && <p className="compare-error">{error}</p>}

                    {loadingInit ? (
                        <div className="compare-state">Đang tải sản phẩm so sánh...</div>
                    ) : (
                        <>
                            <section className="compare-grid">
                                {selectedProducts.map((item) => (
                                    <article key={item.id} className="compare-column-card">
                                        <button type="button" className="compare-remove-btn" onClick={() => handleRemoveProduct(item.id)}>
                                            x
                                        </button>
                                        <img src={item.thumbnail} alt={item.name} className="compare-product-image" />
                                        <h3>{item.name}</h3>
                                        <p className="compare-price">{VND.format(item.price)}</p>
                                        <Link to={`/products/${item.id}`} className="compare-link">
                                            Xem chi tiết
                                        </Link>
                                    </article>
                                ))}

                                {Array.from({ length: Math.max(0, MAX_COMPARE_ITEMS - selectedProducts.length) }).map((_, index) => (
                                    <button
                                        key={`add-slot-${index}`}
                                        type="button"
                                        className="compare-add-slot"
                                        onClick={() => setIsPickerOpen(true)}
                                    >
                                        <span className="plus">+</span>
                                        <span>Thêm sản phẩm</span>
                                    </button>
                                ))}
                            </section>

                            {selectedProducts.length === 0 ? (
                                <div className="compare-state">
                                    Chưa có sản phẩm nào. Hãy tìm sản phẩm ở ô trên để bắt đầu so sánh.
                                </div>
                            ) : (
                                <section className="compare-specs-grid">
                                    {selectedProducts.map((item) => (
                                        <article key={`spec-${item.id}`} className="compare-specs-column">
                                            <div className="compare-specs-list">
                                                {getSpecList(item).map((spec, idx) => (
                                                    <p key={`${item.id}-spec-${idx}`}>{spec}</p>
                                                ))}
                                            </div>
                                        </article>
                                    ))}
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>

            {isPickerOpen && (
                <div className="compare-modal-overlay" onClick={() => setIsPickerOpen(false)}>
                    <div className="compare-modal" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="compare-modal-close" onClick={() => setIsPickerOpen(false)}>
                            Đóng
                        </button>
                        <h3>Hoặc nhập tên để tìm</h3>
                        <div className="compare-modal-search">
                            <FaSearch />
                            <input
                                autoFocus
                                type="search"
                                value={pickerKeyword}
                                onChange={(event) => setPickerKeyword(event.target.value)}
                                placeholder="Nhập tên sản phẩm để tìm"
                            />
                        </div>

                        <p className="compare-modal-subtitle">
                            {pickerKeyword.trim() ? "Kết quả tìm kiếm" : "Sản phẩm phổ biến"}
                        </p>

                        {pickerLoading ? (
                            <div className="compare-modal-empty">Đang tải sản phẩm...</div>
                        ) : displayModalProducts.length === 0 ? (
                            <div className="compare-modal-empty">Chưa có sản phẩm phù hợp để đề xuất.</div>
                        ) : (
                            <div className="compare-modal-grid">
                                {displayModalProducts.map((item) => (
                                    <article key={`modal-${item.id}`} className="compare-modal-item">
                                        <img src={item.thumbnail} alt={item.name} />
                                        <h4>{item.name}</h4>
                                        <p>{VND.format(item.price)}</p>
                                        <button type="button" onClick={() => handleAddProduct(item)}>
                                            Thêm so sánh
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
