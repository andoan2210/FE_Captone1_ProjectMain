// Cửa hàng
/**
 * File: QuanLyCuaHang.jsx
 * Mục đích: Trang (Page) tổng hợp của tính năng "Quản lý cửa hàng". 
 * Gọi duy nhất 1 lần API lấy thông tin cửa hàng hiện hành và truyền dữ liệu xuyên suốt (thông qua props)
 * xuống cho FormCuaHang và ThongTinHeThong để đảm bảo đồng nhất nội dung, tiết kiệm network.
 */
import React, { useEffect, useState } from 'react';
import TheThongKe from '@/components/Admin/TheThongKe';
import FormCuaHang from '@/components/Admin/FormCuaHang';
import ThongTinHeThong from '@/components/Admin/ThongTinHeThong';
import { CuahangService } from '@/services/CuahangService';

export default function QuanLyCuaHang() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu cửa hàng ngay khi vào trang
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const data = await CuahangService.getStoreInfo();
        setStoreInfo(data);
      } catch (error) {
        console.error("Lỗi lấy thông tin cửa hàng:", error);
        // Dữ liệu giả định (mock) nếu API chưa kết nối được
        setStoreInfo({
          storeId: 'STR-892415',
          name: 'TechStore Official',
          description: 'Chuyên cung cấp các sản phẩm công nghệ chính hãng với giá cả hợp lý nhất thị trường.',
          isActive: true,
          logoUrl: '',
          ownerName: 'Nguyễn Văn Admin',
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  // Update localized state when save succeeds so SystemInfo and others can react
  const handleStoreUpdate = (updatedData) => {
    setStoreInfo(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <TheThongKe isActive={storeInfo?.isActive} />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {loading ? (
          <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
          </div>
        ) : (
          <>
            <FormCuaHang initialData={storeInfo} onUpdateSuccess={handleStoreUpdate} />
            <ThongTinHeThong storeInfo={storeInfo} />
          </>
        )}
      </div>
    </div>
  );
}
