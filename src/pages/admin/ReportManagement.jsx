import React, { useState } from 'react';
import { 
  Filter, Calendar, Download, AlertCircle, Info, Image as ImageIcon,
  CheckCircle2, XCircle, Search, History, Trash2, EyeOff, Lock, Edit3, 
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';

const initialMockReports = [
  {
    id: 'RP-001',
    productName: 'iPhone 15 Pro Max 256GB Titanium',
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=40&q=80',
    shopName: 'Apple Store Official',
    shopViolations: 3,
    priority: 'Cao',
    sla: 'QUÁ HẠN 174.9H',
    reporterName: 'Lê Văn Tám',
    reporterEmail: 'levantam.92@gmail.com',
    type: 'Hàng giả/nhái',
    description: 'Sản phẩm nhận được không giống như mô tả...',
    date: '14/04/2024',
    status: 'Chờ xử lý',
    logs: [
      { actor: 'Hệ thống', action: 'Tạo báo cáo tự động', time: '14/04/2024 09:20' },
      { actor: 'Admin System', action: 'Tiếp nhận báo cáo (Pending)', time: '14/04/2024 09:03' }
    ],
    evidence: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=50&q=80',
      'https://images.unsplash.com/photo-1592890288564-76628a30a657?w=50&q=80'
    ]
  },
  {
    id: 'RP-002',
    productName: 'Tai nghe Sony WH-1000XM5',
    productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=40&q=80',
    shopName: 'Sony Center',
    shopViolations: 0,
    priority: 'Trung bình',
    sla: 'CÒN HẠN 17H',
    reporterName: 'Nguyễn Thị Hoa',
    reporterEmail: 'hoanguyen_tech@yahoo.com',
    type: 'Thông tin sai lệch',
    description: 'Mô tả ghi là bảo hành chính hãng 24...',
    date: '13/04/2024',
    status: 'Đang xem xét',
    logs: [
      { actor: 'Admin System', action: 'Đang xem xét chi tiết (Reviewing)', time: '13/04/2024 15:00' }
    ],
    evidence: [
      'https://images.unsplash.com/photo-1620189507185-177b94154e56?w=50&q=80'
    ]
  }
];

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
  const [reports, setReports] = useState(initialMockReports);
  const [selectedReport, setSelectedReport] = useState(initialMockReports[0]);
  const [feedback, setFeedback] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [filterType, setFilterType] = useState('Tất cả ưu tiên');
  const [filterStatus, setFilterStatus] = useState('Mọi trạng thái');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredReports = reports.filter(r => {
    const matchStatus = filterStatus === 'Mọi trạng thái' || r.status === filterStatus;
    const matchPriority = filterType === 'Tất cả ưu tiên' || r.priority === filterType;
    const matchSearch = r.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.reporterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentItems = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(currentItems.map(r => r.id));
    else setSelectedIds([]);
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkResolve = () => {
    setReports(reports.map(r => selectedIds.includes(r.id) ? { ...r, status: 'Đã giải quyết' } : r));
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    setReports(reports.map(r => selectedIds.includes(r.id) ? { ...r, status: 'Từ chối' } : r));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if(!window.confirm('Bạn có chắc chắn muốn xóa báo cáo đã chọn?')) return;
    setReports(reports.filter(r => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Sản phẩm', 'Cửa hàng', 'Ưu tiên', 'SLA', 'Người báo cáo', 'Email', 'Loại', 'Mô tả', 'Ngày gửi', 'Trạng thái'
    ];
    
    const rows = filteredReports.map(r => [
      r.id,
      `"${r.productName}"`,
      `"${r.shopName}"`,
      r.priority,
      `"${r.sla}"`,
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
    const newLog = {
      actor: 'Admin System',
      action: `Đã giải quyết` + (feedback ? `: ${feedback}` : ''),
      time: new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date().toLocaleDateString('vi-VN')
    };
    const updated = reports.map(r => r.id === selectedReport.id ? { 
        ...r, 
        status: 'Đã giải quyết',
        logs: [...(r.logs || []), newLog]
      } : r);
    setReports(updated);
    setSelectedReport(updated.find(r => r.id === selectedReport.id));
    setFeedback('');
  };

  const handleReject = () => {
    if (!selectedReport) return;
    const newLog = {
      actor: 'Admin System',
      action: `Đã từ chối` + (feedback ? `: ${feedback}` : ''),
      time: new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date().toLocaleDateString('vi-VN')
    };
    const updated = reports.map(r => r.id === selectedReport.id ? { 
        ...r, 
        status: 'Từ chối',
        logs: [...(r.logs || []), newLog]
      } : r);
    setReports(updated);
    setSelectedReport(updated.find(r => r.id === selectedReport.id));
    setFeedback('');
  };

  const updateReportStatus = (id, newStatus) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedReport?.id === id) setSelectedReport(prev => ({ ...prev, status: newStatus }));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-10">
      
      {/* HEADER TITTLE */}
      <div className="bg-transparent">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Báo cáo Sản phẩm</h2>
        <p className="text-sm text-gray-500 mt-1">Theo dõi, kiểm tra và xử lý các khiếu nại của người dùng về chất lượng sản phẩm và nội dung.</p>
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
               value={filterType}
               onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
               className="border border-gray-200 bg-white rounded-lg p-2 text-sm outline-none w-36 focus:ring-1 focus:ring-blue-500 font-medium text-gray-600"
             >
               <option>Tất cả ưu tiên</option>
               <option>Cao</option>
               <option>Trung bình</option>
               <option>Thấp</option>
             </select>
             
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
            <button onClick={handleBulkResolve} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">
               <CheckCircle2 size={14} /> Giải quyết
            </button>
            <button onClick={handleBulkReject} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">
               <XCircle size={14} /> Từ chối
            </button>
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
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === currentItems.length && currentItems.length > 0} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                </th>
                <th className="px-4 py-4">Sản phẩm</th>
                <th className="px-4 py-4">Cửa hàng (Shop)</th>
                <th className="px-4 py-4">Ưu tiên & SLA</th>
                <th className="px-4 py-4">Người báo cáo</th>
                <th className="px-4 py-4">Loại</th>
                <th className="px-4 py-4">Mô tả</th>
                <th className="px-4 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((report) => (
                <React.Fragment key={report.id}>
                  <tr 
                    onClick={() => setSelectedReport(report)}
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
                             {report.productImage ? <img src={report.productImage} className="w-full h-full object-cover" alt="product" /> : <ImageIcon size={20}/>}
                          </div>
                          <div className="flex flex-col overflow-hidden max-w-[150px]">
                             <span className="font-bold text-gray-800 text-xs truncate whitespace-normal leading-tight">{report.productName}</span>
                             <span className="text-[10px] text-gray-400 font-bold mt-1">ID: {report.id}</span>
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
                       <div className="flex flex-col gap-1.5 w-fit">
                         {report.priority === 'Cao' ? (
                           <span className="px-2 py-0.5 rounded-sm bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold uppercase tracking-wider justify-center mx-auto text-center w-full">Cao</span>
                         ) : (
                           <span className="px-2 py-0.5 rounded-sm bg-gray-50 text-gray-600 border border-gray-200 text-[9px] font-bold uppercase tracking-wider justify-center mx-auto text-center w-full">Trung bình</span>
                         )}
                         <span className={`text-[9px] font-bold uppercase flex items-center gap-1 px-1.5 py-0.5 border rounded-sm tracking-wider ${report.sla.includes('QUÁ HẠN') ? 'text-red-500 border-red-100 bg-red-50/50' : 'text-gray-500 border-gray-100'}`}>
                           {report.sla}
                         </span>
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
                             report.status.includes('Chờ') ? 'text-gray-600' : 
                             report.status.includes('Đang') ? 'text-blue-600' : 
                             report.status.includes('Đã') ? 'text-emerald-600' : 'text-red-600'
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

                  {/* LIÊN QUAN ĐẾN NHẬT KÝ (Luôn hiển thị nếu là mock đầu tiên hoặc đang selected để giống hình) */}
                  {(selectedReport?.id === report.id || report.logs) && (
                    <tr className="bg-[#FBFCFD] border-b border-gray-100">
                      <td colSpan="8" className="px-10 py-5">
                        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                          {/* Nhật ký xử lý */}
                          <div className="flex-1">
                             <h5 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-4">
                               <History size={12} className="text-blue-600" /> NHẬT KÝ XỬ LÝ
                             </h5>
                             <div className="space-y-3">
                                {report.logs?.map((log, idx) => (
                                   <div key={idx} className="flex gap-4 items-start w-full">
                                     <span className={`font-extrabold text-[11px] w-24 shrink-0 truncate ${log.actor === 'Hệ thống' ? 'text-blue-500' : 'text-blue-600'}`}>{log.actor}:</span>
                                     <span className="text-[11px] text-gray-600 font-medium">{log.action}</span>
                                     <span className="text-[10px] text-gray-400 ml-auto shrink-0 font-medium">{log.time}</span>
                                   </div>
                                ))}
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
                                {report.evidence?.length > 0 && (
                                   <button className="w-16 h-12 rounded border border-gray-200 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition p-1">
                                      <ImageIcon size={14}/>
                                      <span className="text-[9px] font-bold mt-1 tracking-tighter">Xem tất cả</span>
                                   </button>
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
           <span className="text-[11px] text-gray-500 font-medium">Đang hiển thị <strong className="text-gray-700">{filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredReports.length)}</strong> trên tổng số <strong className="text-gray-700">{filteredReports.length}</strong> báo cáo</span>
           <div className="flex items-center gap-1">
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50">&lt;</button>
             {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
             ))}
             <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">&gt;</button>
           </div>
        </div>
      </div>

      {/* BOTTOM PANELS */}
      <div className="flex flex-col lg:flex-row gap-6">
         
         {/* LEFT PANEL: GHI CHÚ */}
         <div className="lg:w-1/2 bg-[#F6F9FC] border border-blue-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shrink-0 shadow-sm border border-blue-100">
               <Info size={16} />
            </div>
            <div>
               <h4 className="font-bold text-blue-800 text-[14px] mb-2">Ghi chú từ hệ thống</h4>
               <p className="text-xs text-blue-700/80 font-medium leading-relaxed max-w-[400px]">
                 Các báo cáo có nhãn "Hàng giả/nhái" cần được xử lý trong vòng 24h để đảm bảo uy tín của nền tảng. 
                 Vui lòng kiểm tra kỹ bằng chứng đính kèm trước khi đưa ra quyết định khóa cửa hàng hoặc gỡ sản phẩm.
               </p>
            </div>
         </div>

         {/* RIGHT PANEL: CHI TIẾT */}
         <div className="lg:w-1/2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-[16px] font-bold text-gray-800">Chi tiết Báo cáo</h3>
               <span className="px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-600 font-bold text-[10px] tracking-wider">#{selectedReport?.id.substring(3)}</span>
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
