import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import sellerService from "../../services/SellerApplications";
import { FaStore, FaArrowLeft, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import "./SellerApplications.css";

const SellerApplications = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ storeName: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.storeName.trim()) {
            toast.error("Vui lòng nhập tên cửa hàng");
            return;
        }
        try {
            setLoading(true);
            await sellerService.submitApplication(formData);
            setSubmitted(true);
            toast.success("Đơn đăng ký đã được gửi thành công!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="seller-page">
                <div className="seller-card seller-success">
                    <FaCheckCircle className="seller-success-icon" />
                    <h2>Đơn đã được gửi!</h2>
                    <p>
                        Đơn đăng ký trở thành người bán hàng của bạn đã được gửi thành
                        công. Vui lòng chờ Admin xem xét và phê duyệt.
                    </p>
                    <button className="seller-success-btn" onClick={() => navigate("/")}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-page">
            <div className="seller-card">
                <Link to="/" className="seller-back">
                    <FaArrowLeft /> Về trang chủ
                </Link>

                <div className="seller-header">
                    <div className="seller-header-icon">
                        <FaStore />
                    </div>
                    <div>
                        <h2>Đăng ký bán hàng</h2>
                        <p>Trở thành người bán trên SmartAI Fashion</p>
                    </div>
                </div>

                <div className="seller-info">
                    <FaInfoCircle className="seller-info-icon" />
                    <p>
                        Sau khi gửi đơn, Admin sẽ xem xét và phê duyệt. Bạn sẽ được thông
                        báo khi đơn được duyệt và có thể bắt đầu đăng bán sản phẩm.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="seller-form-group">
                        <label className="seller-label">
                            Tên cửa hàng <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            placeholder="VD: Shop Thời Trang ABC"
                            className="seller-input"
                        />
                    </div>

                    <div className="seller-form-group">
                        <label className="seller-label">Mô tả cửa hàng</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Giới thiệu ngắn về cửa hàng của bạn..."
                            rows={4}
                            className="seller-textarea"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="seller-submit">
                        {loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerApplications;
