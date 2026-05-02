import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, Info, Image as ImageIcon,
  CheckCircle2, XCircle, Search, History, Trash2, EyeOff, Lock, 
  ChevronDown, ChevronUp, Eye, Loader2, Clock, AlertTriangle
} from 'lucide-react';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';


const getTypeBadge = (type) => {
  switch (type) {
    case 'Hàng giả/nhái':
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">Hàng giả/nhái</span>;
    case 'Thông tin sai lệch':
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">Thông tin sai lệch</span>;
    default:
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">{type}</span>;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Chờ xử lý':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'Đang xem xét':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Đã giải quyết':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Từ chối':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [banProduct, setBanProduct] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState('Mọi trạng thái');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  const statusMap = {
    'PENDING': 'Chờ xử lý',
    'REVIEWING': 'Đang xem xét',
    'RESOLVED': 'Đã giải quyết',
    'REJECTED': 'Từ chối'
  };

  const reverseStatusMap = {
    'Chờ xử lý': 'PENDING',
    'Đang xem xét': 'REVIEWING',
    'Đã giải quyết': 'RESOLVED',
    'Từ chối': 'REJECTED'
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus === 'Mọi trạng thái' ? undefined : reverseStatusMap[filterStatus];
      const res = await adminService.getReports({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
        searchTerm: searchTerm || undefined
      });

      if (res && res.data) {
        const mappedReports = res.data.map(item => ({
          id: item.ReportId,
          displayId: `RP-${(item.ReportId || 0).toString().padStart(3, '0')}`,
          productName: item.Products?.ProductName || 'Sản phẩm không xác định',
          productImage: item.Products?.ThumbnailUrl || null,
          shopName: item.Stores?.StoreName || 'Cửa hàng không xác định',
          shopId: item.StoreId,
          shopViolations: 0,
          reporterName: item.Reporter?.FullName || 'Ẩn danh',
          reporterEmail: item.Reporter?.Email || '',
          type: item.ReportType || 'Khác',
          description: item.Description || '',
          date: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('vi-VN') : 'N/A',
          status: statusMap[item.Status] || item.Status || 'Chờ xử lý',
          logs: [],
          evidence: []
        }));

        setReports(mappedReports);
        setTotalItems(res.meta?.total || 0);
      } else {
        setReports([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
      toast.error(error.message || "Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (reportId) => {
    try {
      const res = await adminService.getReportDetail(reportId);
      
      // Đồng bộ mapping với fetchReports
      const detail = {
        id: res.ReportId,
        displayId: `RP-${(res.ReportId || 0).toString().padStart(3, '0')}`,
        productName: res.Products?.ProductName || 'Sản phẩm không xác định',
        productImage: res.Products?.ThumbnailUrl || null,
        shopName: res.Stores?.StoreName || 'Cửa hàng không xác định',
        shopId: res.StoreId,
        reporterName: res.Reporter?.FullName || 'Ẩn danh',
        reporterEmail: res.Reporter?.Email || '',
        type: res.ReportType || 'Khác',
        description: res.Description || '',
        date: res.CreatedAt ? new Date(res.CreatedAt).toLocaleDateString('vi-VN') : 'N/A',
        status: statusMap[res.Status] || res.Status || 'Chờ xử lý',
        logs: res.ReportLogs?.map(log => ({
          actor: log.AdminUser?.FullName || 'Hệ thống',
          action: log.Action,
          time: new Date(log.CreatedAt).toLocaleString('vi-VN')
        })) || [],
        evidence: res.ReportEvidences?.map(e => e.ImageUrl) || [],
        productReportStats: res.productReportStats,
        // Giữ lại các trường mock
        shopViolations: 0,
      };
      
      setReports(prev => prev.map(r => r.id === reportId ? detail : r));
      setSelectedReport(detail);
    } catch (error) {
      console.error("Fetch report detail error:", error);
      toast.error("Không thể tải chi tiết báo cáo");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, filterStatus, searchTerm]);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    fetchReportDetail(report.id);
  };

  const updateReportStatus = async (id, newStatusDisplay, note = '') => {
    try {
      const statusValue = reverseStatusMap[newStatusDisplay];
      await adminService.updateReportStatus(id, { 
        status: statusValue,
        note: note,
        banProduct: banProduct // Use the state value
      });
      toast.success(`Đã cập nhật trạng thái thành ${newStatusDisplay}`);
      setBanProduct(false); // Reset after update
      fetchReports(); // Refresh list
      if (selectedReport?.id === id) {
        fetchReportDetail(id); // Refresh detail
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(reports.map(r => r.id));
    else setSelectedIds([]);
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };



  const handleBulkDelete = () => {
    toast.error("Tính năng xóa hàng loạt đang được phát triển");
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Sản phẩm', 'Cửa hàng', 'Người báo cáo', 'Email', 'Loại', 'Mô tả', 'Ngày gửi', 'Trạng thái'
    ];
    
    const rows = reports.map(r => [
      r.id,
      `"${r.productName}"`,
      `"${r.shopName}"`,
      `"${r.reporterName}"`,
      r.reporterEmail,
      `"${r.type}"`,
      `"${r.description}"`,
      r.date,
      r.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DanhSachBaoCao_${new Date().getTime()}.csv`;
    link.click();
  };

  const handleResolve = () => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, 'Đã giải quyết', feedback);
    setFeedback('');
  };

  const handleReject = () => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, 'Từ chối', feedback);
    setFeedback('');
  };


  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-blue-600" size={24} />
            Quản lý Báo cáo Sản phẩm
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi, kiểm tra và xử lý các khiếu nại của người dùng về chất lượng sản phẩm và nội dung.
          </p>
        </div>
      </div>

      {/* FILTER & ACTIONS BOX */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        
        {/* ROW 1: SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative w-64 lg:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Tìm kiếm báo cáo, email, ID..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium text-gray-700 placeholder-gray-400"
               />
             </div>
             

             
             <select 
               value={filterStatus}
               onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
               className="border border-gray-200 bg-white rounded-lg p-2 text-sm outline-none w-40 focus:ring-1 focus:ring-blue-500 font-medium text-gray-600"
             >
               <option>Mọi trạng thái</option>
               <option>Chờ xử lý</option>
               <option>Đang xem xét</option>
               <option>Đã giải quyết</option>
               <option>Từ chối</option>
             </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition drop-shadow-sm">
               <History size={16} /> Lịch sử
             </button>
             <button onClick={handleExportCSV} className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-5 py-2 text-sm font-bold hover:bg-blue-600 transition shadow-sm drop-shadow-md">
               Xuất báo cáo
             </button>
          </div>
        </div>

        {/* THAO TÁC HÀNG LOẠT */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 py-2 border-t border-gray-100 flex-wrap animate-fadeIn">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Thao tác hàng loạt:</span>

            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition ml-2">
               <Trash2 size={14} /> Xóa
            </button>
          </div>
        )}

        {/* BẢNG DỮ LIỆU BÁO CÁO MỚI */}
        <div className="overflow-x-auto w-full mt-2 border-t border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === reports.length && reports.length > 0} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                </th>
                <th className="px-4 py-4">Sản phẩm</th>
                <th className="px-4 py-4">Cửa hàng (Shop)</th>

                <th className="px-4 py-4">Người báo cáo</th>
                <th className="px-4 py-4">Loại</th>
                <th className="px-4 py-4">Mô tả</th>
                <th className="px-4 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <span className="text-sm text-gray-500 font-medium">Đang tải danh sách báo cáo...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-500">Không tìm thấy báo cáo nào</td>
                </tr>
              ) : reports.map((report) => (
                <React.Fragment key={report.id}>
                  <tr 
                    onClick={() => handleSelectReport(report)}
                    className={`cursor-pointer transition-colors ${selectedReport?.id === report.id ? 'bg-blue-50/20' : 'hover:bg-gray-50/50'} align-top`}
                  >
                    <td className="px-4 py-4">
                       <input 
                         type="checkbox" 
                         checked={selectedIds.includes(report.id)} 
                         onChange={() => toggleSelectRow(report.id)} 
                         onClick={e => e.stopPropagation()}
                         className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" 
                       />
                    </td>
                    <td className="px-4 py-4 min-w-[220px]">
                       <div className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                             {report.productImage ? <img src={report.productImage} className="w-full h-full object-cover" alt="product" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>}
                          </div>
                          <div className="flex flex-col overflow-hidden max-w-[150px]">
                             <span className="font-bold text-gray-800 text-xs truncate whitespace-normal leading-tight">{report.productName}</span>
                             <span className="text-[10px] text-gray-400 font-bold mt-1">ID: {report.displayId}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col gap-1.5 items-start max-w-[120px]">
                          <div className="flex items-center gap-1.5">
                             <span className="text-blue-600 font-bold text-[11px] hover:underline cursor-pointer leading-tight whitespace-normal">{report.shopName}</span>
                             {report.shopViolations > 0 && (
                                <span className="w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded-full text-[9px] font-bold shrink-0">{report.shopViolations}</span>
                             )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium font-sans w-full">
                             <AlertCircle size={11} className="text-gray-400 shrink-0" />
                             <span className="truncate">Lịch sử vi phạm</span>
                          </div>
                       </div>
                    </td>

                    <td className="px-4 py-4">
                       <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-[12px]">{report.reporterName}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{report.reporterEmail}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       {getTypeBadge(report.type)}
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col gap-2 max-w-[140px]">
                         <span className="text-[11px] text-gray-600 italic truncate drop-shadow-sm">"{report.description}"</span>
                         <div className="flex items-center gap-2">
                           <button className="text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5"><Eye size={12}/></button>
                           <button className="text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5"><Lock size={12}/></button>
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-1 w-[140px]">
                         <select 
                           value={report.status}
                           onChange={(e) => { e.stopPropagation(); updateReportStatus(report.id, e.target.value); }}
                           onClick={e => e.stopPropagation()}
                           className={`w-full bg-transparent outline-none text-[10px] font-bold px-1 appearance-none cursor-pointer ${
                             report.status?.includes('Chờ') ? 'text-gray-600' : 
                             report.status?.includes('Đang') ? 'text-blue-600' : 
                             report.status?.includes('Đã') ? 'text-emerald-600' : 'text-red-600'
                           }`}
                         >
                           <option>Chờ xử lý</option>
                           <option>Đang xem xét</option>
                           <option>Đã giải quyết</option>
                           <option>Từ chối</option>
                         </select>
                         <ChevronDown size={14} className="text-gray-400 shrink-0 mx-1" />
                       </div>
                       <div className="flex items-center gap-2 mt-2 justify-end w-[140px] pr-2">
                          <button className="text-gray-400 hover:text-gray-600"><EyeOff size={13}/></button>
                          <button className="text-gray-400 hover:text-gray-600"><Lock size={12}/></button>
                       </div>
                    </td>
                  </tr>

                  {/* LIÊN QUAN ĐẾN NHẬT KÝ */}
                  {selectedReport?.id === report.id && (
                    <tr className="bg-[#FBFCFD] border-b border-gray-100">
                      <td colSpan="7" className="px-10 py-5">
                        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                          {/* Nhật ký xử lý */}
                          <div className="flex-1">
                             <h5 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-4">
                               <History size={12} className="text-blue-600" /> NHẬT KÝ XỬ LÝ
                             </h5>
                             <div className="space-y-3">
                                {report.logs?.length > 0 ? report.logs.map((log, idx) => (
                                   <div key={idx} className="flex gap-4 items-start w-full">
                                     <span className={`font-extrabold text-[11px] w-24 shrink-0 truncate ${log.actor === 'Hệ thống' ? 'text-blue-500' : 'text-blue-600'}`}>{log.actor}:</span>
                                     <span className="text-[11px] text-gray-600 font-medium">{log.action}</span>
                                     <span className="text-[10px] text-gray-400 ml-auto shrink-0 font-medium">{log.time}</span>
                                   </div>
                                )) : (
                                   <span className="text-[11px] text-gray-400 italic">Chưa có lịch sử xử lý</span>
                                )}
                             </div>
                          </div>
                          
                          {/* Bằng chứng trực quan */}
                          <div className="flex-1">
                             <h5 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-4">
                               <ImageIcon size={12} className="text-blue-600" /> BẰNG CHỨNG TRỰC QUAN
                             </h5>
                             <div className="flex items-center gap-2 flex-wrap">
                                {report.evidence?.length > 0 ? report.evidence.map((img, idx) => (
                                   <div key={idx} className="w-16 h-12 rounded border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition">
                                     <img src={img} className="w-full h-full object-cover" alt="evidence"/>
                                   </div>
                                )) : (
                                   <span className="text-xs text-gray-400 italic">Không có hình ảnh đính kèm</span>
                                )}
                             </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center py-3 px-2 border-t border-gray-100">
           <span className="text-[11px] text-gray-500 font-medium">Đang hiển thị <strong className="text-gray-700">{reports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, totalItems)}</strong> trên tổng số <strong className="text-gray-700">{totalItems}</strong> báo cáo</span>
           <div className="flex items-center gap-1">
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50">&lt;</button>
             {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
             ))}
             <button disabled={currentPage === Math.ceil(totalItems / itemsPerPage) || totalItems === 0} onClick={() => setCurrentPage(p => p + 1)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">&gt;</button>
           </div>
        </div>
      </div>

      {/* BOTTOM PANELS */}
      <div className="flex flex-col lg:flex-row gap-6">
         
         {/* LEFT PANEL: THỐNG KÊ BÁO CÁO */}
         <div className="lg:w-1/2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
               <h4 className="font-bold text-gray-800 text-[14px] flex items-center gap-2">
                  <History size={16} className="text-blue-500" /> Thống kê báo cáo sản phẩm
               </h4>
               {selectedReport?.productReportStats && (
                  <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                     Bị báo cáo {selectedReport.productReportStats.totalReports} lần
                  </span>
               )}
            </div>

            <div className="space-y-3">
               {selectedReport ? (
                  <>
                     <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-[11px] text-blue-700 font-medium mb-1 uppercase tracking-wider">Đang xem xét sản phẩm:</p>
                        <p className="text-sm font-bold text-slate-800">{selectedReport.productName}</p>
                     </div>

                     <div className="mt-2">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Lịch sử các lần báo cáo chi tiết</h5>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                           {selectedReport.productReportStats?.history?.length > 0 ? (
                              selectedReport.productReportStats.history.map((h, idx) => (
                                 <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all shadow-sm group">
                                    <div className="flex justify-between items-center mb-2">
                                       <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                          {h.reportType}
                                       </span>
                                       <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                          <Clock size={10} /> {new Date(h.createdAt).toLocaleDateString('vi-VN')}
                                       </span>
                                    </div>
                                    <p className="text-[11px] text-gray-600 italic leading-relaxed font-medium">"{h.description}"</p>
                                    <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                                       <span className="text-[10px] text-gray-400">Người báo cáo: <span className="font-bold text-gray-500">{h.reporterName}</span></span>
                                       <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          h.status === 'RESOLVED' ? 'bg-green-50 text-green-600' : 
                                          h.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                       }`}>
                                          {h.status === 'RESOLVED' ? 'Đã giải quyết' : h.status === 'PENDING' ? 'Chờ xử lý' : 'Từ chối'}
                                       </span>
                                    </div>
                                 </div>
                              ))
                           ) : (
                              <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                 <p className="text-xs text-gray-400 italic">Chọn một báo cáo để xem lịch sử</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </>
               ) : (
                  <div className="py-20 text-center flex flex-col items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <AlertCircle size={24} />
                     </div>
                     <p className="text-xs text-gray-400 font-medium italic">Vui lòng chọn một báo cáo từ danh sách phía trên <br/> để xem thống kê chi tiết sản phẩm.</p>
                  </div>
               )}
            </div>
         </div>

         {/* RIGHT PANEL: CHI TIẾT */}
         <div className="lg:w-1/2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-[16px] font-bold text-gray-800">Xử lý Báo cáo</h3>
               <span className="px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-600 font-bold text-[10px] tracking-wider">#{selectedReport?.displayId?.substring(3) || '...'}</span>
            </div>

            <div className="space-y-4 text-[12px]">
                <div className="border-b border-gray-100 pb-3">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">SẢN PHẨM BỊ BÁO CÁO</h5>
                  <p className="font-semibold text-gray-800">{selectedReport?.productName}</p>
               </div>
               <div className="border-b border-gray-100 pb-3">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">NGƯỜI GỬI KHIẾU NẠI</h5>
                  <p className="font-bold text-gray-800">{selectedReport?.reporterName} <span className="font-medium text-gray-500">({selectedReport?.reporterEmail})</span></p>
               </div>
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">NỘI DUNG CHI TIẾT</h5>
                  <p className="text-gray-600 italic leading-relaxed font-medium">"{selectedReport?.description}"</p>
               </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
               <div className="flex items-center gap-2 px-1">
                 <input 
                   type="checkbox" 
                   id="banProductCheck"
                   checked={banProduct}
                   onChange={(e) => setBanProduct(e.target.checked)}
                   className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer"
                 />
                 <label htmlFor="banProductCheck" className="text-xs font-bold text-red-600 cursor-pointer uppercase tracking-tight">
                    Khóa sản phẩm vi phạm (Ngừng kinh doanh)
                 </label>
               </div>
               <div>
                 <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">LÝ DO XỬ LÝ / PHẢN HỒI</h5>
                 <textarea 
                   value={feedback}
                   onChange={(e) => setFeedback(e.target.value)}
                   className="w-full border border-gray-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50 min-h-[80px] font-medium placeholder-gray-400 resize-none transition"
                   placeholder="Nhập nội dung phản hồi cho Shop hoặc Người dùng..."
                 ></textarea>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-1">
                 <button 
                   onClick={handleResolve}
                   className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00B47A] text-white font-bold text-[13px] hover:bg-[#009b68] transition shadow-md shadow-emerald-500/20"
                 >
                    <CheckCircle2 size={16} /> Duyệt & Giải quyết
                 </button>
                 <button 
                   onClick={handleReject}
                   className="flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-500 font-bold text-[13px] hover:bg-red-50 transition bg-white shadow-sm"
                 >
                    <XCircle size={15} /> Từ chối
                 </button>
                 <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 transition bg-white shadow-sm">
                    Đóng
                 </button>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
};

export default ReportManagement;
