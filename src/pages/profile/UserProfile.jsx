import React, { useState } from 'react';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" cy="21" r="1"></circle>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
export default function UserProfile() {
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    fullName: 'Nguyễn Minh',
    birthDate: '01/01/1990',
    gender: 'Nam',
    email: 'nguyenminh@gmail.com',
    phone: '0123456789'
  });
  const [basicInfoTemp, setBasicInfoTemp] = useState({ ...basicInfo });
  const [basicInfoErrors, setBasicInfoErrors] = useState({});

  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Nhà (Mặc định)', address: 'K275/27 Trường Chinh, An Khê, Thanh Khê, Đà Nẵng' },
    { id: 2, type: 'Công ty', address: 'Số 45, Đặng Dung 11, Hoà Minh, Liên Chiểu, Đà Nẵng' }
  ]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: '', address: '' });
  const [addressErrors, setAddressErrors] = useState({});

  const [payments, setPayments] = useState([
    { id: 1, type: 'VISA', number: 'Visa****1234' },
    { id: 2, type: 'MOMO', number: 'Momo****1234' }
  ]);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: '', number: '' });
  const [paymentErrors, setPaymentErrors] = useState({});

  // Validation Functions
  const validateBasicInfo = (data) => {
    const errors = {};
    
    if (!data.fullName || data.fullName.trim() === '') {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (data.fullName.trim().length < 3) {
      errors.fullName = 'Họ và tên phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-ZÀ-ỿ\s]+$/.test(data.fullName)) {
      errors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt';
    }

    if (data.birthDate && data.birthDate.trim() !== '') {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(data.birthDate)) {
        errors.birthDate = 'Định dạng ngày sinh: DD/MM/YYYY';
      }
    }

    if (!data.email || data.email.trim() === '') {
      errors.email = 'Email không được để trống';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Email không hợp lệ';
      }
    }

    if (data.phone && data.phone.trim() !== '') {
      const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(data.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    return errors;
  };

  const validateAddress = (data) => {
    const errors = {};
    if (!data.type || data.type.trim() === '') {
      errors.type = 'Loại địa chỉ không được để trống';
    }
    if (!data.address || data.address.trim() === '') {
      errors.address = 'Địa chỉ không được để trống';
    } else if (data.address.trim().length < 5) {
      errors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
    }
    return errors;
  };

  const validatePayment = (data) => {
    const errors = {};
    if (!data.type || data.type.trim() === '') {
      errors.type = 'Phương thức thanh toán không được để trống';
    }
    if (!data.number || data.number.trim() === '') {
      errors.number = 'Thông tin thanh toán không được để trống';
    }
    return errors;
  };

  // Handlers
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfoTemp({ ...basicInfoTemp, [name]: value });
    if (basicInfoErrors[name]) {
      setBasicInfoErrors({ ...basicInfoErrors, [name]: '' });
    }
  };

  const handleSaveBasicInfo = () => {
    const errors = validateBasicInfo(basicInfoTemp);
    if (Object.keys(errors).length > 0) {
      setBasicInfoErrors(errors);
      console.log("[v0] Basic info validation errors:", errors);
      return;
    }
    setBasicInfo({ ...basicInfoTemp });
    setEditingBasicInfo(false);
    setBasicInfoErrors({});
    console.log("[v0] Basic info saved successfully:", basicInfoTemp);
  };

  const handleCancelBasicInfo = () => {
    setEditingBasicInfo(false);
    setBasicInfoTemp({ ...basicInfo });
    setBasicInfoErrors({});
  };

  const handleAddAddress = () => {
    const errors = validateAddress(newAddress);
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    const address = {
      id: Date.now(),
      type: newAddress.type,
      address: newAddress.address
    };
    setAddresses([...addresses, address]);
    setNewAddress({ type: '', address: '' });
    setAddressErrors({});
    setShowAddAddressForm(false);
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    setAddressErrors({});
  };

  const handleAddPayment = () => {
    const errors = validatePayment(newPayment);
    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }
    const payment = {
      id: Date.now(),
      type: newPayment.type,
      number: newPayment.number
    };
    setPayments([...payments, payment]);
    setNewPayment({ type: '', number: '' });
    setPaymentErrors({});
    setShowAddPaymentForm(false);
  };

  const handleDeletePayment = (id) => {
    setPayments(payments.filter(pay => pay.id !== id));
    setPaymentErrors({});
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
     {/* Header */}
      <header className="header">
        <div className="header-top">
          <div className="header-left">
            <div className="logo">SmartAI Fashion</div>
          </div>
          <div className="search-bar">
            <SearchIcon />
            <input type="text" placeholder="Tìm kiếm sản phẩm, thương hiệu hoặc thời trang AI..." />
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Giỏ hàng">
              <ShoppingCartIcon />
            </button>
            <button className="icon-btn" title="Thông báo">
              <BellIcon />
            </button>
            <div className="user-menu">
              <img src="https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg" alt="Avatar" className="user-avatar-small" loading="eager" />
              <span>Nguyễn Minh</span>
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        <nav className="nav-menu">
          <button className="nav-btn">
            <MenuIcon />
            TẤT CẢ DANH MỤC
          </button>
          <a href="#" className="nav-link">Thời trang Nam</a>
          <a href="#" className="nav-link">Thời trang Nữ</a>
          <a href="#" className="nav-link">Giày dép</a>
          <a href="#" className="nav-link">Túi xách</a>
          <a href="#" className="nav-link">Phụ kiện</a>
          <a href="#" className="nav-link">Đồ thể thao</a>
          <a href="#" className="nav-link highlight-blue">BST Thu Đông</a>
          <a href="#" className="nav-link highlight-red">Đồ hiệu sale</a>
          <a href="#" className="nav-link highlight-orange">Flash Sale</a>
        </nav>
      </header>
      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Hồ sơ cá nhân</h2>
          <a 
            href="/profile/UpdateProfile"
            style={{ padding: '10px 20px', background: '#0891b2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textDecoration: 'none', display: 'inline-block' }}
          >
            Cập nhật thông tin
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* Sidebar */}
          <aside style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#ddd', margin: '0 auto 16px', border: '3px solid #0891b2' }}></div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>Nguyễn Minh</h3>
              <p style={{ fontSize: '13px', color: '#999' }}>Ngày tham gia: 01/01/2025</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <div>
            {/* Basic Info */}
            <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>Thông tin cơ bản</h3>
                {!editingBasicInfo && (
                  <button 
                    onClick={() => setEditingBasicInfo(true)}
                    style={{ padding: '6px 12px', backgroundColor: '#ecf8fb', border: '1px solid #0891b2', borderRadius: '4px', fontSize: '12px', color: '#0891b2', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Cập nhật
                  </button>
                )}
              </div>

              {editingBasicInfo ? (
                <div>
                  {Object.keys(basicInfoErrors).length > 0 && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                      {Object.entries(basicInfoErrors).map(([field, error]) => (
                        error && <div key={field} style={{ color: '#dc2626', fontSize: '13px', marginBottom: '6px' }}>{error}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Họ và Tên:</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={basicInfoTemp.fullName}
                        onChange={handleBasicInfoChange}
                        placeholder="Nhập họ tên"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', borderColor: basicInfoErrors.fullName ? '#dc2626' : '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Email:</label>
                      <input 
                        type="email" 
                        name="email"
                        value={basicInfoTemp.email}
                        onChange={handleBasicInfoChange}
                        placeholder="Nhập email"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', borderColor: basicInfoErrors.email ? '#dc2626' : '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Số điện thoại:</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={basicInfoTemp.phone}
                        onChange={handleBasicInfoChange}
                        placeholder="Nhập số điện thoại"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', borderColor: basicInfoErrors.phone ? '#dc2626' : '#e0e0e0' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={handleSaveBasicInfo}
                      style={{ padding: '8px 20px', backgroundColor: '#0891b2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                      Lưu
                    </button>
                    <button 
                      onClick={handleCancelBasicInfo}
                      style={{ padding: '8px 20px', backgroundColor: '#f3f4f6', color: '#333', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Họ và tên:</label>
                      <p style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{basicInfo.fullName}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Ngày sinh:</label>
                      <p style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{basicInfo.birthDate}</p>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Email:</label>
                    <p style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{basicInfo.email}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Số điện thoại:</label>
                    <p style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{basicInfo.phone}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Addresses */}
            <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Địa chỉ</h3>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '12px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    <MapPinIcon />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{addr.type}</p>
                      <p style={{ fontSize: '13px', color: '#666' }}>{addr.address}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              {showAddAddressForm && (
                <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', marginBottom: '12px' }}>
                  {Object.keys(addressErrors).length > 0 && (
                    <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
                      {Object.values(addressErrors).map((err, i) => (
                        <div key={i} style={{ color: '#dc2626', fontSize: '12px' }}>{err}</div>
                      ))}
                    </div>
                  )}
                  <input 
                    type="text"
                    placeholder="Loại địa chỉ"
                    value={newAddress.type}
                    onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '13px' }}
                  />
                  <input 
                    type="text"
                    placeholder="Địa chỉ chi tiết"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleAddAddress}
                      style={{ flex: 1, padding: '6px', backgroundColor: '#0891b2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Thêm
                    </button>
                    <button 
                      onClick={() => setShowAddAddressForm(false)}
                      style={{ flex: 1, padding: '6px', backgroundColor: '#f3f4f6', color: '#333', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setShowAddAddressForm(true)}
                style={{ width: '100%', padding: '10px', border: '2px dashed #0891b2', borderRadius: '6px', backgroundColor: 'white', color: '#0891b2', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                + Thêm địa chỉ
              </button>
            </section>

            {/* Payment Methods */}
            <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Phương thức thanh toán</h3>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '12px' }}>
                {payments.map(pay => (
                  <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{pay.type}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>{pay.number}</span>
                      <button 
                        onClick={() => handleDeletePayment(pay.id)}
                        style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showAddPaymentForm && (
                <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', marginBottom: '12px' }}>
                  {Object.keys(paymentErrors).length > 0 && (
                    <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
                      {Object.values(paymentErrors).map((err, i) => (
                        <div key={i} style={{ color: '#dc2626', fontSize: '12px' }}>{err}</div>
                      ))}
                    </div>
                  )}
                  <select 
                    value={newPayment.type}
                    onChange={(e) => setNewPayment({...newPayment, type: e.target.value})}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="VISA">VISA</option>
                    <option value="MOMO">MOMO</option>
                    <option value="ZaloPay">ZaloPay</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="Số thẻ/Tài khoản"
                    value={newPayment.number}
                    onChange={(e) => setNewPayment({...newPayment, number: e.target.value})}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleAddPayment}
                      style={{ flex: 1, padding: '6px', backgroundColor: '#0891b2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Thêm
                    </button>
                    <button 
                      onClick={() => setShowAddPaymentForm(false)}
                      style={{ flex: 1, padding: '6px', backgroundColor: '#f3f4f6', color: '#333', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setShowAddPaymentForm(true)}
                style={{ width: '100%', padding: '10px', border: '2px dashed #0891b2', borderRadius: '6px', backgroundColor: 'white', color: '#0891b2', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                + Thêm phương thức thanh toán
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#3488ffff', color: '#e5e7eb', padding: '40px 20px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ color: '#fbfbfbff', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>SmartAI Fashion</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>Nền tảng thương mại điện tử hàng đầu với công nghệ AI tiên tiến, giúp bạn tìm kiếm và mua sắm sản phẩm chất lượng cao.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              
            </div>
            <div className="social-icons">
              <a href="#" title="Facebook"><FacebookIcon /></a>
              <a href="#" title="Instagram"><InstagramIcon /></a>
              <a href="#" title="Twitter"><TwitterIcon /></a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Chính sách khách hàng</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Giới thiệu</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Thương hiệu hợp tác</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Blog</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Về SmartAI Fashion</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Điều khoản sử dụng</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Chính sách bảo mật</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Chính sách vận chuyển</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Chính sách đổi trả</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Thanh toán & lỗi chính sách</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Phương thức thanh toán</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Góp ý & khiếu nại</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Hỗ trợ khách hàng</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #4b5563', marginTop: '30px', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          <p>© 2025 SmartAI Fashion | Công ty Cổ phần Thương mại Điện tử SmartAI | Tất cả các quyền được bảo lưu</p>
        </div>
      </footer>
    </div>
  );
}
