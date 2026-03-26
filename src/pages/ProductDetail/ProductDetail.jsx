import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaHeart,
  FaBolt,
  FaClock,
  FaChevronRight,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa'
import api from '../../services/api'
import { ProductDetailService } from '../../services/ProductDetailService'
import '../LandingPage/LandingPage.css'
import './ProductDetail.css'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const RELATED_PRODUCTS = [
  {
    id: 2,
    name: 'Quần Âu Nam Premium',
    price: '590.000₫',
    image:
      'https://images.unsplash.com/photo-1541099649102-fbd7dba35356?w=400&q=85&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Giày Tây Derby Da Bò',
    price: '1.290.000₫',
    image:
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=85&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Áo Blazer Linen Mùa Hè',
    price: '1.850.000₫',
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=85&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Túi Da Công Sở Minimal',
    price: '720.000₫',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=85&auto=format&fit=crop',
  },
  {
    id: 1,
    name: 'Áo sơ mi Slimfit Cotton',
    price: '450.000₫',
    image:
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=85&auto=format&fit=crop',
  },
]

const FOR_YOU = [
  {
    id: 1,
    name: 'Áo Blazer Linen Mùa Hè',
    price: '1.850.000₫',
    badge: 'Phù hợp với phong cách của bạn',
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=85&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Quần Tây Slimfit Xanh Navy',
    price: '690.000₫',
    badge: 'Thường mua cùng',
    image:
      'https://images.unsplash.com/photo-1473966968600-fa8018698690?w=500&q=85&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Giày Loafer Da Thật',
    price: '1.100.000₫',
    badge: 'Gợi ý AI',
    image:
      'https://images.unsplash.com/photo-1614252369475-7e76329c9da0?w=500&q=85&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Đồng hồ Minimal Steel',
    price: '890.000₫',
    badge: 'Bổ sung outfit',
    image:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=85&auto=format&fit=crop',
  },
]

function getUserDisplayNameFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = jwtDecode(token)
    return (
      payload.email ||
      payload.name ||
      payload.fullName ||
      payload.username ||
      payload.sub ||
      null
    )
  } catch {
    return null
  }
}

function formatVnd(price) {
  return `${Number(price || 0).toLocaleString('vi-VN')}đ`
}

