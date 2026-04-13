import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaTrash } from "react-icons/fa";
import TryonService from "../../services/TryonService";
import "./TryonHistory.css";

const TryonHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory(page);
  }, [page]);

  const loadHistory = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const response = await TryonService.getTryonHistory(pageNum, 10);
      setHistory(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Không thể tải lịch sử thử đồ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl, tryId) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `tryon-${tryId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tryon-history-container">
      <div className="history-header">
        <button
          className="back-button"
          onClick={() => navigate("/ai-virtual-tryon")}
          title="Quay lại"
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Lịch Sử Thử Đồ</h1>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👗</div>
          <p className="empty-title">Chưa có lịch sử thử đồ</p>
          <p className="empty-desc">Hãy thử đồ với AI để xem lịch sử ở đây</p>
          <Link to="/ai-virtual-tryon" className="btn-primary">
            Thử đồ ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.TryId} className="history-card">
                <div className="card-image">
                  <img
                    src={item.TryImageUrl}
                    alt="Try-on result"
                    className="result-image"
                  />
                </div>
                <div className="card-content">
                  <h3 className="product-name">
                    {item.Products?.ProductName || "Sản phẩm"}
                  </h3>
                  <p className="try-date">
                    {new Date(item.CreatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {item.Products?.Price && (
                    <p className="product-price">
                      {item.Products.Price.toLocaleString("vi-VN")}đ
                    </p>
                  )}
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleDownload(item.TryImageUrl, item.TryId)}
                    className="action-btn download-btn"
                    title="Tải ảnh"
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="page-btn"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="page-btn"
              >
                Tiếp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TryonHistory;
