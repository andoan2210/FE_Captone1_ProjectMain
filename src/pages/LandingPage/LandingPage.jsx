import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { getNewProducts, getBestSellerProducts, getProductsByCategory } from '../../services/LandingPageService';
import axios from 'axios';
import './LandingPage.css';


const API_BASE = 'http://localhost:8080/api';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=85&auto=format&fit=crop';

const offers = [
  { id: 1, discount: '20%', code: 'SMART20', desc: 'Đơn tối thiểu 500k' },
  { id: 2, discount: '50k', code: 'FREESHIP', desc: 'Đơn tối thiểu 0đ' },
  { id: 3, discount: '100k', code: 'AIWINTER', desc: 'Đơn tối thiểu 1tr' },
  { id: 4, discount: '15%', code: 'HELLO2024', desc: 'Đơn tối thiểu 200k' },
];

const mockProducts = [
  {
    id: 1,
    name: 'Áo Blazer Linen Phối Nút Cao Cấp',
    category: 'ÁO KHOÁC',
    price: '850.000đ',
    tag: 'MỚI',
    image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/451/244/products/442489741-436524615792119-6165782920369129994-n-1716440986212.jpg?v=1734515349447',
  },
  {
    id: 2,
    name: 'Váy Lụa Maxi Họa Tiết Tropical',
    category: 'VÁY NỮ',
    price: '1.250.000đ',
    tag: 'MỚI',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Quần Jeans Slimfit Co Giãn 4 Chiều',
    category: 'QUẦN NAM',
    price: '690.000đ',
    tag: 'MỚI',
    image:
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgncqvvh9w5o20',
  },
  {
    id: 4,
    name: 'Giày Sneaker Phản Quang Urban Style',
    category: 'GIÀY DÉP',
    price: '1.500.000đ',
    tag: 'MỚI',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85&auto=format&fit=crop',
  },
];

const mockPersonalized = [
  {
    id: 101,
    name: 'Bộ Vest Business Navy Sang Trọng',
    category: 'BỘ VEST',
    price: '3.500.000đ',
    tag: 'AI Gợi ý',
    image:
      'https://5sfashion.vn/storage/upload/images/ckeditor/kscj4hNtTwdMy9rGqqN337htzMDQpVdYPqRvVUP2.jpg',
  },
  {
    id: 102,
    name: 'Đầm Dự Tiệc Trễ Vai Đính Đá',
    category: 'VÁY NỮ',
    price: '2.800.000đ',
    tag: 'AI Gợi ý',
    image:
      'https://product.hstatic.net/200000804863/product/leo01449_fcbd9d9ee0724e6f928beb6f04ca9414.jpg',
  },
  {
    id: 103,
    name: 'Áo Hoodie Oversize Chữ Nổi',
    category: 'ÁO THUN',
    price: '550.000đ',
    tag: 'AI Gợi ý',
    image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=85&auto=format&fit=crop',
  },
  {
    id: 104,
    name: 'Kính Râm Aviator Chống Tia UV',
    category: 'KÍNH MẮT',
    price: '450.000đ',
    tag: 'AI Gợi ý',
    image:
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=85&auto=format&fit=crop',
  },
];

const mockBrands = [
  { id: 1, name: 'Ananas Official', followers: '120K FOLLOWERS', rating: 4.9 },
  { id: 2, name: 'Coolmate Store', followers: '350K FOLLOWERS', rating: 4.8 },
  { id: 3, name: 'Marc Fashion', followers: '65K FOLLOWERS', rating: 4.7 },
  { id: 4, name: 'DirtyCoins', followers: '500K FOLLOWERS', rating: 4.9 },
  { id: 5, name: 'Ivy Moda', followers: '210K FOLLOWERS', rating: 4.8 },
];

const CATEGORY_ITEMS = [
  { id: 'all', label: 'Tất cả sản phẩm' },
  { id: 'men', label: 'Nam giới' },
  { id: 'women', label: 'Nữ giới' },
  { id: 'kids', label: 'Trẻ em' },
  { id: 'accessories', label: 'Phụ kiện' },
  { id: 'shoes', label: 'Giày dép' },
];

