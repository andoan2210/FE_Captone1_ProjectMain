import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaSearch, FaFilter, FaSortAmountDown, FaShoppingCart, FaChevronLeft, FaChevronRight, FaStar, FaUserCircle, FaBox, FaUser, FaSignOutAlt, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import { ShopProductService } from "../../services/ShopProductService";
import * as LandingPageService from "../../services/LandingPageService";
import "../LandingPage/LandingPage.css";
import "./SearchPage.css";

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

function PageHeader({ userLabel, userAvatar, dbCategories, onLogout }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const searchRef = useRef(null);

    // Hàm tải số lượng giỏ hàng
    const loadCartCount = async () => {
        try {
            const res = await CartService.getCart();
            const data = res.data;
            let count = 0;
            if (Array.isArray(data)) {
                count = data.length;
            } else if (data && typeof data === "object") {
                const items = data.cartItems || data.items || data.cart?.cartItems || (data.shops ? data.shops.flatMap(s => s.items || []) : []);
                count = Array.isArray(items) ? items.length : 0;
            }
            setCartCount(count);
        } catch (err) {
            const localCart = JSON.parse(localStorage.getItem("local_cart") || "[]");
            setCartCount(Array.isArray(localCart) ? localCart.length : 0);
        }
    };

    useEffect(() => {
        loadCartCount();
        window.addEventListener('cart-updated', loadCartCount);
        window.addEventListener('storage', loadCartCount);
        return () => {
            window.removeEventListener('cart-updated', loadCartCount);
            window.removeEventListener('storage', loadCartCount);
        };
    }, []);

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
                    const data = await ShopProductService.getSuggestions(searchTerm);
                    setSuggestions(data);
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            onKeyDown={handleSearch}
                            autoComplete="off"
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
                            {cartCount > 0 && <span className="cart-quantity-badge">{cartCount}</span>}
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
                                        <FaUserCircle style={{ fontSize: "20px", color: "var(--lp-accent)" }} />
                                    )}
                                    <span className="user-profile">{userLabel}</span>
                                </button>
                                <div className="profile-dropdown">
                                    <Link to="/manage/Manageinvoice" className="profile-dropdown-item"><FaBox /> Đơn mua</Link>
                                    <Link to="/user/UserProfile" className="profile-dropdown-item"><FaUser /> Trang cá nhân</Link>
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
                                    <button type="button" className="profile-dropdown-item logout" onClick={onLogout}><FaSignOutAlt /> Đăng xuất</button>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login" className="link-muted">Đăng nhập</Link>
                                <Link to="/register" className="btn-primary btn-header-sm">Đăng ký</Link>
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
                    {dbCategories && dbCategories.map((cat) => (
                        <span key={cat.id} onClick={() => navigate(`/category/${cat.id}`)} style={{ cursor: "pointer" }}>
                            {cat.name}
                        </span>
                    ))}
                    <Link
                        to={
                            localStorage.getItem("userRole")?.toLowerCase().includes("shop")
                                ? "/shop-owner/store"
                                : "/register-shop"
                        }
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

