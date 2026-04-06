import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  FaSignOutAlt,
  FaCheck,
} from 'react-icons/fa'
import userService from '../../services/userService'
import { jwtDecode } from 'jwt-decode'
import { ProductService } from '../../services/ProductService'
import { CategoryService } from '../../services/CategoryService'
import { CuahangService } from '../../services/CuahangService'
import chatService from '../../services/chatService'
import { useSocket } from '../../hooks/useSocket'
import '../LandingPage/LangdingPage.css'
import './ProductDetailPage.css'

// Reuse user label logic
function PageHeader({ userProfile, dbCategories, onLogout }) {
  const navigate = useNavigate()
  const handleNavClick = (categoryId) => {
    navigate('/', { state: { category: categoryId } })
  }

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
            {userProfile ? (
              <div className="user-profile-wrapper">
                <Link to="/user/UserProfile" className="user-info-link">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="Avatar" className="user-avatar" />
                  ) : (
                    <FaUserCircle className="user-avatar-placeholder" />
                  )}
                  <span className="user-name">
                    {userProfile.fullName || userProfile.FullName || userProfile.email || 'Người dùng'}
                  </span>
                </Link>
                <button type="button" className="logout-btn-premium" onClick={onLogout} title="Đăng xuất">
                  <FaSignOutAlt />
                  <span>Rời đi</span>
                </button>
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
          <span onClick={() => handleNavClick('all')} style={{ cursor: 'pointer' }}>
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories &&
            dbCategories.map((cat) => (
              <span key={cat.id} onClick={() => handleNavClick(cat.id)} style={{ cursor: 'pointer' }}>
                {cat.name}
              </span>
            ))}
          <span className="text-red">BST Thu Đông</span>
          <span className="text-red">Đồ hiệu sale</span>
          <span className="flash-sale">⚡ Flash Sale</span>
        </div>
      </nav>
    </>
  )
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
        <div className="container">© {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.</div>
      </div>
    </footer>
  )
}

