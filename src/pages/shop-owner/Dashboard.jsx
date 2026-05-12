import React, { useState, useEffect } from "react";
import {
    FiBox,
    FiShoppingCart,
    FiTag,
    FiBarChart2,
    FiRefreshCw,
    FiActivity,
    FiTrendingUp,
    FiSettings,
    FiArrowUpRight,
    FiBriefcase,
    FiMapPin,
    FiCalendar,
    FiMoreVertical,
    FiCheckCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { ShopCuahangService } from "@/services/ShopCuahangService";
import ShopOrderService from "@/services/ShopOrderService";
import { ShopProductService } from "@/services/ShopProductService";
import { ShopVoucherService } from "@/services/ShopVoucherService";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const [storeInfo, setStoreInfo] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        pendingOrders: 0,
        activeVouchers: 0,
        totalRevenue: 0,
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [activeVouchersList, setActiveVouchersList] = useState([]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            setLoading(true);

            // 1. Fetch Store Info
            try {
                const storeRes = await ShopCuahangService.getMyStore();
                const rawStore = storeRes?.data || storeRes || {};
                setStoreInfo({
                    name: rawStore.storeName || rawStore.name || "Cửa hàng của tôi",
                    storeId: rawStore.storeId,
                    isActive: rawStore.isActive,
                    createdAt: rawStore.createdAt,
                    description: rawStore.description,
                    location: rawStore.address || rawStore.location || "Chưa cập nhật địa chỉ",
                });
            } catch (err) {
                console.error("Lỗi khi lấy thông tin store:", err);
            }

            // 2. Fetch Orders & Calculate Revenue/Pending
            try {
                const allOrdersRes = await ShopOrderService.getOrders({ limit: 1000 });
                const allOrders = allOrdersRes?.data || [];

                // pendingOrders should be orders with status "Chờ xử lý" (which is type 'pending' in our service)
                const pendingCount = allOrders.filter(
                    (o) => o.type === "pending" || o.status === "Chờ xử lý"
                ).length;

                const revenue = allOrders.reduce((acc, curr) => {
                    // status is "Hoàn thành" or payment is "Đã thanh toán"
                    if (
                        (curr.status === "Hoàn thành" || curr.payment === "Đã thanh toán") &&
                        curr.amount
                    ) {
                        const val = parseInt(curr.amount.replace(/[^0-9]/g, "")) || 0;
                        return acc + val;
                    }
                    return acc;
                }, 0);

                setStats(prev => ({
                    ...prev,
                    pendingOrders: pendingCount,
                    totalRevenue: revenue,
                }));
                setRecentOrders(allOrders.slice(0, 5));
            } catch (err) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", err);
            }

            // 3. Fetch Products Analytics (Top 5 Best Sellers)
            try {
                // Fetch total products count
                const productsRes = await ShopProductService.getMyProducts(1, 1);
                const totalProds = productsRes?.pagination?.total || productsRes?.total || (Array.isArray(productsRes?.data) ? productsRes.data.length : 0);

                setStats(prev => ({
                    ...prev,
                    totalProducts: totalProds
                }));

                // Fetch real Top 5 Best Sellers from BE
                const topProductsRes = await ShopProductService.getBestSellers(5);
                const rawTopProducts = topProductsRes?.data || [];

                const mappedProducts = rawTopProducts.map((p) => ({
                    id: p.productId,
                    name: p.productName,
                    image: p.thumbnailUrl || "",
                    sold: p.sold,
                    revenue: p.revenue,
                    trend: p.sold > 10 ? "Thịnh hành" : (p.sold > 0 ? "Bán chạy" : "Mới")
                }));
                setTopProducts(mappedProducts);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách sản phẩm bán chạy:", err);
            }

            // 4. Fetch Vouchers (Try-catch riêng để không crash dashboard nếu API voucher lỗi 500)
            try {
                const vouchersRes = await ShopVoucherService.getAllVouchers({ page: 1, limit: 100 });
                const voucherData = vouchersRes?.data || vouchersRes || {};
                let rawVouchers = voucherData.items || (Array.isArray(voucherData) ? voucherData : []);
                const activeV = rawVouchers.filter((v) => v.isActive !== false);

                setStats(prev => ({
                    ...prev,
                    activeVouchers: activeV.length
                }));
                setActiveVouchersList(activeV.slice(0, 3));
            } catch (err) {
                console.warn("Lỗi khi lấy danh sách voucher (Có thể shop chưa có voucher):", err);
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatVND = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "15/01/2023";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("vi-VN");
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center h-[70vh]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-slate-400 font-medium animate-pulse text-sm">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-16 text-left animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Tổng quan Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                        Cập nhật lúc: {lastUpdate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}, {lastUpdate.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-blue-50/50 text-blue-600 border border-blue-100/50 rounded-2xl text-xs font-bold ring-4 ring-blue-50/20">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Hệ thống: Ổn định
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="group flex items-center gap-2.5 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-bold shadow-sm active:scale-95"
                    >
                        <FiRefreshCw className={`text-slate-400 group-hover:text-blue-500 transition-colors ${refreshing ? "animate-spin" : ""}`} />
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                            <FiBox className="text-2xl" />
                        </div>
                        <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 ring-1 ring-blue-100">
                            Tất cả sản phẩm
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Tổng sản phẩm</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">
                        {stats.totalProducts?.toLocaleString("vi-VN")}
                    </h3>
                </div>

                <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                            <FiShoppingCart className="text-2xl" />
                        </div>
                        <div className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 ring-1 ring-rose-100 animate-bounce">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Cần xử lý ngay
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Đơn hàng (Chờ xử lý)</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">
                        {stats.pendingOrders}
                    </h3>
                </div>

                <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                            <FiTag className="text-2xl" />
                        </div>
                        <div className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 ring-1 ring-amber-100">
                            Đang áp dụng
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Voucher đang chạy</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">
                        {stats.activeVouchers}
                    </h3>
                </div>

                <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                            <FiBarChart2 className="text-2xl" />
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 ring-1 ring-emerald-100">
                            <FiCheckCircle size={12} /> Đã thanh toán
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Doanh thu tổng</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">
                        {formatVND(stats.totalRevenue)}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Top 5 Sản phẩm bán chạy</h2>
                                <p className="text-sm text-slate-400 mt-1 font-medium">Xếp hạng theo doanh thu tháng hiện tại</p>
                            </div>
                            <Link to="/shop-owner/products" className="text-xs font-black text-blue-600 uppercase tracking-wider">
                                Xem báo cáo chi tiết
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-4 py-4 pb-6">Tên sản phẩm</th>
                                        <th className="px-4 py-4 pb-6 text-center">Đã bán</th>
                                        <th className="px-4 py-4 pb-6 text-right">Doanh thu</th>
                                        <th className="px-4 py-4 pb-6 text-right">Xu hướng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {topProducts.map((p) => (
                                        <tr key={p.id} className="group hover:bg-slate-50/50">
                                            <td className="px-4 py-5 group-hover:text-blue-600 transition-colors">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <FiBox size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-700 leading-tight">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-center font-bold text-slate-500">{p.sold}</td>
                                            <td className="px-4 py-5 text-right font-black text-slate-900">{formatVND(p.revenue)}</td>
                                            <td className="px-4 py-5 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {p.trend}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Đơn hàng mới nhất</h2>
                                <p className="text-sm text-slate-400 mt-1 font-medium">Cập nhật trạng thái và xử lý nhanh đơn hàng</p>
                            </div>
                            <Link to="/shop-owner/orders" className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-black">
                                Xem tất cả
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-4 py-4 pb-6">Mã đơn</th>
                                        <th className="px-4 py-4 pb-6">Khách hàng</th>
                                        <th className="px-4 py-4 pb-6 text-right">Giá trị</th>
                                        <th className="px-4 py-4 pb-6 text-center">Trạng thái</th>
                                        <th className="px-4 py-4 pb-6 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.map((o, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50">
                                            <td className="px-4 py-5 font-mono text-[10px] font-black text-slate-400 uppercase">{o.id}</td>
                                            <td className="px-4 py-5">
                                                <p className="font-bold text-slate-800">{o.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{o.date}</p>
                                            </td>
                                            <td className="px-4 py-5 text-right font-black text-slate-900">{o.amount}</td>
                                            <td className="px-4 py-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black
                          ${o.status === "Hoàn thành" ? 'bg-emerald-50 text-emerald-600' :
                                                        o.status === "Chờ xử lý" ? 'bg-blue-50 text-blue-600' :
                                                            o.status === "Đã hủy" ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button className="text-slate-300 hover:text-blue-500"><FiArrowUpRight size={16} /></button>
                                                    <button className="text-slate-300 hover:text-blue-500"><FiSettings size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h2 className="text-xl font-black text-slate-800 mb-1">Thông tin cửa hàng</h2>
                        <p className="text-sm text-slate-400 mb-8 font-medium">Trạng thái vận hành hệ thống</p>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 mb-8 relative z-10 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-900/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-200">
                                    <FiBriefcase className="text-3xl" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight text-lg leading-tight uppercase">{storeInfo?.name}</h3>
                                    <div className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full mt-2 inline-flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Đang hoạt động
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-5 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <FiCalendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ngày tham gia</p>
                                        <p className="text-sm font-bold text-slate-800">{formatDate(storeInfo?.createdAt)}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="flex flex-col gap-3 relative z-10">
                            <Link to="/shop-owner/store" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex justify-center items-center gap-2.5 transition-all shadow-lg shadow-blue-200">
                                <FiSettings /> Cài đặt cửa hàng
                            </Link>
                            <Link to={`/shop/${storeInfo?.storeId}`} className="w-full py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-black flex justify-center items-center transition-all shadow-sm">
                                Xem trang bán lẻ
                            </Link>
                        </div>
                    </section>

                    <section className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Voucher hiện hành</h2>
                                <p className="text-sm text-slate-400 mt-1 font-medium">Theo dõi hiệu quả mã giảm giá</p>
                            </div>
                            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-xl">
                                <FiMoreVertical />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {activeVouchersList.map((v, idx) => (
                                <div key={idx} className="border border-blue-50 bg-blue-50/10 rounded-3xl p-5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-blue-700 text-lg tracking-tight uppercase">{v.code || v.voucherCode}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                                                Hết hạn: {new Date(v.expiredDate).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <span className="bg-white border border-blue-100 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                                            -{v.discount || (v.discountValue ? formatVND(v.discountValue) : "0")}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">Sử dụng</span>
                                            <span className="text-slate-600">{v.usedCount || 0}/{v.quantity || 100}</span>
                                        </div>
                                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(v.usedCount || 0) / (v.quantity || 100) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/shop-owner/vouchers" className="mt-8 w-full py-4 border border-slate-100 bg-white text-slate-700 rounded-[1.5rem] text-xs font-black flex justify-center items-center gap-2.5 transition-all shadow-sm">
                            <FiBriefcase size={16} className="text-blue-600" /> Quản lý Voucher
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}
