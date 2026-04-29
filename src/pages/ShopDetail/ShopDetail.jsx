import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    FaStar,
    FaBox,
    FaUsers,
    FaCalendarAlt,
    FaSearch,
    FaUserCircle,
    FaSignOutAlt,
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaTruck,
    FaFilter,
    FaPlus,
    FaCheckCircle,
    FaShoppingCart,
    FaUser
} from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import api from '../../services/api';
import { ShopCuahangService } from '../../services/ShopCuahangService';
import { ShopProductService } from '../../services/ShopProductService';
import { CategoryService } from '../../services/CategoryService';
import chatService from '../../services/chatService';
// ProductCard component merged from common component
function ProductCard({ product }) {
    if (!product) return null;

    const id = product.id || product.ProductId || product.productId;
    const name = product.name || product.ProductName || product.productName || 'Sản phẩm';
    const image = product.image || product.thumbnail || product.Thumbnail || "https://via.placeholder.com/300";
    const price = product.price || product.Price || 0;

    return (
        <article className="product-card">
            <Link to={`/products/${id}`} className="product-card-link">
                <div className="product-image-container">
                    <img
                        src={image}
                        alt={name}
                        className="product-card-image"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300" }}
                    />
                </div>
                <div className="product-card-body">
                    <h3 className="product-card-name">
                        {name}
                    </h3>
                    <div className="product-card-price">
                        {Number(price).toLocaleString('vi-VN')} đ
                    </div>
                </div>
            </Link>
        </article>
    );
}

import '../LandingPage/LandingPage.css';
import './ShopDetail.css';

// Reusing PageHeader and PageFooter directly for consistency
function PageHeader({ userLabel, userAvatar, dbCategories, onLogout }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);



    const handleNavClick = (catId) => {
        if (catId === "all") navigate("/");
        else navigate(`/category/${catId}`);
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
                            autoComplete="off"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    setShowSuggestions(false);
                                    if (searchTerm.trim()) {
                                        navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
                                    }
                                }
                            }}
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
                                        <img src={userAvatar} alt="Avatar" style={{ width: "24px", height: "24px", borderRadius: "50%", marginRight: "8px", objectFit: "cover" }} />
                                    ) : (
                                        <FaUserCircle style={{ fontSize: "20px", color: "var(--lp-accent)" }} />
                                    )}
                                    <span className="user-profile">{userLabel}</span>
                                </button>
                                <div className="profile-dropdown">
                                    <Link to="/manage/Manageinvoice" className="profile-dropdown-item"><FaBox /> Đơn mua</Link>
                                    <Link to="/user/UserProfile" className="profile-dropdown-item"><FaUser /> Trang cá nhân</Link>
                                    {localStorage.getItem("userRole")?.toLowerCase().includes("shop") && (
                                        <Link to="/shop-owner/store" className="profile-dropdown-item" style={{ color: "var(--lp-accent)" }}>
                                            <FaBox /> Kênh Shop
                                        </Link>
                                    )}
                                    <button type="button" className="profile-dropdown-item logout" onClick={onLogout}>
                                        <FaSignOutAlt /> Đăng xuất
                                    </button>
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
                    <span onClick={() => handleNavClick("all")} style={{ cursor: "pointer" }}>TẤT CẢ DANH MỤC</span>
                    {dbCategories.map((cat) => (
                        <span key={cat.categoryId || cat.id} onClick={() => handleNavClick(cat.categoryId || cat.id)} style={{ cursor: "pointer" }}>
                            {cat.categoryName || cat.name}
                        </span>
                    ))}
                    <Link
                        to={localStorage.getItem("userRole")?.toLowerCase().includes("shop") ? "/shop-owner/store" : "/register-shop"}
                        style={{
                            marginLeft: 'auto',
                            color: '#fff',
                            backgroundColor: 'var(--lp-accent, #2563eb)',
                            fontWeight: 800,
                            padding: '6px 16px',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)"
                        }}
                    >
                        Trở thành Người bán hàng
                    </Link>
                </div>
            </nav>
        </>
    );
}

function PageFooter() {
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
                        <li><Link to="/login">Tài khoản</Link></li>
                        <li><a href="/">Theo dõi đơn hàng</a></li>
                        <li><a href="/">Đổi trả &amp; bảo hành</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="lp-footer-title">Công ty</h3>
                    <ul className="lp-footer-links">
                        <li><a href="/">Về chúng tôi</a></li>
                        <li><a href="/">Tuyển dụng</a></li>
                        <li><a href="/">Điều khoản</a></li>
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
                <div className="container">
                    © {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.
                </div>
            </div>
        </footer>
    );
}

