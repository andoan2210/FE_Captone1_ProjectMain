// Cửa hàng
/**
 * File: CuaHang.jsx
 * Mục đích: Trang (Page) tổng hợp của tính năng "Quản lý cửa hàng". 
 * Gọi duy nhất 1 lần API lấy thông tin cửa hàng hiện hành và truyền dữ liệu xuyên suốt (thông qua props)
 * xuống cho FormCuaHang và ThongTinHeThong để đảm bảo đồng nhất nội dung, tiết kiệm network.
 */
import React, { useEffect, useState } from 'react';
import TheThongKe from '@/components/shop-owner/TheThongKe';
import FormCuaHang from '@/components/shop-owner/FormCuaHang';
import ThongTinHeThong from '@/components/shop-owner/ThongTinHeThong';
import { ShopCuahangService } from '../../services/ShopCuahangService';

export default function CuaHang() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu cửa hàng ngay khi vào trang
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        // BE trả về { message, data: { storeId, ownerId, storeName, ... } }
        const res = await ShopCuahangService.getMyStore();
        const raw = res.data || {};
        // Normalize field names cho FE (storeName → name)
        const data = {
          storeId: raw.storeId,
          ownerId: raw.ownerId,
          name: raw.storeName,
          description: raw.description,
          logoUrl: raw.logoUrl,
          isActive: raw.isActive,
          createdAt: raw.createdAt,
        };
        setStoreInfo(data);
      } catch (error) {
        console.error("Lỗi lấy thông tin cửa hàng:", error);
        // Khi lỗi, giữ storeInfo là null hoặc xử lý thông báo lỗi qua UI
        setStoreInfo(null);
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
    <div className="w-full max-w-7xl mx-auto space-y-8 text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý cửa hàng</h1>
      </div>
      <TheThongKe stats={storeInfo} isActive={storeInfo?.isActive} />

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
