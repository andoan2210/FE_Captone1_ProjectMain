import api from "./api";

const sellerService = {
    // Gửi đơn đăng ký trở thành người bán hàng
    submitApplication: async (data) => {
        try {
            const res = await api.post("/store", {
                storeName: data.storeName.trim(),
                description: data.description.trim(),
            });
            return res.data;
        } catch (error) {
            console.error("SUBMIT SELLER APPLICATION ERROR:", error);
            throw new Error(
                error.response?.data?.message || "Gửi đơn thất bại, vui lòng thử lại"
            );
        }
    },
};

export default sellerService;