function getUserDisplayNameFromToken() {
  const token = localStorage.getItem('token');
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

function StarRating({ value = 4.5 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const idx = i + 1;
    const isFull = idx <= full;
    const isHalf = !isFull && half && idx === full + 1;
    return (
      <span
        key={i}
        className="lp2-star"
        aria-hidden="true"
        data-kind={isFull ? 'full' : isHalf ? 'half' : 'empty'}
      >
        ★
      </span>
    );
  });

  return (
    <div className="lp2-rating" aria-label={`${value} sao`}>
      {stars}
    </div>
  );
}

const ProductCard = ({ product }) => (
  <article className="product-card">
    <div className="product-image-wrapper">
      <span
        className={`product-tag ${product.tag === 'AI Gợi ý' ? 'tag-ai' : 'tag-new'}`}
      >
        {product.tag === 'AI Gợi ý' ? '✨ AI Gợi ý' : product.tag}
      </span>
      <img src={product.image} alt={product.name} loading="lazy" />
    </div>
    <div className="product-info">
      <p className="product-category">{product.category}</p>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{product.price}</p>
      <div className="product-actions">
        <button type="button" className="btn-outline">
          Thử đồ
        </button>
        <Link className="btn-primary product-link-btn" to={`/products/${product.id}`}>
          Mua
        </Link>
      </div>
    </div>
  </article>
);

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('men');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');

  const [userLabel, setUserLabel] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get('/auth/profile');
        const profile = response.data;
        setUserLabel(
          profile.FullName ||
          profile.Email ||
          profile.email ||
          profile.UserName ||
          profile.username ||
          getUserDisplayNameFromToken()
        );
      } catch {
        setUserLabel(getUserDisplayNameFromToken());
      }
    }

    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // State mới để chứa dữ liệu API
  const [newProductsData, setNewProductsData] = useState([]);
  const [forYouData, setForYouData] = useState([]);
  const [categoryProductsData, setCategoryProductsData] = useState([]);

  // 1. Tải Sản phẩm mới & Bán chạy lúc khởi tạo trang
  useEffect(() => {
    let isMounted = true;

    async function loadInitialProducts() {
      setLoadingProducts(true);
      setProductError('');

      try {
        // Gọi đồng thời 2 API
        const [newRes, bestRes] = await Promise.all([
          getNewProducts(4),
          getBestSellerProducts(4)
        ]);

        if (!isMounted) return;

        // Xử lý mapping cho Sản phẩm mới (API trả về ProductId, ProductName...)
        const mappedNew = (newRes.data || []).map((item) => ({
          id: item.ProductId ?? item.id,
          name: item.ProductName ?? item.name,
          category: item.CategoryName ?? item.categoryName ?? 'MỚI NHẤT',
          price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.Price ?? item.price ?? 0)),
          tag: 'MỚI',
          image: item.ThumbnailUrl ?? item.thumbnail ?? 'https://via.placeholder.com/520x580?text=No+Image',
        }));

        // Xử lý mapping cho Sản phẩm bán chạy (AI Gợi ý) (API trả về id, name...)
        const mappedBest = (bestRes.data || []).map((item) => ({
          id: item.id ?? item.ProductId,
          name: item.name ?? item.ProductName,
          category: item.categoryName ?? item.CategoryName ?? 'BÁN CHẠY',
          price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price ?? item.Price ?? 0)),
          tag: '✨ AI Gợi ý',
          image: item.thumbnail ?? item.ThumbnailUrl ?? 'https://via.placeholder.com/520x580?text=No+Image',
        }));

        setNewProductsData(mappedNew);
        setForYouData(mappedBest);
      } catch (err) {
        if (!isMounted) return;
        setProductError('Không thể tải sản phẩm từ server');
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    loadInitialProducts();
    return () => { isMounted = false; };
  }, []);

  // 2. Tải dữ liệu theo Danh mục khi người dùng bấm tab
  useEffect(() => {
    let isMounted = true;
    async function loadCategoryProducts() {
      try {
        // Map string (men, women...) sang ID danh mục tương ứng trong Database
        // Giả sử: men = 1, women = 2, kids = 3... (Bạn có thể chỉnh theo ID thật trong SQL)
        const categoryMap = { 'all': 1, 'men': 1, 'women': 2, 'kids': 3, 'accessories': 4, 'shoes': 5 };
        const catId = categoryMap[activeCategory] || 1;

        const res = await getProductsByCategory(catId, 1, 8); // Lấy 8 sản phẩm
        if (!isMounted) return;

        const mappedCategory = (res.data || []).map(item => ({
          id: item.id ?? item.ProductId,
          name: item.name ?? item.ProductName,
          category: item.categoryName ?? 'Danh Mục',
          price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price ?? item.Price ?? 0)),
          tag: '',
          image: item.thumbnail ?? item.ThumbnailUrl ?? 'https://via.placeholder.com/520x580?text=No+Image'
        }));

        setCategoryProductsData(mappedCategory);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    }

    loadCategoryProducts();
    return () => { isMounted = false; };
  }, [activeCategory]);

  // Fallback (Dùng data thật, nếu rỗng thì dùng mock tạm thời)
  const categoryGridProducts = categoryProductsData.length > 0 ? categoryProductsData : mockProducts;
  const newProducts = newProductsData.length > 0 ? newProductsData : mockProducts;
  const forYouProducts = forYouData.length > 0 ? forYouData : mockPersonalized;

  return (
    // ... (Giữ nguyên phần return của bạn)
    <div className="landing-page-container">
      <a href="#main-content" className="lp-skip-link">
        Bỏ qua điều hướng
      </a>

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
            <button type="button" className="icon-link" aria-label="Giỏ hàng">
              <FaShoppingCart />
            </button>
            {userLabel ? (
              <>
                <span className="user-profile">{userLabel}</span>
                <button type="button" className="btn-link" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
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
          <span>TẤT CẢ DANH MỤC</span>
          <span>Thời trang Nam</span>
          <span>Thời trang Nữ</span>
          <span>Giày dép</span>
          <span>Túi xách</span>
          <span>Phụ kiện</span>
          <span>Đồ thể thao</span>
          <span className="text-red">BST Thu Đông</span>
          <span className="text-red">Đồ hiệu sale</span>
          <span className="flash-sale">⚡ Flash Sale</span>
        </div>
      </nav>

      <main id="main-content" className="container lp-main">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-content">
            <span className="badge-collection">BST THU ĐÔNG 2024</span>
            <h1 id="hero-title">
              NÂNG TẦM <br />
              <span className="text-accent">PHONG CÁCH</span> <br />
              VỚI CÔNG NGHỆ AI
            </h1>
            <p>
              Trải nghiệm mua sắm chưa từng có với tính năng thử đồ ảo. Chọn đồ ưng ý,
              ướm thử tức thì ngay trên màn hình.
            </p>
            <div className="hero-buttons">
              <Link to="/products/1" className="btn-primary large">
                Khám phá ngay →
              </Link>
              <button type="button" className="btn-outline large">
                Thử đồ AI
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <h3>500k+</h3>
                <p>KHÁCH HÀNG</p>
              </div>
              <div>
                <h3>2.5k+</h3>
                <p>THƯƠNG HIỆU</p>
              </div>
            </div>
          </div>
          <div className="hero-image-container">
            <img
              className="hero-image"
              src={HERO_IMAGE}
              alt="Mẫu thời trang với túi xách — SmartAI Fashion"
            />
            <div className="ai-ready-badge">
              <span className="star-icon" aria-hidden>
                ★
              </span>
              <div>
                <p>AI TRY ON READY</p>
                <strong>Khớp độ 99.9%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block offers-section" aria-labelledby="offers-heading">
          <div className="section-header">
            <h2 id="offers-heading">Ưu đãi độc quyền</h2>
            <p>Săn voucher khủng, mua sắm thả ga không lo về giá</p>
          </div>
          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-discount">
                  GIẢM
                  <br />
                  <strong>{offer.discount}</strong>
                </div>
                <div className="offer-details">
                  <h4>Mã: {offer.code}</h4>
                  <p>{offer.desc}</p>
                  <button type="button" className="offer-cta">
                    Dùng ngay &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block" aria-labelledby="new-products-heading">
          <div className="section-header flex-between">
            <div>
              <h2 id="new-products-heading">Sản phẩm mới nhất</h2>
              <p>Cập nhật những xu hướng thời trang mới nhất vừa lên kệ</p>
            </div>
            <Link to="/products/1" className="view-all">
              Xem tất cả &gt;
            </Link>
          </div>
          <div className="products-grid">
            {(newProducts.length ? newProducts : mockProducts).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="virtual-tryon-banner" aria-labelledby="vto-heading">
          <div className="vto-content">
            <h2 id="vto-heading" className="flex-align-center">
              <span className="star-icon" aria-hidden>
                ★
              </span>{' '}
              AI Virtual Try-On
            </h2>
            <h3>PHÒNG THỬ ĐỒ THÔNG MINH 4.0</h3>
            <p>
              Không còn lo lắng về việc mặc không vừa hay không hợp. Với AI của chúng
              tôi, bạn có thể ướm thử bất kỳ sản phẩm nào lên chính hình ảnh cá nhân
              chỉ trong 2 giây.
            </p>
            <ul className="vto-features">
              <li>✔️ Độ chính xác cao</li>
              <li>✔️ Gợi ý size chuẩn</li>
              <li>✔️ Phối đồ tự động</li>
              <li>✔️ Chia sẻ dễ dàng</li>
            </ul>
            <button type="button" className="btn-primary large">
              Thử ngay bây giờ
            </button>
          </div>
          <div className="vto-image">
            <div className="phone-mockup" role="img" aria-label="Giao diện thử đồ AI trên điện thoại">
              <span className="phone-mockup-label">Trải nghiệm UI Try On</span>
            </div>
          </div>
        </section>

        <section className="section-block" aria-labelledby="for-you-heading">
          <div className="section-header">
            <h2 id="for-you-heading">Dành riêng cho bạn</h2>
            <p>Dựa trên phong cách và sở thích cá nhân của bạn được phân tích bởi AI</p>
          </div>
          <div className="products-grid">
            {(forYouProducts.length ? forYouProducts : mockPersonalized).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="section-block" aria-labelledby="brands-heading">
          <div className="section-header">
            <h2 id="brands-heading">Thương hiệu nổi bật</h2>
            <p>Mua sắm trực tiếp từ các Official Store uy tín nhất</p>
          </div>
          <div className="brands-grid">
            {mockBrands.map((brand) => (
              <div key={brand.id} className="brand-card">
                <div className="brand-logo-placeholder" aria-hidden />
                <h4>{brand.name}</h4>
                <div className="brand-rating">
                  <StarRating value={brand.rating} /> {brand.rating}
                </div>
                <p className="brand-followers">{brand.followers}</p>
                <button type="button" className="btn-outline-small">
                  XEM SHOP
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block category-section" aria-labelledby="hot-cat-heading">
          <div className="category-sidebar">
            <h2 id="hot-cat-heading">Danh mục hot</h2>
            <ul className="category-menu">
              {CATEGORY_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === activeCategory ? 'active' : ''}
                    onClick={() => setActiveCategory(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="vip-card">
              <h4>ĐẶC QUYỀN VIP</h4>
              <p>Giao hàng hỏa tốc trong 2h và bảo hành 12 tháng mọi sản phẩm.</p>
              <button type="button" className="btn-primary w-full">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          <div className="category-products">
            <div className="products-grid-3-cols">
              {categoryGridProducts.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))}
            </div>
            <div className="load-more-container">
              <button type="button" className="btn-outline large">
                Tải thêm sản phẩm
              </button>
            </div>
          </div>
        </section>
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
          <div className="container">© {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.</div>
        </div>
      </footer>
    </div>
  );
}
