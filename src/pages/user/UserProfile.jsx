import React, { useState, useEffect } from "react";
import userService from "../../services/userService";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaSignOutAlt,
  FaUserCircle,
  FaMapPin,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { CategoryService } from "../../services/CategoryService";
import "../LandingPage/LangdingPage.css";
import "./UserProfile.css";

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

function PageHeader({ userProfile, dbCategories, onLogout }) {
  const navigate = useNavigate();

  const handleNavClick = (categoryId) => {
    navigate("/", { state: { category: categoryId } });
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
            {userProfile ? (
              <div className="user-profile-wrapper">
                <Link to="/user/UserProfile" className="user-info-link">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="user-avatar"
                    />
                  ) : (
                    <FaUserCircle className="user-avatar-placeholder" />
                  )}
                  <span className="user-name">
                    {userProfile.fullName ||
                      userProfile.FullName ||
                      userProfile.email ||
                      "Người dùng"}
                  </span>
                </Link>
                <button
                  type="button"
                  className="logout-btn-premium"
                  onClick={onLogout}
                  title="Đăng xuất"
                >
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

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" cy="21" r="1"></circle>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
export default function UserProfile() {
  const navigate = useNavigate();
  const [dbCategories, setDbCategories] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
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
    };
    loadUser();

    const fetchCategories = async () => {
      try {
        const res = await CategoryService.getAllCategories();
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setDbCategories(list);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    fullName: "Nguyễn Minh",
    birthDate: "01/01/1990",
    gender: "Nam",
    email: "nguyenminh@gmail.com",
    phone: "0123456789",
  });
  const [basicInfoTemp, setBasicInfoTemp] = useState({ ...basicInfo });
  const [basicInfoErrors, setBasicInfoErrors] = useState({});

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Nhà (Mặc định)",
      address: "K275/27 Trường Chinh, An Khê, Thanh Khê, Đà Nẵng",
    },
    {
      id: 2,
      type: "Công ty",
      address: "Số 45, Đặng Dung 11, Hoà Minh, Liên Chiểu, Đà Nẵng",
    },
  ]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: "", address: "" });
  const [addressErrors, setAddressErrors] = useState({});

  const [payments, setPayments] = useState([
    { id: 1, type: "VISA", number: "Visa****1234" },
    { id: 2, type: "MOMO", number: "Momo****1234" },
  ]);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: "", number: "" });
  const [paymentErrors, setPaymentErrors] = useState({});

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getUserProfile();
        if (profile) {
          setBasicInfo(profile.basicInfo || basicInfo);
          setBasicInfoTemp(profile.basicInfo || basicInfo);
          setAddresses(profile.addresses || addresses);
          setPayments(profile.payments || payments);
        }
        setError(null);
      } catch (err) {
        console.log("[v0] Profile load error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  // Validation Functions
  const validateBasicInfo = (data) => {
    const errors = {};

    if (!data.fullName || data.fullName.trim() === "") {
      errors.fullName = "Họ và tên không được để trống";
    } else if (data.fullName.trim().length < 3) {
      errors.fullName = "Họ và tên phải có ít nhất 3 ký tự";
    } else if (!/^[a-zA-ZÀ-ỿ\s]+$/.test(data.fullName)) {
      errors.fullName = "Họ và tên không được chứa số hoặc ký tự đặc biệt";
    }

    if (data.birthDate && data.birthDate.trim() !== "") {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(data.birthDate)) {
        errors.birthDate = "Định dạng ngày sinh: DD/MM/YYYY";
      }
    }

    if (!data.email || data.email.trim() === "") {
      errors.email = "Email không được để trống";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = "Email không hợp lệ";
      }
    }

    if (data.phone && data.phone.trim() !== "") {
      const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(data.phone)) {
        errors.phone = "Số điện thoại không hợp lệ";
      }
    }

    return errors;
  };

  const validateAddress = (data) => {
    const errors = {};
    if (!data.type || data.type.trim() === "") {
      errors.type = "Loại địa chỉ không được để trống";
    }
    if (!data.address || data.address.trim() === "") {
      errors.address = "Địa chỉ không được để trống";
    } else if (data.address.trim().length < 5) {
      errors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }
    return errors;
  };

  const validatePayment = (data) => {
    const errors = {};
    if (!data.type || data.type.trim() === "") {
      errors.type = "Phương thức thanh toán không được để trống";
    }
    if (!data.number || data.number.trim() === "") {
      errors.number = "Thông tin thanh toán không được để trống";
    }
    return errors;
  };

  // Handlers
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfoTemp({ ...basicInfoTemp, [name]: value });
    if (basicInfoErrors[name]) {
      setBasicInfoErrors({ ...basicInfoErrors, [name]: "" });
    }
  };

  const handleSaveBasicInfo = async () => {
    const errors = validateBasicInfo(basicInfoTemp);
    if (Object.keys(errors).length > 0) {
      setBasicInfoErrors(errors);
      return;
    }
    try {
      await userService.updateUserProfile(basicInfoTemp);
      setBasicInfo({ ...basicInfoTemp });
      setEditingBasicInfo(false);
      setBasicInfoErrors({});
      console.log("[v0] Basic info saved successfully");
    } catch (err) {
      console.error("[v0] Save basic info error:", err.message);
      setError(err.message);
    }
  };

  const handleCancelBasicInfo = () => {
    setEditingBasicInfo(false);
    setBasicInfoTemp({ ...basicInfo });
    setBasicInfoErrors({});
  };

  const handleAddAddress = async () => {
    const errors = validateAddress(newAddress);
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    try {
      const result = await userService.addAddress(newAddress);
      setAddresses([...addresses, result]);
      setNewAddress({ type: "", address: "" });
      setAddressErrors({});
      setShowAddAddressForm(false);
      console.log("[v0] Address added successfully");
    } catch (err) {
      console.error("[v0] Add address error:", err.message);
      setError(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userService.deleteAddress(id);
      setAddresses(addresses.filter((addr) => addr.id !== id));
      setAddressErrors({});
      console.log("[v0] Address deleted successfully");
    } catch (err) {
      console.error("[v0] Delete address error:", err.message);
      setError(err.message);
    }
  };

  const handleAddPayment = async () => {
    const errors = validatePayment(newPayment);
    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }
    try {
      const result = await userService.addPayment(newPayment);
      setPayments([...payments, result]);
      setNewPayment({ type: "", number: "" });
      setPaymentErrors({});
      setShowAddPaymentForm(false);
      console.log("[v0] Payment added successfully");
    } catch (err) {
      console.error("[v0] Add payment error:", err.message);
      setError(err.message);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await userService.deletePayment(id);
      setPayments(payments.filter((pay) => pay.id !== id));
      setPaymentErrors({});
      console.log("[v0] Payment deleted successfully");
    } catch (err) {
      console.error("[v0] Delete payment error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="profile-page">
      {error && <div className="error-box">Lỗi: {error}</div>}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải thông tin...</p>
        </div>
      )}
      {/* Header */}
      <PageHeader
        userProfile={userProfile}
        dbCategories={dbCategories}
        onLogout={handleLogout}
      />
      {/* Main Content */}
      <main className="main-content">
        <div className="profile-header">
          <h2>Hồ sơ cá nhân</h2>
          <a href="/user/UpdateProfile" className="profile-header-btn">
            Cập nhật thông tin
          </a>
        </div>

        <div className="profile-container">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="avatar-container">
              {/* Avatar placeholder - can be replaced with actual image */}
            </div>
            <h3 className="user-name">{basicInfo.fullName || "Nguyễn Minh"}</h3>
            <p className="join-date">Ngày tham gia: 01/01/2025</p>
          </aside>

          {/* Main Content Area */}
          <div className="profile-info">
            {/* Basic Info */}
            <section className="info-card">
              <div className="card-header">
                <h3 className="card-title">Thông tin cơ bản</h3>
                {!editingBasicInfo && (
                  <button
                    onClick={() => setEditingBasicInfo(true)}
                    className="update-btn"
                  >
                    Cập nhật
                  </button>
                )}
              </div>

              {editingBasicInfo ? (
                <div>
                  {Object.keys(basicInfoErrors).length > 0 && (
                    <div className="error-box">
                      {Object.entries(basicInfoErrors).map(
                        ([field, error]) =>
                          error && (
                            <div key={field} className="error-message">
                              {error}
                            </div>
                          ),
                      )}
                    </div>
                  )}
                  <div
                    className="form-group"
                    style={{ display: "grid", gap: "12px" }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Họ và Tên:
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={basicInfoTemp.fullName}
                        onChange={handleBasicInfoChange}
                        placeholder="Nhập họ tên"
                        className={
                          basicInfoErrors.fullName ? "input-error" : ""
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "14px",
                          color: "#1f2937",
                          borderColor: basicInfoErrors.fullName
                            ? "#dc2626"
                            : "#e5e7eb",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Email:
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={basicInfoTemp.email}
                        onChange={handleBasicInfoChange}
                        placeholder="Nhập email"
                        className={basicInfoErrors.email ? "input-error" : ""}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "14px",
                          color: "#1f2937",
                          borderColor: basicInfoErrors.email
                            ? "#dc2626"
                            : "#e5e7eb",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Số điện thoại:
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={basicInfoTemp.phone}
                        onChange={handleBasicInfoChange}
                        placeholder="Nhập số điện thoại"
                        className={basicInfoErrors.phone ? "input-error" : ""}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "14px",
                          color: "#1f2937",
                          borderColor: basicInfoErrors.phone
                            ? "#dc2626"
                            : "#e5e7eb",
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button onClick={handleSaveBasicInfo} className="save-btn">
                      Lưu
                    </button>
                    <button
                      onClick={handleCancelBasicInfo}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-list">
                  <div className="info-row">
                    <div className="info-item">
                      <label className="info-label">Họ và tên:</label>
                      <p className="info-value">{basicInfo.fullName}</p>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Ngày sinh:</label>
                      <p className="info-value">{basicInfo.birthDate}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Email:</label>
                    <p className="info-value">{basicInfo.email}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Số điện thoại:</label>
                    <p className="info-value">{basicInfo.phone}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Addresses */}
            <section className="info-card">
              <div className="card-header">
                <h3 className="card-title">Địa chỉ</h3>
              </div>
              <div className="item-list">
                {addresses.map((addr) => (
                  <div key={addr.id} className="address-item">
                    <div className="address-icon">
                      <FaMapPin />
                    </div>
                    <div className="address-content">
                      <p className="address-label">{addr.type}</p>
                      <p className="address-text">{addr.address}</p>
                    </div>
                    <div className="address-actions">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="delete-btn"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showAddAddressForm && (
                <div className="form-section">
                  {Object.keys(addressErrors).length > 0 && (
                    <div className="error-box">
                      {Object.values(addressErrors).map((err, i) => (
                        <div key={i} className="error-message">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="form-group">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Loại địa chỉ:
                    </label>
                    <input
                      type="text"
                      placeholder="Loại địa chỉ"
                      value={newAddress.type}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, type: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        marginBottom: "12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#1f2937",
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Địa chỉ chi tiết:
                    </label>
                    <input
                      type="text"
                      placeholder="Địa chỉ chi tiết"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        marginBottom: "12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#1f2937",
                      }}
                    />
                  </div>
                  <div className="form-buttons">
                    <button onClick={handleAddAddress} className="save-btn">
                      Thêm
                    </button>
                    <button
                      onClick={() => setShowAddAddressForm(false)}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowAddAddressForm(true)}
                className="add-method-btn"
              >
                + Thêm địa chỉ
              </button>
            </section>

            {/* Payment Methods */}
            <section className="info-card">
              <div className="card-header">
                <h3 className="card-title">Phương thức thanh toán</h3>
              </div>
              <div className="item-list">
                {payments.map((pay) => (
                  <div key={pay.id} className="payment-item">
                    <div
                      className="address-icon"
                      style={{ backgroundColor: "#f0f7ff", color: "#0066FF" }}
                    >
                      💳
                    </div>
                    <div className="payment-content">
                      <p className="payment-type">{pay.type}</p>
                      <p className="payment-number">{pay.number}</p>
                    </div>
                    <div className="payment-actions">
                      <button
                        onClick={() => handleDeletePayment(pay.id)}
                        className="delete-btn"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showAddPaymentForm && (
                <div className="form-section">
                  {Object.keys(paymentErrors).length > 0 && (
                    <div className="error-box">
                      {Object.values(paymentErrors).map((err, i) => (
                        <div key={i} className="error-message">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="form-group">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Phương thức thanh toán:
                    </label>
                    <select
                      value={newPayment.type}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, type: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        marginBottom: "12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#1f2937",
                      }}
                    >
                      <option value="">Chọn phương thức</option>
                      <option value="VISA">VISA</option>
                      <option value="MOMO">MOMO</option>
                      <option value="ZaloPay">ZaloPay</option>
                      <option value="Chuyển khoản">Chuyển khoản</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Số thẻ/Tài khoản:
                    </label>
                    <input
                      type="text"
                      placeholder="Số thẻ/Tài khoản"
                      value={newPayment.number}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, number: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        marginBottom: "12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#1f2937",
                      }}
                    />
                  </div>
                  <div className="form-buttons">
                    <button onClick={handleAddPayment} className="save-btn">
                      Thêm
                    </button>
                    <button
                      onClick={() => setShowAddPaymentForm(false)}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowAddPaymentForm(true)}
                className="add-method-btn"
              >
                + Thêm phương thức thanh toán
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
