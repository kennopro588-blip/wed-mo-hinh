import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { fetchProducts, fetchCategories, fetchBrands } from './services/apiService';
import Header from './components/Header';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import ReviewPage from './pages/ReviewPage';
import Admin from './pages/Admin';
import Collection from './pages/Collection';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ContactFloat from './components/ContactFloat';
import ChatWidget from './components/ChatWidget';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import AnnouncementBanner from './components/AnnouncementBanner';
import LoyaltyPoints from './pages/LoyaltyPoints';
import LuckyWheel from './components/LuckyWheel';
import UserOrders from './pages/UserOrders';



function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);


  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);


  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    // Seed 20 random discount codes if empty
    const existingCoupons = localStorage.getItem('discountCodes');
    if (!existingCoupons || JSON.parse(existingCoupons).length === 0) {
      const initialCoupons = [
        { id: 1, code: 'LUCKY10', type: 'percent', value: 10, minOrder: 0, maxUses: 1000, used: 0, expiry: '', active: true, description: 'Mã may mắn vòng quay' },
        { id: 2, code: 'LUCKY50K', type: 'fixed', value: 50000, minOrder: 0, maxUses: 1000, used: 0, expiry: '', active: true, description: 'Mã may mắn vòng quay' },
        { id: 3, code: 'LUCKYFS', type: 'fixed', value: 50000, minOrder: 0, maxUses: 1000, used: 0, expiry: '', active: true, description: 'Mã may mắn Freeship' },
        { id: 4, code: 'LUCKY100K', type: 'fixed', value: 100000, minOrder: 1000000, maxUses: 1000, used: 0, expiry: '', active: true, description: 'Mã may mắn giảm 100k' },
        { id: 5, code: 'LUCKY5', type: 'percent', value: 5, minOrder: 0, maxUses: 1000, used: 0, expiry: '', active: true, description: 'Mã may mắn giảm 5%' },
        { id: 6, code: 'WELCOME50', type: 'fixed', value: 50000, minOrder: 0, maxUses: 500, used: 0, expiry: '', active: true, description: 'Chào bạn mới giảm 50k' },
        { id: 7, code: 'VIP2026', type: 'percent', value: 15, minOrder: 2000000, maxUses: 100, used: 0, expiry: '2026-12-31', active: true, description: 'VIP giảm 15% đơn từ 2M' },
        { id: 8, code: 'TETAM', type: 'percent', value: 20, minOrder: 3000000, maxUses: 50, used: 0, expiry: '', active: true, description: 'Sale Tết Âm Lịch' },
        { id: 9, code: 'XMAS', type: 'fixed', value: 200000, minOrder: 5000000, maxUses: 20, used: 0, expiry: '', active: true, description: 'Giáng Sinh Giảm 200k' },
        { id: 10, code: 'SUMMER', type: 'percent', value: 10, minOrder: 0, maxUses: 200, used: 0, expiry: '', active: true, description: 'Chào hè giảm 10%' },
        { id: 11, code: 'FLASH100', type: 'fixed', value: 100000, minOrder: 0, maxUses: 10, used: 0, expiry: '', active: true, description: 'Flash sale giảm 100k' },
        { id: 12, code: 'POINT50', type: 'fixed', value: 50000, minOrder: 0, maxUses: 9999, used: 0, expiry: '', active: true, description: 'Đổi 500 điểm thưởng' },
        { id: 13, code: 'POINT100', type: 'fixed', value: 100000, minOrder: 0, maxUses: 9999, used: 0, expiry: '', active: true, description: 'Đổi 1000 điểm thưởng' },
        { id: 14, code: 'POINT200', type: 'fixed', value: 200000, minOrder: 0, maxUses: 9999, used: 0, expiry: '', active: true, description: 'Đổi 2000 điểm thưởng' },
        { id: 15, code: 'HALFWEEK', type: 'percent', value: 5, minOrder: 0, maxUses: 100, used: 0, expiry: '', active: true, description: 'Thứ 4 vui vẻ' },
        { id: 16, code: 'WEEKEND', type: 'fixed', value: 30000, minOrder: 0, maxUses: 100, used: 0, expiry: '', active: true, description: 'Cuối tuần bung xõa' },
        { id: 17, code: 'ANIMEFAN', type: 'percent', value: 10, minOrder: 1000000, maxUses: 500, used: 0, expiry: '', active: true, description: 'Dành cho fan Anime' },
        { id: 18, code: 'ONEPIECE', type: 'fixed', value: 150000, minOrder: 2000000, maxUses: 50, used: 0, expiry: '', active: true, description: 'Dành cho fan One Piece' },
        { id: 19, code: 'DRAGONBALL', type: 'fixed', value: 100000, minOrder: 1500000, maxUses: 50, used: 0, expiry: '', active: true, description: 'Dành cho fan Dragon Ball' },
        { id: 20, code: 'NARUTO', type: 'percent', value: 8, minOrder: 0, maxUses: 100, used: 0, expiry: '', active: true, description: 'Dành cho fan Naruto' }
      ];
      localStorage.setItem('discountCodes', JSON.stringify(initialCoupons));
    }

    try {
      const [productData, categoryData, brandData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands().catch(() => [])
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setBrands(brandData);
      setConnected(true);
    } catch (err) {
      console.error("Connection failed:", err);
      setError("Could not connect to the backend services. Please ensure the API Gateway and microservices are running.");
      setConnected(true); // Keep UI active for demo
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: (newCart[existingItemIndex].quantity || 1) + 1
        };
        return newCart;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const checkoutSelectedItems = (indicesToRemove) => {
    setCart(prevCart => prevCart.filter((_, i) => !indicesToRemove.includes(i)));
    alert('Thanh toán thành công các sản phẩm đã chọn!');
  };

  const updateQuantity = (index, delta) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      const newQuantity = (newCart[index].quantity || 1) + delta;
      if (newQuantity > 0) {
        newCart[index] = { ...newCart[index], quantity: newQuantity };
      }
      return newCart;
    });
  };

  const updateSize = (index, size) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart[index] = { ...newCart[index], selectedSize: size };
      return newCart;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };


  // Protected Route for Users
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Protected Route Wrapper for Admin
  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (!user.role || user.role.roleName !== 'ADMIN') {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Admin Layout - Completely Isolated */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <Admin 
              user={user} 
              products={products} 
              categories={categories}
              brands={brands}
              logout={logout} 
              loadData={loadData} 
            />
          </AdminRoute>
        } />

        {/* Public Store Layout */}
        <Route path="/*" element={
          <div className="App">
            <AnnouncementBanner />
            <Header 

              user={user} 
              logout={logout} 
              connected={connected} 
              categories={categories}
              brands={brands}
              cartCount={cart.length}
            />
            <main style={{ marginTop: '80px' }}>
              <Routes>
                <Route path="/" element={
                  <Home 
                    products={products} 
                    categories={categories}
                    loading={loading} 
                    error={error} 
                    loadData={loadData}
                    addToCart={addToCart}
                    user={user}
                  />
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart 
                      cart={cart} 
                      removeFromCart={removeFromCart} 
                      updateQuantity={updateQuantity} 
                      updateSize={updateSize}
                      checkoutSelectedItems={checkoutSelectedItems}
                    />
                  </ProtectedRoute>
                } />
                <Route path="/product/:id" element={
                  <ProtectedRoute>
                    <ProductDetail 
                      products={products}
                      addToCart={addToCart}
                      user={user}
                    />
                  </ProtectedRoute>
                } />
                <Route path="/product/:id/reviews" element={
                  <ProtectedRoute>
                    <ReviewPage products={products} />
                  </ProtectedRoute>
                } />
                <Route path="/collection/:type" element={
                  <ProtectedRoute>
                    <Collection 
                      products={products} 
                      loading={loading} 
                      error={error} 
                      addToCart={addToCart}
                      user={user}
                    />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout cart={cart} setCart={setCart} user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/payment/:orderId" element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/loyalty" element={<LoyaltyPoints user={user} />} />
                <Route path="/my-orders" element={<UserOrders user={user} />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="*" element={<Navigate to="/" />} />

              </Routes>
            </main>
            <ChatWidget isOpenExternal={isChatOpen} setIsOpenExternal={setIsChatOpen} />
            {!isChatOpen && <ContactFloat />}
            <LuckyWheel user={user} />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;