function PageHeader({ userLabel, onLogout }) {
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
              placeholder="Tìm kiếm sản phẩm, thương hiệu hoặc từ khóa..."
              className="search-bar"
              autoComplete="off"
            />
          </label>
          <div className="user-actions">
            <button type="button" className="icon-link pd-icon-badge-wrap" aria-label="Thông báo">
              <FaBell />
              <span className="pd-nav-dot" aria-hidden />
            </button>
            <button type="button" className="icon-link pd-icon-badge-wrap" aria-label="Giỏ hàng">
              <FaShoppingCart />
            </button>
            {userLabel ? (
              <>
                <span className="user-profile">{userLabel}</span>
                <button type="button" className="btn-link" onClick={onLogout}>
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

      <nav className="main-nav pd-main-nav" aria-label="Danh mục chính">
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
    </>
  )
}

function PageFooter() {
  return (
    <footer className="lp-footer pd-footer-tight">
      <div className="container lp-footer-grid">
        <div className="lp-footer-brand">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <p>
            Nền tảng thương mại điện tử ứng dụng AI — thử đồ ảo, gợi ý phong cách và giao hàng
            toàn quốc.
          </p>
        </div>
        <div>
          <h3 className="lp-footer-title">Chăm sóc khách hàng</h3>
          <ul className="lp-footer-links">
            <li>
              <a href="#main-pd">Trung tâm trợ giúp</a>
            </li>
            <li>
              <a href="#main-pd">Hướng dẫn mua hàng</a>
            </li>
            <li>
              <a href="#main-pd">Chính sách vận chuyển</a>
            </li>
            <li>
              <a href="#main-pd">Đổi trả &amp; bảo hành</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="lp-footer-title">Về SmartAI Fashion</h3>
          <ul className="lp-footer-links">
            <li>
              <a href="#main-pd">Giới thiệu</a>
            </li>
            <li>
              <a href="#main-pd">Tuyển dụng</a>
            </li>
            <li>
              <a href="#main-pd">Điều khoản sử dụng</a>
            </li>
            <li>
              <a href="#main-pd">Chính sách bảo mật</a>
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
        <div className="container pd-footer-bottom-inner">
          <span>© {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.</span>
          <span className="pd-footer-meta">Server: Ho Chi Minh City · Ngôn ngữ: Tiếng Việt</span>
        </div>
      </div>
    </footer>
  )
}

export default function ProductDetail() {
  const { id: idParam } = useParams()
  const userLabel = useMemo(() => getUserDisplayNameFromToken(), [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const productId = useMemo(() => {
    const n = Number(idParam)
    return Number.isInteger(n) && n > 0 ? n : NaN
  }, [idParam])

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        // THÊM: Bóc tách .data từ Axios Response
        const response = await ProductDetailService.getProductById(productId)
        const data = response.data; // <--- CẬP NHẬT Ở ĐÂY

        if (!isMounted) return

        const normalized = {
          ...data,
          id: data.ProductId ?? data.id,
          // .... (Phần còn lại giữ nguyên)
          productName: data.ProductName ?? data.productName,
          category: data.Categories?.CategoryName ?? data.category?.name ?? data.category ?? 'SẢN PHẨM',
          price: data.Price ?? data.price ?? 0,
          stock: data.Stock ?? data.stock ?? 0,
          thumbnailUrl: data.ThumbnailUrl ?? data.thumbnailUrl,
          images: data.ProductImages?.map((img) => img.ImageUrl) ?? data.images ?? [],
          description: data.Description ?? data.description ?? '',
          store: { storeName: data.Stores?.StoreName ?? data.store?.storeName ?? 'SmartAI Fashion Official' },
        }

        setProduct(normalized)
        setSelectedImage(normalized.thumbnailUrl || normalized.images?.[0] || '')
      } catch (apiError) {
        if (!isMounted) return
        if (apiError.response?.status === 404 || apiError.status === 404) {
          setNotFound(true)
          setProduct(null)
          return
        }
        setError(apiError.message || 'Không thể tải dữ liệu sản phẩm')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      setLoading(false)
      setError('ID sản phẩm không hợp lệ')
      return () => {
        isMounted = false
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  const allImages = useMemo(() => {
    if (!product) return []
    const combined = [product.thumbnailUrl, ...(product.images || [])].filter(Boolean)
    return [...new Set(combined)]
  }, [product])

  const priceNum = product ? Number(product.price) : 0
  const discountPercent = 30
  const originalPrice = useMemo(
    () => (priceNum > 0 ? Math.round(priceNum / (1 - discountPercent / 100)) : 0),
    [priceNum]
  )

  const categoryLabel = product?.category?.name || product?.category || 'Thời trang nam'
  const storeName = product?.store?.storeName || 'SmartAI Fashion Flagship Store'

  const shell = (inner) => (
    <div className="landing-page-container pd-shell">
      <a href="#main-pd" className="lp-skip-link">
        Bỏ qua điều hướng
      </a>
      <PageHeader userLabel={userLabel} onLogout={handleLogout} />
      {inner}
      <PageFooter />
    </div>
  )

  if (loading) {
    return shell(
      <div className="pd-state-wrap">
        <div className="pd-state-card">Đang tải chi tiết sản phẩm...</div>
      </div>
    )
  }

  if (error) {
    return shell(
      <div className="pd-state-wrap">
        <div className="pd-state-card error">
          <h2>Không thể tải dữ liệu</h2>
          <p>{error}</p>
          <Link to="/" className="pd-state-link">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return shell(
      <div className="pd-state-wrap">
        <div className="pd-state-card">
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm đã bị gỡ hoặc không tồn tại.</p>
          <Link to="/" className="pd-state-link">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const mainImg = selectedImage || 'https://via.placeholder.com/560x680?text=No+Image'
  const stock = product.stock ?? 0

  return shell(
    <main id="main-pd" className="pd-main-area">
      <div className="container pd-inner">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="pd-bc-sep">&gt;</span>
          <span>{categoryLabel}</span>
          <span className="pd-bc-sep">&gt;</span>
          <span className="active">{product.productName}</span>
        </nav>

        <section className="pd-top">
          <div className="pd-gallery-col">
            <div className="pd-main-image">
              <img src={mainImg} alt={product.productName} />
              <button
                type="button"
                className={`pd-wishlist ${wishlisted ? 'active' : ''}`}
                onClick={() => setWishlisted((w) => !w)}
                aria-label={wishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
              >
                <FaHeart />
              </button>
            </div>
            {allImages.length > 0 && (
              <div className="pd-thumbs-row">
                {allImages.map((thumb) => (
                  <button
                    key={thumb}
                    type="button"
                    className={`pd-thumb-btn ${selectedImage === thumb ? 'selected' : ''}`}
                    onClick={() => setSelectedImage(thumb)}
                  >
                    <img src={thumb} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <div className="pd-tags">
              <span className="pd-tag-store">CỬA HÀNG</span>
              <span className="pd-tag-cat">
                THỜI TRANG NAM &gt;{' '}
                {String(categoryLabel).toUpperCase()}
              </span>
            </div>
            <h1>{product.productName}</h1>

            <div className="pd-rating-row">
              <span className="pd-score">4.9</span>
              <span className="pd-stars" aria-hidden>
                ★★★★★
              </span>
              <span className="pd-sep">|</span>
              <span>1.250 đánh giá</span>
              <span className="pd-sep">|</span>
              <span>3.400 đã bán</span>
            </div>

            <div className="pd-price-block">
              <div className="pd-price-line">
                <span className="pd-price-current">{formatVnd(priceNum)}</span>
                <span className="pd-price-old">{formatVnd(originalPrice)}</span>
                <span className="pd-discount-pill">Giảm {discountPercent}%</span>
              </div>
              <p className="pd-price-note">
                <FaClock className="pd-inline-icon" aria-hidden />
                Giá tốt nhất trong 30 ngày qua
              </p>
            </div>

            <div className="pd-block">
              <div className="pd-label-row">
                <p className="pd-label">Kích thước</p>
                <button type="button" className="pd-link-ghost">
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="pd-options">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`pd-chip pd-chip-size ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-qty-block">
              <p className="pd-label">Số lượng</p>
              <div className="pd-qty-row-inner">
                <div className="pd-qty-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(Math.max(stock, 1), q + 1))}
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>
                <span className="pd-stock">Còn {stock} sản phẩm</span>
              </div>
            </div>

            <div className="pd-actions">
              <button type="button" className="pd-btn-outline pd-btn-cart">
                <FaShoppingCart aria-hidden />
                Thêm vào giỏ hàng
              </button>
              <button type="button" className="pd-btn-primary">
                Mua ngay
              </button>
            </div>
            <button type="button" className="pd-btn-ai">
              <FaBolt aria-hidden />
              Thử đồ ngay với AI Magic Fit
            </button>

            <ul className="pd-trust">
              <li>7 ngày trả hàng</li>
              <li>100% Chính hãng</li>
              <li>Miễn phí vận chuyển</li>
            </ul>
          </div>
        </section>

        <section className="pd-store-bar" aria-label="Cửa hàng">
          <div className="pd-store-left">
            <div className="pd-store-avatar" aria-hidden />
            <div>
              <strong className="pd-store-name">{storeName}</strong>
              <p className="pd-store-meta">
                Phản hồi: 99% (trong vài phút) · Sản phẩm: 425
              </p>
            </div>
          </div>
          <div className="pd-store-actions">
            <button type="button" className="pd-btn-outline pd-btn-sm">
              Chat ngay
            </button>
            <button type="button" className="pd-btn-outline pd-btn-sm">
              Xem cửa hàng
            </button>
          </div>
        </section>

        <section className="pd-desc-section" aria-labelledby="pd-desc-heading">
          <h2 id="pd-desc-heading" className="pd-section-title">
            Mô tả sản phẩm
          </h2>
          <p className="pd-desc-lead">
            {product.description ||
              'Sản phẩm được may tỉ mỉ với đường chỉ chắc chắn, form slim-fit tôn dáng. Chất liệu cotton cao cấp thấm hút, thoáng mát cho cả ngày dài.'}
          </p>
          <div className="pd-desc-grid">
            <div>
              <h3 className="pd-subheading">Thông số kỹ thuật</h3>
              <dl className="pd-spec-table">
                <div>
                  <dt>Chất liệu</dt>
                  <dd>Cotton combed</dd>
                </div>
                <div>
                  <dt>Form</dt>
                  <dd>Slim-fit</dd>
                </div>
                <div>
                  <dt>Cổ áo</dt>
                  <dd>Button-down</dd>
                </div>
                <div>
                  <dt>Xuất xứ</dt>
                  <dd>Việt Nam</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="pd-subheading">Hướng dẫn bảo quản</h3>
              <ul className="pd-care-list">
                <li>Giặt máy ở nhiệt độ thường, nên lộn trái sản phẩm.</li>
                <li>Không dùng thuốc tẩy mạnh.</li>
                <li>Phơi nơi thoáng mát, tránh ánh nắng trực tiếp lâu.</li>
                <li>Ủi ở nhiệt độ trung bình.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pd-related" aria-labelledby="pd-related-heading">
          <div className="section-header flex-between pd-related-head">
            <h2 id="pd-related-heading">Sản phẩm tương tự</h2>
            <Link to="/" className="view-all">
              Xem tất cả &gt;
            </Link>
          </div>
          <div className="pd-related-grid">
            {RELATED_PRODUCTS.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="pd-mini-card">
                <div className="pd-mini-img-wrap">
                  <img src={p.image} alt="" />
                </div>
                <div className="pd-mini-body">
                  <p className="pd-mini-title">{p.name}</p>
                  <p className="pd-mini-price">{p.price}</p>
                  <FaChevronRight className="pd-mini-chevron" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="pd-for-you" aria-labelledby="pd-foryou-heading">
          <div className="pd-for-you-inner">
            <div className="pd-for-you-top">
              <div>
                <h2 id="pd-foryou-heading" className="pd-for-you-title">
                  <FaBolt className="pd-for-you-bolt" aria-hidden />
                  Gợi ý riêng cho bạn
                </h2>
                <p className="pd-for-you-sub">Dựa trên phong cách và sở thích mua sắm của bạn.</p>
              </div>
              <span className="pd-for-you-badge">Cập nhật 1 phút trước</span>
            </div>
            <div className="pd-for-you-grid">
              {FOR_YOU.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className="pd-suggest-card">
                  <div className="pd-suggest-img-wrap">
                    <span className="pd-suggest-badge">{p.badge}</span>
                    <img src={p.image} alt="" />
                  </div>
                  <div className="pd-suggest-body">
                    <p className="pd-suggest-title">{p.name}</p>
                    <p className="pd-suggest-price">{p.price}</p>
                    <FaChevronRight className="pd-mini-chevron" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}