export default function ShopDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userLabel, setUserLabel] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null);
    const [dbCategories, setDbCategories] = useState([]);

    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stats State
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowed, setIsFollowed] = useState(false);

    // Filters State
    const [catFilter, setCatFilter] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [priceRanges, setPriceRanges] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        async function loadInitialData() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const profile = await api.get("/users/profile").then(res => res.data);
                    setUserLabel(profile.fullName || profile.email || profile.username);
                    setUserAvatar(profile.avatarUrl || null);
                } catch (err) {
                    console.error("Lỗi tải profile:", err);
                }
            }
            try {
                const res = await CategoryService.getAllCategories();
                const categories = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
                setDbCategories(categories);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        }
        loadInitialData();
    }, []);

    useEffect(() => {
        async function loadShopData() {
            try {
                setLoading(true);
                setError(null);

                const shopData = await ShopCuahangService.getStoreById(id);
                setShop(shopData);
                // Initialize follow count if available in shopData, else use 0
                setFollowerCount(shopData.followerCount || 0);

                const productsData = await ShopProductService.getProductShop(id, 200);
                const prods = Array.isArray(productsData) ? productsData : (productsData.data || []);

                setProducts(prods);
            } catch (err) {
                console.error("Lỗi tải trang shop:", err);
                setError("Không thể tải thông tin cửa hàng.");
            } finally {
                setLoading(false);
            }
        }
        if (id) loadShopData();
    }, [id]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
    };

    const handleToggleFollow = () => {
        if (!userLabel) {
            toast.error("Vui lòng đăng nhập để theo dõi shop.");
            navigate("/login");
            return;
        }

        if (isFollowed) {
            setFollowerCount(prev => Math.max(0, prev - 1));
            toast.success("Đã bỏ theo dõi shop");
        } else {
            setFollowerCount(prev => prev + 1);
            toast.success("Đã theo dõi shop");
        }
        setIsFollowed(!isFollowed);
    };

    const handleChatNow = async () => {
        if (!userLabel) {
            toast.error("Vui lòng đăng nhập để chat.");
            navigate("/login");
            return;
        }
        try {
            // Truyền storeId để backend tạo/tìm conversation
            const shopIdToChat = shop?.storeId || id;
            const res = await chatService.startChat(shopIdToChat);
            if (res && res.ConversationId) navigate("/chat", { state: { conversationId: res.ConversationId } });
            else navigate("/chat");
        } catch (err) {
            console.error("Lỗi khi bắt đầu chat:", err);
            navigate("/chat");
        }
    };

    const handlePriceToggle = (range) => {
        if (priceRanges.includes(range)) {
            setPriceRanges(priceRanges.filter(r => r !== range));
        } else {
            setPriceRanges([...priceRanges, range]);
        }
    };

    const handleNavClick = (catId) => {
        if (catId === "all") navigate("/");
        else navigate(`/category/${catId}`);
    };

    // CLIENT-SIDE FILTERING LOGIC
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => p.approvalStatus === 'APPROVED' || p.ApprovalStatus === 'APPROVED' || !p.approvalStatus); // Keep products without status if API doesn't return it yet

        // Search filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(p => p.name?.toLowerCase().includes(lowerSearch));
        }

        // Category filter
        if (catFilter) {
            result = result.filter(p => p.categoryName === catFilter);
        }

        // Size & Color filter (Check if any variant matches)
        if (sizeFilter || colorFilter) {
            result = result.filter(p => {
                if (!p.variants || p.variants.length === 0) return false;
                return p.variants.some(v => {
                    let matchSize = sizeFilter ? v.size === sizeFilter : true;
                    let matchColor = colorFilter ? v.color === colorFilter : true;
                    return matchSize && matchColor;
                });
            });
        }

        // Price filtering
        if (priceRanges.length > 0) {
            result = result.filter(p => {
                const price = Number(p.price);
                return priceRanges.some(range => {
                    if (range === '<500') return price < 500000;
                    if (range === '500-1000') return price >= 500000 && price <= 1000000;
                    if (range === '>1000') return price > 1000000;
                    return false;
                });
            });
        }

        // Sort
        if (sortBy === 'lowest_price') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'highest_price') result.sort((a, b) => b.price - a.price);

        return result;
    }, [products, searchTerm, catFilter, sizeFilter, colorFilter, priceRanges, sortBy]);

    // Extract unique filters from loaded products
    const availableCategories = useMemo(() => [...new Set(products.map(p => p.categoryName).filter(Boolean))], [products]);
    const availableSizes = useMemo(() => {
        const sizes = new Set();
        products.forEach(p => p.variants?.forEach(v => { if (v.size) sizes.add(v.size); }));
        return [...sizes];
    }, [products]);
    const availableColors = useMemo(() => {
        const colors = new Set();
        products.forEach(p => p.variants?.forEach(v => { if (v.color) colors.add(v.color); }));
        return [...colors];
    }, [products]);


    if (loading) {
        return (
            <div className="shop-detail-page">
                <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />
                <div style={{ padding: "100px 0", textAlign: "center" }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="shop-detail-page">
                <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />
                <div style={{ padding: "100px 0", textAlign: "center" }}>
                    <h2>Không tìm thấy cửa hàng</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-detail-page">
            <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />

            {/* Header Profile */}
            <div className="shop-header-wrapper">
                <div className="shop-header-inner">
                    <div className="shop-avatar-box">
                        <img src={shop.logoUrl || "https://via.placeholder.com/150"} alt={shop.storeName} />
                        <div className="shop-badge-mall">MALL</div>
                    </div>

                    <div className="shop-header-center">
                        <div className="shop-title-row">
                            <h1>{shop.storeName}</h1>
                            <span className="badge-verified"><FaCheckCircle className="text-green-500" /> Đã xác thực</span>
                        </div>
                        <p className="shop-bio">{shop.description || "Thương hiệu thời trang mang đến phong cách tối giản và tinh tế."}</p>

                        <div className="shop-stats-row">
                            <div className="shop-stat-item"><FaStar className="text-yellow-400" /> <strong>{shop.rating || 4.9}</strong> / 5.0</div>
                            <div className="shop-stat-item"><FaBox className="text-blue-500" /> <strong>{shop.productCount ?? products.length}</strong> Sản phẩm</div>
                            <div className="shop-stat-item"><FaUsers className="text-green-500" /> <strong>{followerCount}</strong> Người theo dõi</div>
                            <div className="shop-stat-item"><FaCalendarAlt className="text-orange-500" /> Tham gia: <strong>{new Date(shop.createdAt).toLocaleDateString("vi-VN")}</strong></div>
                        </div>
                    </div>

                    <div className="shop-header-actions">
                        <button
                            className={`shop-action-btn ${isFollowed ? 'btn-chat' : 'btn-follow'}`}
                            onClick={handleToggleFollow}
                        >
                            {isFollowed ? <FaCheckCircle /> : <FaPlus />} {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                        <button className="shop-action-btn btn-chat" onClick={handleChatNow}><FiMessageCircle /> Chat ngay</button>
                    </div>
                </div>
            </div>

            <main className="shop-main-layout">
                <div className="shop-content-grid">

                    {/* LEFT SIDEBAR */}
                    <aside className="shop-sidebar">
                        <div className="sidebar-main-title">
                            <FaFilter className="text-blue-600" /> BỘ LỌC TÌM KIẾM
                        </div>

                        <div className="shipping-promo-card">
                            <div className="promo-header">
                                <FaTruck className="promo-icon" />
                                <span>ƯU ĐÃI VẬN CHUYỂN</span>
                            </div>
                            <p className="promo-text">Miễn phí vận chuyển cho mọi đơn hàng từ 1 triệu đồng. Giao hỏa tốc trong 2h tại TP.HCM.</p>
                        </div>

                        {/* Filters */}
                        <div className="sidebar-card">
                            <div className="sidebar-header">
                                <h3><FaFilter className="text-gray-400" /> Danh sách sản phẩm</h3>

                            </div>
                            <div className="sidebar-body">

                                {/* Categories */}
                                {availableCategories.length > 0 && (
                                    <div className="filter-group">
                                        <div className="filter-title">LOẠI SẢN PHẨM</div>
                                        <div className="category-grid">
                                            <div className={`filter-btn ${catFilter === '' ? 'active' : ''}`} onClick={() => setCatFilter('')}>Tất cả</div>
                                            {availableCategories.map(cat => (
                                                <div key={cat} className={`filter-btn ${catFilter === cat ? 'active' : ''}`} onClick={() => setCatFilter(cat)}>{cat}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sizes */}
                                {availableSizes.length > 0 && (
                                    <div className="filter-group">
                                        <div className="filter-title">KÍCH THƯỚC</div>
                                        <div className="size-grid">
                                            <div className={`size-btn ${sizeFilter === '' ? 'active' : ''}`} onClick={() => setSizeFilter('')}>All</div>
                                            {availableSizes.map(size => (
                                                <div key={size} className={`size-btn ${sizeFilter === size ? 'active' : ''}`} onClick={() => setSizeFilter(size)}>{size}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Colors (Mocked visually but functions on text) */}
                                {availableColors.length > 0 && (
                                    <div className="filter-group">
                                        <div className="filter-title">MÀU SẮC</div>
                                        <div className="color-grid">
                                            <div className={`filter-btn ${colorFilter === '' ? 'active' : ''}`} onClick={() => setColorFilter('')}>All</div>
                                            {availableColors.map(color => {
                                                const colorMap = {
                                                    "Đen": "#1a1a1a",
                                                    "Trắng": "#ffffff",
                                                    "Xanh": "#2563eb",
                                                    "Xanh dương": "#2563eb",
                                                    "Xanh lá": "#10b981",
                                                    "Đỏ": "#ef4444",
                                                    "Be": "#f5f5dc",
                                                    "Vàng": "#facc15",
                                                    "Hồng": "#ec4899",
                                                    "Xám": "#9ca3af",
                                                    "Tím": "#8b5cf6",
                                                    "Cam": "#f97316",
                                                    "Nâu": "#78350f"
                                                };
                                                const hex = colorMap[color] || "#cbd5e1";
                                                return (
                                                    <div
                                                        key={color}
                                                        className={`color-dot ${colorFilter === color ? 'active' : ''}`}
                                                        style={{ backgroundColor: hex }}
                                                        title={color}
                                                        onClick={() => setColorFilter(color)}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="filter-group">
                                    <div className="filter-title">KHOẢNG GIÁ</div>
                                    <div className="checkbox-list">
                                        <label className="checkbox-item">
                                            <input type="checkbox" checked={priceRanges.includes('<500')} onChange={() => handlePriceToggle('<500')} /> Dưới 500k
                                        </label>
                                        <label className="checkbox-item">
                                            <input type="checkbox" checked={priceRanges.includes('500-1000')} onChange={() => handlePriceToggle('500-1000')} /> 500k - 1tr
                                        </label>
                                        <label className="checkbox-item">
                                            <input type="checkbox" checked={priceRanges.includes('>1000')} onChange={() => handlePriceToggle('>1000')} /> Trên 1tr
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </aside>

                    {/* RIGHT CONTENT */}
                    <section className="shop-content-area">

                        {/* Toolbar */}
                        <div className="shop-toolbar">
                            <div className="toolbar-left">
                                <button className="btn-filter-mobile" style={{ display: 'none' }}><FaFilter /> Lọc</button>
                                <div className="toolbar-search">
                                    <FaSearch />
                                    <input
                                        type="text"
                                        placeholder="Tìm sản phẩm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="toolbar-right">
                                <span>Sắp xếp:</span>
                                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">Mới nhất</option>
                                    <option value="lowest_price">Giá thấp đến cao</option>
                                    <option value="highest_price">Giá cao đến thấp</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="products-header">
                            <h2>Tất cả sản phẩm <span>({filteredProducts.length})</span></h2>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '8px' }}>
                                <p style={{ color: '#6b7280' }}>Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                                <button className="btn-text-link mt-4 mx-auto" onClick={() => {
                                    setSearchTerm(''); setCatFilter(''); setSizeFilter(''); setColorFilter(''); setPriceRanges([]);
                                }}>Xóa bộ lọc</button>
                            </div>
                        ) : (
                            <div className="shop-product-grid">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id || product.ProductId} product={product} />
                                ))}
                            </div>
                        )}

                        {filteredProducts.length > 0 && <button className="btn-load-more">Xem thêm sản phẩm</button>}
                    </section>
                </div>
            </main>

            <PageFooter />
        </div>
    );
}
