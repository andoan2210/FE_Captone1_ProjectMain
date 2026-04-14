// Sản phẩm
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // Thêm createPortal để xử lý dropdown không bị che khuất
import {
  FiArrowLeft,
  FiUpload,
  FiPlus,
  FiSave,
  FiX,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
  FiInfo,
  FiImage,
  FiGrid,
  FiCheck,
  FiTrash2,
  FiDollarSign,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import { ShopProductService } from "../../services/ShopProductService";
import { CategoryService } from "../../services/CategoryService";

// =============================================================================
// [0] DANH SÁCH GỢI Ý (SUGGESTIONS)
// =============================================================================
const COMMON_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "Freesize",
  "One size",
];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
const ALL_SIZE_OPTIONS = [...COMMON_SIZES, ...SHOE_SIZES];

// =============================================================================
// [Sub-Component] BỘ CHỌN SIZE CAO CẤP (PORTAL BASED)
// =============================================================================
const SuggestibleSizeInput = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ bottom: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        bottom: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none pr-8"
        />
        <div
          className="absolute right-3 cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: coords.bottom - 4,
              left: coords.left,
              width: coords.width,
              transform: "translateY(-100%)",
              zIndex: 9999,
            }}
            className="bg-white border border-slate-100 rounded-xl shadow-2xl py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar-mini">
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 mb-1">
                Gợi ý kích thước
              </div>
              {ALL_SIZE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-semibold transition-all hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between ${value === option ? "bg-blue-50 text-blue-600" : "text-slate-600"}`}
                >
                  {option}
                  {value === option && <FiCheck size={14} />}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

// =============================================================================
// [1] KHỞI TẠO COMPONENT & QUẢN LÝ TRẠNG THÁI (STATE)
// =============================================================================
const ProductForm = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();

  // Trạng thái Form dựa trên initialData từ Backend
  const [formData, setFormData] = useState({
    ...initialData,
    productId: initialData?.id || initialData?.productId || null,
    name: initialData?.name || initialData?.productName || "",
    category: initialData?.categoryId || "", // Dùng CategoryId để select hiển thị đúng
    status:
      initialData?.isActive !== undefined
        ? initialData.isActive
          ? "Đang hoạt động"
          : "Tạm ẩn"
        : "Đang hoạt động",
    description: initialData?.description || "",
    variants: (initialData?.variants || initialData?.ProductVariants || []).map(
      (v) => ({
        id: v.variantId || v.VariantId || Date.now() + Math.random(),
        size: v.size || v.Size || "",
        color: v.color || v.Color || "",
        stock: v.stock || v.Stock || 0,
        price: v.price || v.Price || 0,
      }),
    ),
    images: [], // Sẽ được xử lý ở useEffect bên dưới
  });

  // Track các ảnh cần xóa khi Edit
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [existingImagesInfo, setExistingImagesInfo] = useState([]); // { imageId, imageUrl }

  // ✅ Thêm state riêng cho thumbnail
  const [thumbnailFile, setThumbnailFile] = useState(null); // File thumbnail mới
  const [currentThumbnail, setCurrentThumbnail] = useState(null); // URL thumbnail cũ hoặc preview thumbnail

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]); // Lưu các File mới chờ upload
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null); // ✅ Ref cho upload thumbnail riêng

  // Lấy danh mục và xử lý dữ liệu ảnh ban đầu
  useEffect(() => {
    const initForm = async () => {
      try {
        const catData = await CategoryService.getAllCategories();
        setCategories(Array.isArray(catData) ? catData : []);

        if (isEdit && initialData) {
          // ✅ Xử lý ảnh: thumbnail + images phụ RIÊNG BIỆT
          const allImages = [];
          const info = [];

          // ✅ Thumbnail riêng biệt
          if (initialData.thumbnail || initialData.thumbnailUrl) {
            const url = initialData.thumbnail || initialData.thumbnailUrl;
            setCurrentThumbnail(url);
          }

          // ✅ Images phụ riêng biệt
          if (initialData.images && Array.isArray(initialData.images)) {
            // Backend trả về mảng string URL hoặc object tùy endpoint
            initialData.images.forEach((img) => {
              const url = typeof img === "string" ? img : img.imageUrl;
              allImages.push(url);
              if (img.imageId)
                info.push({ imageId: img.imageId, imageUrl: url });
            });
          }

          setFormData((prev) => ({
            ...prev,
            images: allImages,
            category: initialData.categoryId || prev.category,
          }));
          setExistingImagesInfo(info);
        } else if (!isEdit && formData.variants.length === 0) {
          // Mặc định 1 dòng biến thể khi thêm mới
          setFormData((prev) => ({
            ...prev,
            variants: [
              { id: Date.now(), size: "", color: "", stock: "", price: "" },
            ],
          }));
        }
      } catch (error) {
        console.error("Failed to init form", error);
      }
    };
    initForm();
  }, [isEdit, initialData]);

  // Xử lý Xóa sản phẩm
  const handleDeleteConfirmed = async () => {
    try {
      await ShopProductService.deleteProduct(formData.id);
      setSuccessMessage("Đã xóa sản phẩm thành công!");
      setShowDeleteModal(false);
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/shop-owner/products");
      }, 1500);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const validateForm = (isDraft = false) => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    } else if (formData.name.length < 3) {
      newErrors.name = "Tên sản phẩm phải có ít nhất 3 ký tự";
    } else if (/^\d+$/.test(formData.name.trim())) {
      newErrors.name = "Tên sản phẩm không được chỉ chứa chữ số";
    }
    if (!isDraft) {
      if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";

      if (!formData.description) {
        newErrors.description =
          "Hệ thống cần ít nhất một đoạn mô tả về sản phẩm";
      } else if (formData.description.length < 20) {
        newErrors.description =
          "Mô tả quá ngắn, vui lòng nhập ít nhất 20 ký tự";
      }

      if (!formData.variants || formData.variants.length === 0) {
        newErrors.variants = "Vui lòng thêm ít nhất một biến thể sản phẩm";
      } else {
        const variantErrors = [];
        formData.variants.forEach((v, idx) => {
          if (
            !v.size.trim() ||
            !v.color.trim() ||
            v.price === "" ||
            v.stock === ""
          ) {
            variantErrors.push(`Biến thể ${idx + 1} chưa nhập đủ thông tin`);
          } else if (Number(v.price) <= 0) {
            variantErrors.push(`Biến thể ${idx + 1}: Giá phải lớn hơn 0`);
          } else if (Number(v.stock) < 0) {
            variantErrors.push(`Biến thể ${idx + 1}: Kho hàng không được âm`);
          }
        });
        if (variantErrors.length > 0) newErrors.variants = variantErrors[0];
      }

      if (formData.images.length === 0)
        newErrors.images =
          "Hãy tải lên ít nhất một ảnh để khách hàng dễ hình dung";

      // ✅ THÊM: Kiểm tra thumbnail khi thêm sản phẩm mới
      if (!isEdit && !thumbnailFile && !currentThumbnail) {
        newErrors.thumbnail = "Vui lòng tải lên ảnh đại diện (thumbnail)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log("📸 handleImageUpload triggered with", files.length, "files");

    const imageErrors = [];
    const newPendingFiles = [];

    files.forEach((file) => {
      console.log(
        `  📄 Validating file: ${file.name} (${file.size} bytes, ${file.type})`,
      );
      if (file.size > 5 * 1024 * 1024) {
        imageErrors.push(`File ${file.name} quá lớn (tối đa 5MB)`);
      } else if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      ) {
        imageErrors.push(
          `File ${file.name} không đúng định dạng (JPG, PNG, WebP)`,
        );
      } else {
        newPendingFiles.push(file);
        console.log(`    ✅ File accepted`);
      }
    });

    console.log("📊 Validation result:", {
      validFiles: newPendingFiles.length,
      errors: imageErrors.length,
    });

    if (imageErrors.length > 0) {
      setErrors((prev) => ({ ...prev, images: imageErrors[0] }));
    } else if (newPendingFiles.length > 0) {
      // ✅ FIX: THÊM ảnh mới vào ĐẦU danh sách (hiển thị trên trang chủ)
      const newImages = newPendingFiles.map((file) =>
        URL.createObjectURL(file),
      );

      // Add new images to BEGINNING so they appear first (homepage display)
      setFormData((prev) => ({
        ...prev,
        images: [...newImages, ...prev.images], // ✅ New images first
      }));

      // Track new pending files separately so we can send them to backend
      setPendingFiles((prev) => [...newPendingFiles, ...prev]);

      console.log("🎨 Updated UI - ADDED new images:", {
        previousImagesCount: formData.images.length,
        newImagesCount: newImages.length,
        totalNow: formData.images.length + newImages.length,
        pendingFilesCount: pendingFiles.length + newPendingFiles.length,
      });

      setIsDirty(true);
      setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  // ✅ Handler upload thumbnail riêng
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: `File quá lớn (tối đa 5MB)`,
      }));
    } else if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: `File không đúng định dạng (JPG, PNG, WebP)`,
      }));
    } else {
      setThumbnailFile(file);
      setCurrentThumbnail(URL.createObjectURL(file));
      setIsDirty(true);
      setErrors((prev) => ({ ...prev, thumbnail: null }));
    }
  };

  const removeImage = async (index) => {
    const imageToRemove = formData.images[index];

    // ✅ Nếu là ảnh cũ (có trong existingImagesInfo), xóa thực sự trong DB
    const infoFound = existingImagesInfo.find(
      (info) => info.imageUrl === imageToRemove,
    );
    if (infoFound) {
      try {
        setLoading(true);
        await ShopProductService.deleteProductImage(infoFound.imageId);
        // ✅ Successful → remove from UI + state
        setExistingImagesInfo((prev) =>
          prev.filter((img) => img.imageId !== infoFound.imageId),
        );
      } catch (error) {
        console.error("Xóa ảnh thất bại:", error);
        alert("Lỗi: Không thể xóa ảnh. Vui lòng thử lại!");
        return;
      } finally {
        setLoading(false);
      }
    }

    // ✅ Nếu ảnh đang xóa là ảnh mới (blob), xóa khỏi pendingFiles
    if (imageToRemove.startsWith("blob:")) {
      // Find the File object in pendingFiles by matching the blob URL
      const fileToRemove = pendingFiles.find(
        (file) => URL.createObjectURL(file) === imageToRemove,
      );
      if (fileToRemove) {
        setPendingFiles((prev) => prev.filter((file) => file !== fileToRemove));
        console.log("🗑️  Removed pending file:", fileToRemove.name);
      }
    }

    // ✅ Remove from UI
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
    setIsDirty(true);
  };

  // --- QUẢN LÝ BIẾN THỂ ---
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: Date.now(), size: "", color: "", stock: "", price: "" },
      ],
    }));
    setIsDirty(true);
  };

  const removeVariant = (id) => {
    if (formData.variants.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
    setIsDirty(true);
  };

  const updateVariant = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v,
      ),
    }));
    setIsDirty(true);
    if (errors.variants) {
      setErrors((prev) => ({ ...prev, variants: null }));
    }
  };

  // Xử lý LƯU SẢN PHẨM (Add hoặc Update)
  const handleSave = async (isDraft = false) => {
    if (!validateForm(isDraft)) {
      console.warn("❌ Form validation failed");
      return;
    }

    console.log("💾 Starting save with:", {
      isDraft,
      isEdit,
      productName: formData.name,
      pendingFilesCount: pendingFiles.length,
      removeImageIds: removeImageIds,
      currentFormDataImagesCount: formData.images.length,
    });

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi
      const productToSave = {
        ...formData,
        categoryId: Number(formData.category),
        productName: formData.name,
        status: formData.status,
      };

      // ✅ FIXED: Chỉ xóa những ảnh mà user nhấn nút X để xóa
      // Không tự động xóa ảnh cũ khi upload ảnh mới
      let imagesToDelete = removeImageIds;
      console.log("📤 Images to delete (explicitly removed):", imagesToDelete);

      console.log("📤 About to call ShopProductService.saveProduct with:", {
        pendingFilesCount: pendingFiles.length,
        imagesToDeleteCount: imagesToDelete.length,
        hasThumbnailFile: !!thumbnailFile,
      });

      // Truyền thumbnailFile + imagesToDelete riêng biệt
      await ShopProductService.saveProduct(
        productToSave,
        isEdit,
        pendingFiles,
        imagesToDelete, // ✅ Use calculated imagesToDelete
        thumbnailFile,
      );

      setSuccessMessage(
        isDraft
          ? "Đã lưu bản nháp thành công!"
          : isEdit
            ? "Đã cập nhật sản phẩm thành công!"
            : "Đã thêm sản phẩm mới thành công!",
      );
      console.log("✅ Save successful!");
      setIsDirty(false);
      setPendingFiles([]);
      setRemoveImageIds([]);
      setThumbnailFile(null);

      setTimeout(() => {
        setSuccessMessage("");
        navigate("/shop-owner/products");
      }, 2000);
    } catch (error) {
      console.error("🚨 Save failed:", error.response?.data || error);
      const beError =
        error.response?.data?.message || "Lỗi cập nhật. Vui lòng thử lại!";
      const errMsg = Array.isArray(beError) ? beError[0] : beError;
      alert("Lỗi: " + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    handleSave(false);
  };

  const handleSaveDraft = () => {
    handleSave(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      navigate("/shop-owner/products");
    }
  };

  const toggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === "Đang hoạt động" ? "Tạm ẩn" : "Đang hoạt động",
    }));
  };

  // =============================================================================
  // [3] PHẦN GIAO DIỆN (RENDER JSX)
  // =============================================================================
  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        .custom-scrollbar-mini::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

      {/* 3.1 Tiêu đề & Nút quay lại */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 mb-2 gap-2 font-medium">
            <span>Trang chủ</span>
            <span className="text-slate-300">/</span>
            <span>Sản phẩm</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">
              {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
            </span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit
              ? "Cập nhật chi tiết sản phẩm và quản lý tồn kho của bạn."
              : "Tạo sản phẩm mới để hiển thị trên cửa hàng của bạn."}
          </p>
        </div>
        <button
          onClick={() => navigate("/shop-owner/products")}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
        >
          <FiArrowLeft size={18} />
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: Nhập liệu thông tin */}
        <div className="lg:col-span-2 space-y-8">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold animate-in fade-in zoom-in duration-300">
              <div className="bg-emerald-500 text-white p-1 rounded-full">
                <FiCheck size={16} />
              </div>
              {successMessage}
            </div>
          )}
          {/* Thông tin chung */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FiInfo size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Thông tin chung
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Áo sơ mi Oxford Slim Fit"
                  className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-rose-500 focus:ring-rose-100" : "border-slate-100 focus:ring-blue-100 focus:bg-white"}`}
                />
                {errors.name && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${errors.category ? "border-rose-500 focus:ring-rose-100" : "border-slate-100 focus:ring-blue-100 focus:bg-white"}`}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        -- Chưa có danh mục nào trong hệ thống --
                      </option>
                    )}
                  </select>
                  {errors.category && (
                    <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                      {errors.category}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Trạng thái
                  </label>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span
                      className={`text-sm font-bold ${formData.status === "Đang hoạt động" ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {formData.status}
                    </span>
                    <button
                      onClick={toggleStatus}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === "Đang hoạt động" ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === "Đang hoạt động" ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Mô tả sản phẩm
                </label>
                <div
                  className={`border rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 transition-all ${errors.description ? "border-rose-300 focus-within:ring-rose-100" : "border-slate-100 focus-within:ring-blue-100"}`}
                >
                  <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100">
                    {[FiBold, FiItalic, FiList, FiLink].map((Icon, idx) => (
                      <button
                        key={idx}
                        className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-lg transition-all"
                        type="button"
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Nhập mô tả chi tiết sản phẩm..."
                    className="w-full px-4 py-3 text-sm focus:outline-none resize-none bg-white font-medium"
                  ></textarea>
                </div>
                {errors.description && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3.2 Nhóm: Biến thể sản phẩm */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FiGrid size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Biến thể sản phẩm
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                <FiPlus size={16} />
                Thêm biến thể
              </button>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 custom-scrollbar">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                      Size
                    </th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                      Màu
                    </th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                      Kho hàng
                    </th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                      Giá bán (VND)
                    </th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2 text-center w-16">
                      Xóa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {formData.variants.map((v, idx) => (
                    <tr
                      key={v.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <SuggestibleSizeInput
                          value={v.size}
                          onChange={(val) => updateVariant(v.id, "size", val)}
                          placeholder="S, M, L..."
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) =>
                            updateVariant(v.id, "color", e.target.value)
                          }
                          placeholder="Màu sắc..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(v.id, "stock", e.target.value)
                          }
                          placeholder="0"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) =>
                            updateVariant(v.id, "price", e.target.value)
                          }
                          placeholder="0"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className={`p-2 rounded-lg transition-all ${formData.variants.length > 1 ? "text-slate-300 hover:text-rose-500 hover:bg-rose-50" : "text-slate-200 cursor-not-allowed"}`}
                          disabled={formData.variants.length <= 1}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.variants && (
              <p className="text-rose-500 text-xs font-bold mt-2 ml-1 flex items-center gap-2">
                <FiInfo size={14} /> {errors.variants}
              </p>
            )}
            <p className="text-slate-400 text-[11px] font-medium italic mt-2">
              * Mẹo: Bạn có thể nhập nhiều biến thể khác nhau về kích thước và
              màu sắc cho cùng một sản phẩm.
            </p>
          </div>

          {isEdit && (
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-rose-600">
                  Xóa sản phẩm
                </h3>
                <p className="text-sm text-slate-500">
                  Hành động này không thể hoàn tác. Mọi dữ liệu liên quan sẽ
                  biến mất.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-95"
              >
                <FiTrash2 size={18} />
                Xóa sản phẩm
              </button>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Hình ảnh & Xem trước */}
        <div className="space-y-8">
          {/* ✅ 3.2a Nhóm: Upload Thumbnail Riêng */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-2">
              <FiImage className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Ảnh Đại Diện (Thumbnail)
              </h2>
            </div>

            <input
              type="file"
              ref={thumbnailInputRef}
              onChange={handleThumbnailUpload}
              accept="image/*"
              className="hidden"
            />

            {currentThumbnail ? (
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                  <img
                    src={currentThumbnail}
                    className="w-full h-full object-cover"
                    alt="Thumbnail"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="p-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                      title="Thay đổi thumbnail"
                    >
                      <FiUpload size={16} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full bg-blue-50 border border-blue-200 text-blue-600 px-4 py-2.5 rounded-2xl font-bold hover:bg-blue-100 transition-all text-sm"
                >
                  Thay đổi thumbnail
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-blue-100 text-slate-400 hover:text-blue-600">
                  <FiUpload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">
                    Upload thumbnail (bắt buộc)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG tối đa 5MB
                  </p>
                </div>
              </div>
            )}
            {errors.thumbnail && (
              <p className="text-rose-500 text-xs font-bold ml-1">
                {errors.thumbnail}
              </p>
            )}
          </div>

          {/* 3.3 Nhóm: Quản lý Hình ảnh */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-2">
              <FiImage className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">Hình ảnh</h2>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${errors.images ? "border-rose-300 bg-rose-50/30" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${errors.images ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"}`}
              >
                <FiUpload size={24} />
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-bold ${errors.images ? "text-rose-600" : "text-slate-700"}`}
                >
                  {errors.images || "Click để tải lên hoặc kéo thả"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG tối đa 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(formData.images || []).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group animate-in zoom-in duration-300"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-2 bg-white text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`Preview ${idx}`}
                  />
                </div>
              ))}
              {formData.images.length < 6 && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-400 cursor-pointer transition-all"
                >
                  <FiPlus size={20} />
                </div>
              )}
            </div>
          </div>

          {/* 3.4 Nhóm: Xem trước Giao diện Shop */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <FiGrid className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">
                  Xem trước cửa hàng
                </h2>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ring-1 ring-emerald-100">
                Công khai
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
              <div className="aspect-square rounded-xl bg-white shadow-sm border border-slate-200/50 overflow-hidden relative">
                {/* ✅ Hiển thị thumbnail hoặc ảnh đầu tiên */}
                {currentThumbnail ? (
                  <img
                    src={currentThumbnail}
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                    alt="Thumbnail"
                  />
                ) : formData.images.length > 0 ? (
                  <img
                    src={formData.images[0]}
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                    alt="First image"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <FiImage size={48} className="opacity-20" />
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-40">
                      Chưa có ảnh
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                  CÒN HÀNG
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {formData.category || "DANH MỤC"}
                </p>
                <h4 className="font-extrabold text-slate-800 leading-tight">
                  {formData.name || "Tên sản phẩm sẽ hiển thị ở đây"}
                </h4>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-blue-600 font-black">
                    {formData.variants &&
                    formData.variants.length > 0 &&
                    formData.variants[0].price
                      ? Number(formData.variants[0].price).toLocaleString(
                          "vi-VN",
                        ) + "đ"
                      : "0đ"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold italic">
                    {formData.variants && formData.variants.length > 0
                      ? `Còn ${formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)} sản phẩm`
                      : "Hết hàng"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FiInfo /> Thông tin hệ thống
              </h3>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex justify-between py-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Product ID:</span>
                  <span className="text-slate-800">PROD-12345</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Store ID:</span>
                  <span className="text-slate-800">STORE-88</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Ngày tạo:</span>
                  <span className="text-slate-800">12/05/2023</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Cập nhật:</span>
                  <span className="text-slate-800 uppercase tracking-tighter">
                    Vừa mới đây
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3.5 THANH CÔNG CỤ NỔI (ACTION BAR) */}
      <div className="fixed bottom-8 right-8 z-30 flex gap-3 animate-in slide-in-from-right-10 duration-700">
        <button
          onClick={handleCancel}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-50 transition-all active:scale-95"
        >
          Hủy
        </button>
        {!isEdit && (
          <button
            onClick={handleSaveDraft}
            className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-900 transition-all active:scale-95"
          >
            Lưu nháp
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang xử lý...
            </div>
          ) : (
            <>
              <FiCheck size={20} />
              {isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"}
            </>
          )}
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => navigate("/shop-owner/products")}
        title="Hủy bỏ thay đổi?"
        message="Những thông tin bạn vừa nhập sẽ không được lưu lại. Bạn có chắc chắn muốn rời đi?"
        confirmText="Rời khỏi trang"
        cancelText="Tiếp tục chỉnh sửa"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirmed}
        title="Xác nhận xóa sản phẩm?"
        message={`Bạn có chắc chắn muốn xóa "${formData.name}"? Hành động này không thể hoàn tác và dữ liệu sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        isDanger={true}
      />
    </div>
  );
};

export default ProductForm;