export default function ProductDetail() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState(null);

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Biến thể (Variants)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const [dbCategories, setDbCategories] = useState([])
  const [wishlisted, setWishlisted] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [storeInfo, setStoreInfo] = useState(null)
  const [loadingStore, setLoadingStore] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const getUserDisplayNameFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.email || decoded.name || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserProfile(null);
      } else {
        try {
          const profile = await userService.getUserProfile();
          setUserProfile(profile);
        } catch (err) {
          console.error("Lỗi khi tải profile:", err);
          const displayName = getUserDisplayNameFromToken();
          if (displayName) {
            setUserProfile({ fullName: displayName });
          }
        }
      }
    }
    loadUser();

    async function fetchCats() {
      try {
        // Bypass cache bằng cách không truyền limit mặc định hoặc truyền limit cao
        const res = await CategoryService.getAllCategories()
        const categories = Array.isArray(res.data) ? res.data : []
        setDbCategories(categories)
      } catch (err) {
        console.error('Lỗi tải danh mục:', err)
      }
    }
    fetchCats()
  }, [])

  // Tải chi tiết sản phẩm
  useEffect(() => {
    async function loadProductDetail() {
      if (!idParam) return
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const data = await ProductService.getProductById(idParam)

        if (data) {
          setProduct(data)
          // Mặc định chọn ảnh thu nhỏ hoặc ảnh đầu tiên
          const thumbnail = data.thumbnail || data.image || (data.images && data.images[0]) || '';
          setSelectedImage(thumbnail)

          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0]
            setSelectedSize(firstVariant.size)
            setSelectedColor(firstVariant.color || '')
          }
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Lỗi tải sp:', err)
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }
    loadProductDetail()
  }, [idParam])

  // Tải thông tin cửa hàng
  useEffect(() => {
    async function loadStoreInfo() {
      if (!idParam) return
      setLoadingStore(true)
      try {
        const res = await CuahangService.getStoreByProduct(idParam)
        if (res) {
          setStoreInfo(res)
        }
      } catch (err) {
        console.error('Lỗi tải thông tin shop:', err)
      } finally {
        setLoadingStore(false)
      }
    }
    loadStoreInfo()
  }, [idParam])

  // --- LOGIC XỬ LÝ BIẾN THỂ ---
  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null
    return (
      product.variants.find(
        (v) => v.size === selectedSize && (v.color === selectedColor || (!v.color && !selectedColor))
      ) ||
      product.variants.find((v) => v.size === selectedSize) ||
      product.variants[0]
    )
  }, [product, selectedSize, selectedColor])

  const uniqueSizes = useMemo(() => {
    if (!product || !product.variants) return []
    return [...new Set(product.variants.map((v) => v.size))]
  }, [product])

  const colorsForSelectedSize = useMemo(() => {
    if (!product || !product.variants || !selectedSize) return []
    const colors = product.variants.filter((v) => v.size === selectedSize && v.color).map((v) => v.color)
    return [...new Set(colors)]
  }, [product, selectedSize])

  const displayPrice = currentVariant ? currentVariant.price : product ? product.price : 0
  const stockAvailable = currentVariant ? currentVariant.stock : 0

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
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const handleAddToCart = async () => {
    if (!currentVariant) return
    try {
      // Logic thêm vào giỏ hàng với variantId
      console.log('Thêm vào giỏ:', currentVariant.variantId, 'Số lượng:', quantity)
      showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success')
      // navigate('/cart') // Bỏ navigate để user ở lại trang và thấy toast
    } catch (err) {
      showToast('Có lỗi xảy ra, vui lòng thử lại.', 'error')
    }
  }

  const handleBuyNow = () => {
    if (!currentVariant) return
    navigate('/cart')
  }

  // ── Xử lý Chat ngay ──
  const { joinConversation } = useSocket()

  const handleChatNow = async () => {
    if (isChatLoading) return

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('Vui lòng đăng nhập để chat với cửa hàng!', 'error')
      setTimeout(() => navigate('/login'), 1500)
      return
    }

    // Cần có storeId từ storeInfo
    if (!storeInfo?.storeId) {
      showToast('Không tìm thấy thông tin cửa hàng!', 'error')
      return
    }

    try {
      setIsChatLoading(true)

      // 1. Gọi API tạo hoặc lấy lại cuộc hội thoại với shop (truyền storeId)
      const result = await chatService.startChat(storeInfo.storeId)
      const conversationId = result?.ConversationId

      if (!conversationId) {
        throw new Error('Không nhận được conversationId từ server')
      }

      // 2. Join socket room ngay để sẵn sàng nhận tin nhắn realtime
      joinConversation(conversationId)

      // 3. Chuyển đến trang chat với conversationId đã mở sẵn
      navigate('/chat', { state: { conversationId } })
    } catch (err) {
      console.error('[Chat] Lỗi bắt đầu chat:', err)
      if (err?.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!', 'error')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        showToast('Không thể kết nối với cửa hàng. Vui lòng thử lại!', 'error')
      }
    } finally {
      setIsChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    )
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
    )
  }

  return (
    <div className="pd-page-wrapper">
      <PageHeader userProfile={userProfile} dbCategories={dbCategories} onLogout={handleLogout} />

      <main className="pd-main-content">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="pd-sep">/</span>
            <Link to="#">{product.categoryName || 'Sản phẩm'}</Link>
            <span className="pd-sep">/</span>
            <span className="pd-current">{product.name}</span>
          </nav>

          <div className="pd-product-grid">
            {/* Gallery */}
            <div className="pd-gallery-section">
              <div className="pd-main-image-wrap">
                <img src={selectedImage} alt={product.name} className="pd-main-image" />
                
                {allImages.length > 1 && (
                  <>
                    <button className="pd-nav-btn pd-nav-prev" onClick={handlePrevImage} aria-label="Ảnh trước">
                      <FaChevronLeft />
                    </button>
                    <button className="pd-nav-btn pd-nav-next" onClick={handleNextImage} aria-label="Ảnh tiếp">
                      <FaChevronRight />
                    </button>
                  </>
                )}

                <button
                  className={`pd-wishlist-btn ${wishlisted ? 'active' : ''}`}
                  onClick={() => setWishlisted(!wishlisted)}
                  aria-label="Thêm vào yêu thích"
                >
                  <FaHeart />
                </button>
              </div>
              {product.images && product.images.length > 0 && (
                <div className="pd-thumbnail-grid">
                  {[product.thumbnail, ...product.images].filter(Boolean).map((img, idx) => (
                    <div
                      key={idx}
                      className={`pd-thumb-item ${selectedImage === img ? 'active' : ''}`}
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
                <span className="pd-category-link">{product.categoryName}</span>
              </div>

              <h1 className="pd-title">{product.name}</h1>

              <div className="pd-meta-row" style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>
                Lượt bán: <strong style={{ color: '#1f2937', marginLeft: '4px' }}>{product.sold || 0}</strong>
              </div>

              <div className="pd-price-card">
                <div className="pd-price-row">
                  <span className="pd-current-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice)}
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
                        className={`pd-size-chip ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedSize(size)
                          // Chọn màu đầu tiên khả dụng của size này
                          const firstColor = product.variants.find((v) => v.size === size)?.color
                          if (firstColor) setSelectedColor(firstColor)
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
                          className={`pd-color-chip ${selectedColor === color ? 'active' : ''}`}
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
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button onClick={() => setQuantity(quantity + 1)}>+</button>
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

              <button className="pd-magic-fit-btn">
                <span className="sparkle-icon" style={{ fontSize: '20px' }}>✨</span> Thử đồ ngay với AI Magic Fit
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

          {/* Store Section */}
          {storeInfo && (
            <div className="pd-store-card">
              <div className="pd-store-left">
                <div className="pd-store-avatar-wrap">
                  <img 
                    src={storeInfo.logoUrl || 'https://via.placeholder.com/80?text=Store'} 
                    alt={storeInfo.storeName} 
                    className="pd-store-avatar"
                  />
                  <div className="pd-store-badge-fav">YÊU THÍCH +</div>
                </div>
                <div className="pd-store-main-info">
                  <h3 className="pd-store-name">{storeInfo.storeName || 'SmartAI Fashion Flagship Store'}</h3>
                  <div className="pd-store-stats-row">
                    <span className="pd-store-stat">Phản hồi: <span className="text-blue">99% (trong vài phút)</span></span>
                    <span className="pd-store-sep">|</span>
                    <span className="pd-store-stat">Sản phẩm: <span className="text-blue">{storeInfo.productCount || 0}</span></span>
                  </div>
                </div>
              </div>
              <div className="pd-store-actions">
                <button 
                  className={`pd-store-btn pd-store-btn-chat ${isChatLoading ? 'loading' : ''}`}
                  onClick={handleChatNow}
                  disabled={isChatLoading}
                >
                  {isChatLoading ? (
                    <>
                      <span className="pd-chat-spinner" />
                      Đang kết nối...
                    </>
                  ) : (
                    'Chat ngay'
                  )}
                </button>
                <Link to={`/store/${storeInfo.storeId}`} className="pd-store-btn pd-store-btn-view">
                  Xem cửa hàng
                </Link>
              </div>
            </div>
          )}

          {/* Description */}
          <section className="pd-description-section">
            <h2 className="pd-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaStar style={{ color: '#0ea5e9', fontSize: '20px' }} />
              Chi tiết sản phẩm
            </h2>
            <div className="pd-description-content" style={{ background: '#f8fafc', padding: '32px', borderRadius: '20px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', minHeight: '150px' }}>
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`pd-toast ${toast.type}`}>
          <div className="pd-toast-content">
            {toast.type === 'success' ? <FaCheck className="pd-toast-icon" /> : <FaUndo className="pd-toast-icon" />}
            <span>{toast.message}</span>
          </div>
          <div className="pd-toast-progress"></div>
        </div>
      )}
    </div>
  )
}