export default function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const initialKeyword = queryParams.get("keyword") || "";
    const initialCategoryId = queryParams.get("categoryId") || "";
    const initialSortBy = queryParams.get("sortBy") || "relevance";

    const [results, setResults] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [dbCategories, setDbCategories] = useState([]);
    const [userLabel, setUserLabel] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null);

    // Filter states
    const [minPrice, setMinPrice] = useState(queryParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(queryParams.get("maxPrice") || "");
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [page, setPage] = useState(parseInt(queryParams.get("page") || "1"));

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await api.get("/users/profile");
                const profile = res.data;
                setUserLabel(profile.fullName || profile.email || profile.username || getUserDisplayNameFromToken());
                setUserAvatar(profile.avatarUrl || null);
            } catch (err) {
                console.error("Lỗi tải profile:", err);
                setUserLabel(getUserDisplayNameFromToken());
            }
        }

        loadUser();

        async function loadData() {
            try {
                const res = await LandingPageService.getCategories(100);
                setDbCategories(res.data || []);
            } catch (err) {
                console.error("Error loading categories:", err);
            }
        }
        loadData();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const currentParams = new URLSearchParams(location.search);
            const searchParams = {
                keyword: currentParams.get("keyword") || "",
                categoryId: currentParams.get("categoryId") || undefined,
                minPrice: currentParams.get("minPrice") || undefined,
                maxPrice: currentParams.get("maxPrice") || undefined,
                sortBy: currentParams.get("sortBy") || sortBy,
                page: currentParams.get("page") || page,
                limit: 20
            };
            const response = await ShopProductService.searchProducts(searchParams);
            setResults(response.data || []);
            setPagination(response.pagination || {});
        } catch (err) {
            console.error("Error fetching search results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
        // Sync state with URL manually if needed (e.g. on back/forward)
        const params = new URLSearchParams(location.search);
        setPage(parseInt(params.get("page") || "1"));
        setSortBy(params.get("sortBy") || "relevance");
        setSelectedCategoryId(params.get("categoryId") || "");
        setMinPrice(params.get("minPrice") || "");
        setMaxPrice(params.get("maxPrice") || "");
    }, [location.search]);

    // Remove the older redundant useEffect if it existed or modify it

    const handleApplyFilters = () => {
        const newParams = new URLSearchParams(location.search);
        if (minPrice) newParams.set("minPrice", minPrice);
        else newParams.delete("minPrice");

        if (maxPrice) newParams.set("maxPrice", maxPrice);
        else newParams.delete("maxPrice");

        if (selectedCategoryId) newParams.set("categoryId", selectedCategoryId);
        else newParams.delete("categoryId");

        newParams.set("page", "1");
        navigate(`/search?${newParams.toString()}`);
    };

    const handleCategoryChange = (catId) => {
        setSelectedCategoryId(catId);
        const newParams = new URLSearchParams(location.search);
        if (catId) newParams.set("categoryId", catId);
        else newParams.delete("categoryId");

        newParams.set("page", "1");
        navigate(`/search?${newParams.toString()}`);
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        const newParams = new URLSearchParams(location.search);
        newParams.set("sortBy", newSort);
        newParams.set("page", "1");
        navigate(`/search?${newParams.toString()}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
    };

    const handleApplyPrice = (min, max) => {
        const newParams = new URLSearchParams(location.search);
        if (min) newParams.set("minPrice", min); else newParams.delete("minPrice");
        if (max) newParams.set("maxPrice", max); else newParams.delete("maxPrice");
        newParams.set("page", "1");
        navigate(`/search?${newParams.toString()}`);
    };

    const handleClearAll = () => {
        setMinPrice("");
        setMaxPrice("");
        setSelectedCategoryId("");
        navigate(`/search?keyword=${encodeURIComponent(initialKeyword)}`);
    };

    const activeFilters = useMemo(() => {
        const filters = [];
        if (selectedCategoryId) {
            const cat = dbCategories.find(c => String(c.id) === String(selectedCategoryId));
            if (cat) filters.push({ type: 'category', label: `Danh mục: ${cat.name}`, value: cat.id });
        }
        if (minPrice) filters.push({ type: 'minPrice', label: `Giá từ: ${Number(minPrice).toLocaleString()}đ`, value: 'min' });
        if (maxPrice) filters.push({ type: 'maxPrice', label: `Giá đến: ${Number(maxPrice).toLocaleString()}đ`, value: 'max' });
        return filters;
    }, [selectedCategoryId, minPrice, maxPrice, dbCategories]);

    const removeFilter = (filter) => {
        if (filter.type === 'category') handleCategoryChange("");
        if (filter.type === 'minPrice') { setMinPrice(""); handleApplyPrice("", maxPrice); }
        if (filter.type === 'maxPrice') { setMaxPrice(""); handleApplyPrice(minPrice, ""); }
    };

    return (
        <div className="search-page-container">
            <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />

            <main className="container search-main">
                <aside className="search-sidebar">
                    <section className="filter-section">
                        <h3 className="filter-title"><FaFilter /> BỘ LỌC TÌM KIẾM</h3>

                        <div className="filter-group">
                            <h4>Theo Danh Mục</h4>
                            <div className="filter-list">
                                <label className="filter-item">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={!selectedCategoryId}
                                        onChange={() => handleCategoryChange("")}
                                    />
                                    <span>Tất cả</span>
                                </label>
                                {dbCategories.map(cat => (
                                    <label key={cat.id} className="filter-item">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={String(selectedCategoryId) === String(cat.id)}
                                            onChange={() => handleCategoryChange(cat.id)}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>Khoảng Giá (VNĐ)</h4>
                            <div className="price-quick-filters">
                                <button onClick={() => { setMinPrice(""); setMaxPrice("100000"); handleApplyPrice("0", "100000"); }}>Dưới 100k</button>
                                <button onClick={() => { setMinPrice("100000"); setMaxPrice("500000"); handleApplyPrice("100000", "500000"); }}>100k - 500k</button>
                                <button onClick={() => { setMinPrice("500000"); setMaxPrice(""); handleApplyPrice("500000", ""); }}>Trên 500k</button>
                            </div>
                            <div className="price-range">
                                <input
                                    type="number"
                                    placeholder="TỪ"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span className="range-sep">-</span>
                                <input
                                    type="number"
                                    placeholder="ĐẾN"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                            <button className="btn-apply" onClick={handleApplyFilters}>ÁP DỤNG</button>
                        </div>

                        <button className="btn-clear-all" onClick={handleClearAll}>XÓA TẤT CẢ</button>
                    </section>
                </aside>

                <section className="search-content">
                    {activeFilters.length > 0 && (
                        <div className="active-filters-chips">
                            <span className="chips-label">Bộ lọc đang áp dụng:</span>
                            {activeFilters.map((filter, index) => (
                                <div key={index} className="filter-chip">
                                    {filter.label}
                                    <button onClick={() => removeFilter(filter)} className="remove-chip">×</button>
                                </div>
                            ))}
                            <button className="clear-chips-btn" onClick={handleClearAll}>Xóa hết</button>
                        </div>
                    )}

                    <div className="search-results-header">
                        <div className="results-info">
                            {initialKeyword ? (
                                <p>Kết quả tìm kiếm cho từ khóa '<strong>{initialKeyword}</strong>'</p>
                            ) : (
                                <p>Tất cả sản phẩm</p>
                            )}
                        </div>
                        <div className="sort-options">
                            <span>Sắp xếp theo:</span>
                            <button
                                className={`sort-btn ${sortBy === 'relevance' ? 'active' : ''}`}
                                onClick={() => handleSortChange('relevance')}
                            >Phổ biến</button>
                            <button
                                className={`sort-btn ${sortBy === 'ctime' ? 'active' : ''}`}
                                onClick={() => handleSortChange('ctime')}
                            >Mới nhất</button>
                            <button
                                className={`sort-btn ${sortBy === 'sales' ? 'active' : ''}`}
                                onClick={() => handleSortChange('sales')}
                            >Bán chạy</button>
                            <select
                                className={`sort-select ${sortBy.startsWith('price') ? 'active' : ''}`}
                                value={sortBy.startsWith('price') ? sortBy : 'price-asc'}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="price-asc">Giá: Thấp đến Cao</option>
                                <option value="price-desc">Giá: Cao đến Thấp</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="search-loading">
                            <div className="spinner"></div>
                            <p>Đang tìm sản phẩm...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="search-results-grid">
                                {results.map(product => (
                                    <article key={product.id} className="search-product-card">
                                        <Link to={`/products/${product.id}`} className="card-image-link">
                                            <div className="card-image-wrap">
                                                <img src={product.thumbnail} alt={product.name} />
                                                {product.sold > 10 && <span className="card-tag">Bán chạy</span>}
                                            </div>
                                        </Link>
                                        <div className="card-info">
                                            <Link to={`/products/${product.id}`} className="card-name-link">
                                                <h3 className="card-name">{product.name}</h3>
                                            </Link>
                                            <div className="card-price-row">
                                                <span className="card-price">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(product.price)}
                                                </span>
                                            </div>
                                            <div className="card-meta">
                                                <span className="card-category">{product.categoryName}</span>
                                                <span className="card-sold">Đã bán {product.sold}</span>
                                            </div>
                                            <div className="card-actions">
                                                <Link
                                                    to={`/ai-virtual-tryon?productId=${product.id}&thumbnail=${encodeURIComponent(product.thumbnail)}&productName=${encodeURIComponent(product.name)}&price=${product.price}`}
                                                    className="btn-vto-small"
                                                >Thử đồ AI</Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {pagination && pagination.totalPages > 1 && (
                                <div className="search-pagination">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => {
                                            const newParams = new URLSearchParams(location.search);
                                            newParams.set("page", String(page - 1));
                                            navigate(`/search?${newParams.toString()}`);
                                        }}
                                        className="pag-btn"
                                    ><FaChevronLeft /></button>
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`pag-btn ${page === i + 1 ? 'active' : ''}`}
                                            onClick={() => {
                                                const newParams = new URLSearchParams(location.search);
                                                newParams.set("page", String(i + 1));
                                                navigate(`/search?${newParams.toString()}`);
                                            }}
                                        >{i + 1}</button>
                                    ))}
                                    <button
                                        disabled={page === pagination.totalPages}
                                        onClick={() => {
                                            const newParams = new URLSearchParams(location.search);
                                            newParams.set("page", String(page + 1));
                                            navigate(`/search?${newParams.toString()}`);
                                        }}
                                        className="pag-btn"
                                    ><FaChevronRight /></button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="search-empty">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-product-found-8290940-6632338.png" alt="No results" />
                            <h3>Không tìm thấy kết quả nào</h3>
                            <p>Hãy thử sử dụng từ khóa khác hoặc xóa bộ lọc.</p>
                        </div>
                    )}
                </section>
            </main>

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
                            <li><Link to="/login">Tài khoản</Link></li>
                            <li><a href="#main-content">Theo dõi đơn hàng</a></li>
                            <li><a href="#main-content">Đổi trả &amp; bảo hành</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="lp-footer-title">Công ty</h3>
                        <ul className="lp-footer-links">
                            <li><a href="#main-content">Về chúng tôi</a></li>
                            <li><a href="#main-content">Tuyển dụng</a></li>
                            <li><a href="#main-content">Điều khoản</a></li>
                        </ul>
                    </div>
                    <div className="lp-footer-social">
                        <h3 className="lp-footer-title">Kết nối</h3>
                        <div className="lp-social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <div className="container">© {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.</div>
                </div>
            </footer>
        </div>
    );
}
