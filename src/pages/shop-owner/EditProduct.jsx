// Sản phẩm
import React from 'react';
import ProductForm from '../../components/shop-owner/ProductForm';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy dữ liệu từ localStorage dựa trên ID
  const [initialData, setInitialData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const product = await ProductService.getProductById(id);
      if (product) {
        setInitialData(product);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Đang tải dữ liệu...</div>;

  if (!initialData) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 m-8">
        <h2 className="text-xl font-bold text-rose-500 mb-4">Lỗi: Không tìm thấy sản phẩm</h2>
        <button 
          onClick={() => navigate('/shop-owner/products')}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      <ProductForm isEdit={true} initialData={initialData} />
    </div>
  );
};

export default EditProduct;
