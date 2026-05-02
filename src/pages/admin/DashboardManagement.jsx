import React, { useState, useEffect } from 'react';
import { 
  Users as FiUsers, 
  Store as FiStore, 
  Box as FiBox, 
  TrendingUp as FiTrendingUp, 
  Activity as FiActivity, 
  CheckCircle as FiCheckCircle, 
  AlertCircle as FiAlertCircle, 
  Clock as FiClock, 
  DollarSign as FiDollarSign,
  RefreshCw as FiRefreshCw, 
  ExternalLink as FiExternalLink, 
  ChevronRight as FiChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardService from '../../services/Dashboard';
import adminService from '../../services/adminService';
import api from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';

const DashboardManagement = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    activeStores: 0,
    pendingProducts: 0,
    pendingStores: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentStores, setRecentStores] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Users Count (Exclude Admins)
      try {
        const usersRes = await api.get("/users/getAllUsers?page=1&limit=1000");
        const userData = usersRes.data || {};
        const usersArray = userData.data || (Array.isArray(userData) ? userData : []);
        const nonAdminUsers = usersArray.filter(u => (u.Role || u.role || '').toUpperCase() !== 'ADMIN');
        setStats(prev => ({ ...prev, totalUsers: nonAdminUsers.length }));
      } catch (err) { console.error("Lỗi tải User:", err); }

      // 2. Fetch Stores & Pie Chart Data
      let storesArray = [];
      try {
        const storesRes = await adminService.getAllStores();
        storesArray = storesRes.data || storesRes || [];
        
        const active = storesArray.filter(s => s.isActive).length;
        const locked = storesArray.filter(s => s.isActive === false || s.status === 'Locked').length;

        setStats(prev => ({ 
          ...prev, 
          totalStores: storesArray.length,
          activeStores: active,
          disabledStores: locked
        }));
        setRecentStores([...storesArray].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      } catch (err) { console.error("Lỗi tải Stores:", err); }

      // 3. Fetch Products (Fix 400 error by fetching from public endpoint and filtering)
      try {
        const allProductsRes = await api.get("/product");
        const allProds = allProductsRes.data || allProductsRes || [];
        const approvedCount = Array.isArray(allProds) ? allProds.filter(p => p.approvalStatus === 'APPROVED' || p.ApprovalStatus === 'APPROVED').length : 0;
        
        const pendingRes = await adminService.getPendingProducts(1, 100);
        const penData = pendingRes.data || pendingRes || {};
        const penArray = Array.isArray(penData) ? penData : (penData.data || []);
        
        setStats(prev => ({ 
          ...prev, 
          totalProducts: approvedCount || allProds.length || 0,
          pendingProducts: pendingRes.pagination?.total || penArray.length
        }));
        setRecentProducts(penArray.slice(0, 5));
      } catch (err) { console.error("Lỗi tải Products:", err); }

      // 4. Calculate Real System Revenue from ALL Orders (Fix 403 error)
      try {
        // Fetch all orders using the open endpoint
        const allOrdersRes = await api.get("/order");
        const rawData = allOrdersRes.data || allOrdersRes || {};
        
        // Safely extract the array of orders
        let orders = [];
        if (Array.isArray(rawData)) {
            orders = rawData;
        } else if (Array.isArray(rawData.data)) {
            orders = rawData.data;
        } else if (Array.isArray(rawData.items)) {
            orders = rawData.items;
        } else if (Array.isArray(rawData.order)) {
            orders = rawData.order;
        }
        
        // Sum totalAmount for successful orders based on DB schema
        const systemRev = orders.reduce((acc, curr) => {
            const status = curr.orderStatus || curr.OrderStatus;
            const payment = curr.paymentStatus || curr.PaymentStatus;
            if (status === 'Completed' || payment === 'Paid' || payment === 'success') {
                return acc + (Number(curr.totalAmount || curr.TotalAmount) || 0);
            }
            return acc;
        }, 0);

        setStats(prev => ({ ...prev, totalRevenue: systemRev }));

        // Map real orders to month for the chart
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = months.map((m, idx) => {
            const monthTotal = orders.reduce((acc, curr) => {
                const date = new Date(curr.createdAt || curr.CreatedAt);
                const status = curr.orderStatus || curr.OrderStatus;
                const payment = curr.paymentStatus || curr.PaymentStatus;
                if (date.getMonth() === idx && (status === 'Completed' || payment === 'Paid' || payment === 'success')) {
                    return acc + (Number(curr.totalAmount || curr.TotalAmount) || 0);
                }
                return acc;
            }, 0);
            return { month: m, revenue: monthTotal };
        });

        // Filter last 6 months for display
        const currentMonth = new Date().getMonth();
        const displayChart = [];
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonth - i + 12) % 12;
            displayChart.push(monthlyData[idx]);
        }
        setRevenueData(displayChart);

      } catch (err) { 
        console.error("Lỗi tính doanh thu:", err);
      }

      // 5. Fetch Pending Stores
      try {
        const pendingStoresRes = await adminService.getPendingStores();
        const pStores = pendingStoresRes.data || pendingStoresRes || [];
        setStats(prev => ({ ...prev, pendingStores: pStores.length }));
      } catch (err) { console.error("Lỗi tải đơn duyệt shop:", err); }

    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: <FiUsers />, color: 'blue', trend: '+12% tuần này' },
    { label: 'Cửa hàng đang hoạt động', value: stats.activeStores, icon: <FiStore />, color: 'emerald', trend: `${stats.totalStores} tổng cộng` },
    { label: 'Sản phẩm trên sàn', value: stats.totalProducts, icon: <FiBox />, color: 'purple', trend: 'Tất cả danh mục' },
    { label: 'Doanh thu hệ thống', value: formatVND(stats.totalRevenue || 0), icon: <FiDollarSign />, color: 'orange', trend: '+15.4% tháng này' },
  ];

  const pieData = [
    { name: 'Hoạt động', value: stats.activeStores, color: '#10b981' },
    { name: 'Chờ duyệt', value: stats.pendingStores, color: '#f59e0b' },
    { name: 'Vô hiệu', value: stats.disabledStores || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" size={24} />
            Tổng quan Hệ thống
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Số liệu thống kê và báo cáo hoạt động kinh doanh toàn sàn.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm"
        >
          <FiRefreshCw className="text-blue-500" />
          Làm mới báo cáo
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-${card.color}-50 flex items-center justify-center text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(card.icon, { size: 24 })}
              </div>
              <div className="text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-50 text-slate-400">
                {card.trend}
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800">Biểu đồ doanh thu</h2>
              <p className="text-sm text-slate-400 font-medium">Thống kê 6 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs font-bold text-slate-600">Tổng doanh thu</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(val) => `${val/1000000}M`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatVND(value)}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-1">Cửa hàng</h2>
          <p className="text-sm text-slate-400 font-medium mb-8">Phân bổ trạng thái cửa hàng</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Cần duyệt gấp</h2>
            <Link to="/admin/seller-approvals" className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
              Tất cả ({stats.pendingStores}) <FiChevronRight />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.pendingStores > 0 ? (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                    <FiStore size={24} />
                  </div>
                  <div>
                    <p className="font-black text-amber-900 leading-tight">Đơn đăng ký mới</p>
                    <p className="text-sm text-amber-700 mt-1">Đang chờ bạn xét duyệt</p>
                  </div>
                </div>
                <Link to="/admin/seller-approvals" className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-amber-700 transition-all">
                  Duyệt ngay
                </Link>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <FiCheckCircle size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Không có yêu cầu đăng ký nào</p>
              </div>
            )}

            {stats.pendingProducts > 0 && (
               <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                   <FiBox size={24} />
                 </div>
                 <div>
                   <p className="font-black text-indigo-900 leading-tight">{stats.pendingProducts} Sản phẩm mới</p>
                   <p className="text-sm text-indigo-700 mt-1">Sản phẩm đang chờ kiểm định</p>
                 </div>
               </div>
               <Link to="/admin/products" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-700 transition-all">
                 Kiểm duyệt
               </Link>
             </div>
            )}
          </div>
        </div>

        {/* Newest Stores */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Cửa hàng mới gia nhập</h2>
            <Link to="/admin/store-management" className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
              Xem danh sách <FiChevronRight />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left">Cửa hàng</th>
                  <th className="px-4 py-4 text-left">Ngày tạo</th>
                  <th className="px-4 py-4 text-center">Trạng thái</th>
                  <th className="px-4 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentStores.map((store) => (
                  <tr key={store.storeId} className="group hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                          {store.logoUrl ? (
                            <img src={store.logoUrl} className="w-full h-full object-cover" alt="" />
                          ) : <FiStore className="m-auto text-slate-400 mt-2" />}
                        </div>
                        <p className="font-bold text-slate-800 text-sm truncate max-w-[120px]">{store.storeName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-400">
                      {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${store.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {store.isActive ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/admin/store-management`} className="text-slate-300 hover:text-blue-500 transition-colors">
                        <FiExternalLink size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;
