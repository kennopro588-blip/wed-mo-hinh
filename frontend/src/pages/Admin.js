import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';
import { fetchUsers, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, createBrand, updateBrand, deleteBrand } from '../services/apiService';

const Admin = ({ user, products, categories, brands, logout, loadData }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const fileInputRef = React.useRef(null);
  const fileInputRef2 = React.useRef(null);

  // Order management state
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Announcement state
  const emptyAnnouncement = {
    id: null,
    text: '',
    type: 'sale',
    link: '',
    linkLabel: 'Xem ngay',
    duration: 10,
    active: false,
  };

  const [announcements, setAnnouncements] = useState(() => {
    let saved = JSON.parse(localStorage.getItem('announcements') || 'null');
    if (!saved) {
      const old = JSON.parse(localStorage.getItem('announcement') || 'null');
      saved = old ? [old] : [];
      localStorage.setItem('announcements', JSON.stringify(saved));
    }
    return saved;
  });

  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  const handleSaveAnnouncement = () => {
    if (!announcementForm.text) {
      alert("Vui lòng nhập nội dung thông báo!");
      return;
    }
    const isNew = !announcementForm.id;
    const newAnnouncement = { ...announcementForm, id: announcementForm.id || Date.now() };
    
    // If setting to active, deactivate all others
    let updatedList = announcements.map(a => {
      if (newAnnouncement.active) return { ...a, active: false };
      return a;
    });

    if (isNew) {
      updatedList.push(newAnnouncement);
    } else {
      updatedList = updatedList.map(a => a.id === newAnnouncement.id ? newAnnouncement : a);
    }

    setAnnouncements(updatedList);
    localStorage.setItem('announcements', JSON.stringify(updatedList));
    setShowAnnouncementForm(false);
    setAnnouncementForm(emptyAnnouncement);
    alert('Đã lưu thông báo thành công!');
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm('Xóa thông báo này?')) {
      const updated = announcements.filter(a => a.id !== id);
      setAnnouncements(updated);
      localStorage.setItem('announcements', JSON.stringify(updated));
    }
  };

  const toggleAnnouncementActive = (id, currentActiveStatus) => {
    const updated = announcements.map(a => {
      if (a.id === id) return { ...a, active: !currentActiveStatus };
      if (!currentActiveStatus) return { ...a, active: false }; // Deactivate others if we are activating this one
      return a;
    });
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
  };



  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Coupon State
  const [coupons, setCoupons] = useState(() => JSON.parse(localStorage.getItem('discountCodes') || '[]'));
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ id: null, code: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, used: 0, expiry: '', active: true, description: '' });
  const [userFormData, setUserFormData] = useState({ id: null, userName: '', password: '', role: { id: 2, roleName: 'USER' }, active: 1 });
  const [formData, setFormData] = useState({
    id: null,
    productName: '',
    category: categories && categories.length > 0 ? categories[0].categoryName : 'Anime',
    brand: brands && brands.length > 0 ? brands[0].brandName : '',
    price: 0,
    discription: '',
    imageUrl: '',
    imageUrl2: '',
    discountPercent: 0,
    availability: 1,
    section: 'Normal'
  });

  const [categoryFormData, setCategoryFormData] = useState({
    id: null,
    categoryName: '',
    imageUrl: ''
  });

  const [brandFormData, setBrandFormData] = useState({
    id: null,
    brandName: '',
    logoUrl: ''
  });

  const [availableSections, setAvailableSections] = useState(() => {
    const saved = localStorage.getItem('availableSections');
    return saved ? JSON.parse(saved) : ['Normal', 'Best Selling', 'Exclusive', 'New Arrivals', 'On Sale'];
  });
  const [newSectionName, setNewSectionName] = useState('');

  useEffect(() => {
    localStorage.setItem('availableSections', JSON.stringify(availableSections));
  }, [availableSections]);

  useEffect(() => {
    // Always load orders and users for dashboard stats
    loadOrders();
    if (users.length === 0) {
      loadUsers();
    }
  }, []);


  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load orders from localStorage (VNPay orders stored locally)
  const loadOrders = () => {
    const stored = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    setOrders(stored);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    localStorage.setItem('adminOrders', JSON.stringify(updated));
  };

  const deleteOrder = (orderId) => {
    if (!window.confirm('Xóa đơn hàng này?')) return;
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem('adminOrders', JSON.stringify(updated));
  };

  const getStatusInfo = (status) => {
    const map = {
      'PENDING':    { label: 'Chờ xử lý',     color: '#f39c12', bg: 'rgba(243,156,18,0.15)' },
      'CONFIRMED':  { label: 'Đã xác nhận',   color: '#3498db', bg: 'rgba(52,152,219,0.15)' },
      'SHIPPING':   { label: 'Đang giao',      color: '#9b59b6', bg: 'rgba(155,89,182,0.15)' },
      'DELIVERED':  { label: 'Đã giao',        color: '#2ecc71', bg: 'rgba(46,204,113,0.15)' },
      'CANCELLED':  { label: 'Đã hủy',         color: '#e74c3c', bg: 'rgba(231,76,60,0.15)'  },
    };
    return map[status] || { label: status, color: '#888', bg: 'rgba(136,136,136,0.1)' };
  };

  const getPaymentBadge = (method) => {
    if (method === 'vnpay') return { label: 'VNPay', color: '#005baa' };
    if (method === 'cod')   return { label: 'COD',   color: '#27ae60' };
    if (method === 'bank')  return { label: 'Bank',  color: '#8e44ad' };
    return { label: method || 'N/A', color: '#888' };
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderFilter === 'ALL' || o.status === orderFilter;
    const q = orderSearch.toLowerCase();
    const matchSearch = !q ||
      o.id?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.phone?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const orderStats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'PENDING').length,
    shipping:  orders.filter(o => o.status === 'SHIPPING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue:   orders.filter(o => o.status !== 'CANCELLED')
                     .reduce((s, o) => s + (o.total || 0), 0),
  };

  // Calculate Chart Data (Last 7 Days)
  const getChartData = () => {
    const data = [0, 0, 0, 0, 0, 0, 0];
    const labels = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Generate labels
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(`T${d.getDate()}`);
    }

    orders.forEach(o => {
      if (o.status !== 'CANCELLED' && o.date) {
        // Assume o.date is a string parsable by Date or DD/MM/YYYY
        let dStr = o.date;
        // Basic parsing if DD/MM/YYYY
        if (dStr.includes('/')) {
            const parts = dStr.split(/[ /:-]/);
            if(parts.length >= 3) {
              // try parsing as DD/MM/YYYY
              dStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const orderDate = new Date(dStr);
        if(!isNaN(orderDate)) {
           const diffTime = today - orderDate;
           const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
           if (diffDays >= 0 && diffDays < 7) {
             data[6 - diffDays] += (o.total || 0);
           }
        }
      }
    });

    const maxVal = Math.max(...data, 10000); // minimum scale
    return data.map((val, idx) => ({
      label: labels[idx],
      val,
      height: Math.max((val / maxVal) * 100, 5) // at least 5% height to be visible
    }));
  };

  const chartData = getChartData();

  // Generate Recent Activities
  const getRecentActivities = () => {
    let acts = [];
    // Add recent orders
    const sortedOrders = [...orders].reverse().slice(0, 5); // Assuming latest are at the end, or just take last 5
    sortedOrders.forEach((o, i) => {
      acts.push({
        id: `order-${o.id}-${i}`,
        icon: o.status === 'DELIVERED' ? '📦' : '💰',
        bg: o.status === 'DELIVERED' ? '#fff3e0' : '#e8f5e9',
        color: o.status === 'DELIVERED' ? '#ff9800' : '#4caf50',
        title: `Đơn hàng #${o.id?.slice(-6) || o.id} ${o.status === 'DELIVERED' ? 'đã giao' : 'đã thanh toán'}`,
        time: o.date || 'Gần đây',
        sortScore: 100 - i // just a simple sort priority
      });
    });

    // Add recent users if we have them
    if (users && users.length > 0) {
      const recentUsers = [...users].reverse().slice(0, 2);
      recentUsers.forEach((u, i) => {
        acts.push({
          id: `user-${u.id}-${i}`,
          icon: '👤',
          bg: '#e1f5fe',
          color: '#03a9f4',
          title: `Người dùng ${u.userName} mới đăng ký`,
          time: 'Gần đây',
          sortScore: 90 - i
        });
      });
    }

    // Add a default one if empty
    if (acts.length === 0) {
      acts.push({
        id: 'default', icon: '⭐', bg: '#fce4ec', color: '#e91e63',
        title: 'Hệ thống đã khởi động thành công', time: 'Vừa xong', sortScore: 0
      });
    }

    return acts.sort((a,b) => b.sortScore - a.sortScore).slice(0, 5);
  };

  const recentActivities = getRecentActivities();


  // CRUD Handlers
  const openAddModal = () => {
    setFormData({ id: null, productName: '', category: 'Anime', price: 0, discription: '', imageUrl: '', imageUrl2: '', discountPercent: 0, availability: 1, section: 'Normal' });
    setShowModal(true);
  };

  const openAddCategoryModal = () => {
    setCategoryFormData({ id: null, categoryName: '', imageUrl: '' });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setCategoryFormData(cat);
    setShowCategoryModal(true);
  };

  const addSection = () => {
    if (newSectionName && !availableSections.includes(newSectionName)) {
      setAvailableSections([...availableSections, newSectionName]);
      setNewSectionName('');
    }
  };

  const openEditModal = (product) => {
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id);
        loadData(); // Refresh list
      } catch (err) {
        alert('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Ensure numeric fields are correctly typed before sending to backend
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      discountPercent: parseInt(formData.discountPercent || 0, 10),
      availability: parseInt(formData.availability || 1, 10)
    };

    try {
      if (formData.id) {
        await updateProduct(formData.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      loadData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu sản phẩm. Vui lòng kiểm tra lại kết nối.');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (categoryFormData.id) {
        await updateCategory(categoryFormData.id, categoryFormData);
      } else {
        await createCategory(categoryFormData);
      }
      setShowCategoryModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu danh mục');
    }
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    try {
      if (brandFormData.id) {
        await updateBrand(brandFormData.id, brandFormData);
      } else {
        await createBrand(brandFormData);
      }
      setShowBrandModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu hãng sản xuất');
    }
  };

  const handleDeleteBrand = async (id) => {
    if (window.confirm('Xóa hãng này?')) {
      try {
        await deleteBrand(id);
        loadData();
      } catch (err) {
        alert('Lỗi khi xóa hãng');
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Xóa danh mục này?')) {
      try {
        await deleteCategory(id);
        loadData();
      } catch (err) {
        alert('Lỗi khi xóa danh mục');
      }
    }
  };

  // User Handlers (Local Simulation for Admin since backend might not have full CRUD)
  const handleSaveUser = () => {
    if (!userFormData.userName) {
      alert('Vui lòng nhập tên đăng nhập');
      return;
    }
    const isNew = !userFormData.id;
    if (isNew) {
      const newUser = {
        ...userFormData,
        id: Date.now(), // Local mock ID
      };
      setUsers([...users, newUser]);
      alert('Đã thêm người dùng thành công (Local)');
    } else {
      setUsers(users.map(u => u.id === userFormData.id ? userFormData : u));
      alert('Đã cập nhật người dùng thành công (Local)');
    }
    setShowUserModal(false);
  };

  const handleToggleLockUser = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, active: u.active === 1 ? 0 : 1 };
      }
      return u;
    }));
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Chắc chắn xóa người dùng này?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Coupon Handlers
  const handleSaveCoupon = () => {
    if (!couponForm.code.trim()) { alert('Vui lòng nhập mã giảm giá'); return; }
    if (couponForm.value <= 0) { alert('Giá trị giảm phải > 0'); return; }
    let updated;
    if (couponForm.id) {
      updated = coupons.map(c => c.id === couponForm.id ? couponForm : c);
    } else {
      const newCoupon = { ...couponForm, id: Date.now(), used: 0 };
      // Check duplicate code
      if (coupons.find(c => c.code.toUpperCase() === newCoupon.code.toUpperCase())) {
        alert('Mã giảm giá này đã tồn tại!'); return;
      }
      updated = [...coupons, { ...newCoupon, code: newCoupon.code.toUpperCase() }];
    }
    setCoupons(updated);
    localStorage.setItem('discountCodes', JSON.stringify(updated));
    setShowCouponModal(false);
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm('Xóa mã giảm giá này?')) {
      const updated = coupons.filter(c => c.id !== id);
      setCoupons(updated);
      localStorage.setItem('discountCodes', JSON.stringify(updated));
    }
  };

  const handleToggleCoupon = (id) => {
    const updated = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setCoupons(updated);
    localStorage.setItem('discountCodes', JSON.stringify(updated));
  };

  const exportDataToWord = (title, contentHtml) => {
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; color: #333; }
      h1, h2 { color: #2c3e50; }
    </style></head><body>
    <h1>${title}</h1>
    <p>Thời gian xuất: ${new Date().toLocaleString('vi-VN')}</p>
    <hr/>
    ${contentHtml}`;
    const postHtml = "</body></html>";
    const html = preHtml + postHtml;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const finalFilename = title.replace(/ /g, '_') + '.doc';
    const downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, finalFilename);
    } else {
        downloadLink.href = url;
        downloadLink.download = finalFilename;
        downloadLink.click();
    }
    document.body.removeChild(downloadLink);
  };

  const handleExportUsers = () => {
    let html = '<table><thead><tr><th>ID</th><th>Tên Đăng Nhập</th><th>Quyền Hạn</th><th>Trạng Thái</th></tr></thead><tbody>';
    users.forEach(u => {
       html += `<tr><td>#${u.id}</td><td>${u.userName}</td><td>${u.role ? u.role.roleName : 'USER'}</td><td>${u.active === 1 ? 'Hoạt động' : 'Đã khóa'}</td></tr>`;
    });
    html += '</tbody></table>';
    exportDataToWord('Danh Sach Nguoi Dung', html);
    setShowExportModal(false);
  };

  const handleExportOrders = () => {
    let html = '<table><thead><tr><th>Mã Đơn</th><th>Khách Hàng</th><th>Sản Phẩm</th><th>Tổng Tiền</th><th>Ngày Đặt</th><th>Trạng Thái</th></tr></thead><tbody>';
    orders.forEach(o => {
       html += `<tr><td>#${o.id}</td><td>${o.customerName || 'N/A'}</td><td>${o.items?.length || 0} SP</td><td>${o.total?.toLocaleString() || 0} VND</td><td>${o.date || ''}</td><td>${o.status}</td></tr>`;
    });
    html += '</tbody></table>';
    exportDataToWord('Danh Sach Don Hang', html);
    setShowExportModal(false);
  };

  const handleExportRevenue = () => {
    let html = `
      <h2>Thống Kê Tổng Quan</h2>
      <ul>
        <li>Tổng Sản Phẩm: ${products?.length || 0}</li>
        <li>Tổng Số Đơn Hàng: ${orderStats.total}</li>
        <li>Đơn Hàng Mới (Chờ xử lý): ${orderStats.pending}</li>
        <li>Đơn Hàng Đã Giao: ${orderStats.delivered}</li>
        <li><strong>Tổng Doanh Thu: ${orderStats.revenue.toLocaleString()} VNĐ</strong></li>
      </ul>
      <h2>Chi tiết theo ngày (7 ngày qua)</h2>
      <table><thead><tr><th>Ngày</th><th>Doanh Thu (VNĐ)</th></tr></thead><tbody>
    `;
    chartData.forEach(item => {
      html += `<tr><td>${item.label}</td><td>${item.val.toLocaleString()} VNĐ</td></tr>`;
    });
    html += '</tbody></table>';
    exportDataToWord('Bao Cao Doanh Thu', html);
    setShowExportModal(false);
  };


  // Stock management via localStorage overrides
  const getStock = (productId) => {
    const overrides = JSON.parse(localStorage.getItem('stockOverrides') || '{}');
    const key = `product_${productId}`;
    return overrides[key] !== undefined ? overrides[key] : null;
  };

  const updateStock = (productId, newStock) => {
    const overrides = JSON.parse(localStorage.getItem('stockOverrides') || '{}');
    overrides[`product_${productId}`] = parseInt(newStock, 10);
    localStorage.setItem('stockOverrides', JSON.stringify(overrides));
  };



  const compressImage = (base64Str, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
    });
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        setFormData({ ...formData, [fieldName]: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h3>Quản Trị Viên</h3>
          <p style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>Chào, {user?.userName}</p>
        </div>
        <ul className="sidebar-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 Tổng Quan
          </li>
          <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>📦 Sản Phẩm</li>
          <li className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>📁 Danh Mục</li>
          <li className={activeTab === 'brands' ? 'active' : ''} onClick={() => setActiveTab('brands')}>🏭 Hãng Sản Xuất</li>
          <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>🛒 Đơn Hàng</li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 Người Dùng</li>
          <li className={activeTab === 'announcement' ? 'active' : ''} onClick={() => setActiveTab('announcement')}>📣 Thông Báo</li>
          <li className={activeTab === 'coupons' ? 'active' : ''} onClick={() => setActiveTab('coupons')}>🎫 Mã Giảm Giá</li>

        </ul>
        
        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #34495e' }}>
          <Link to="/" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>
            ⬅ Về Cửa Hàng
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h2>
            {activeTab === 'dashboard' && 'Bảng Điều Khiển'}
            {activeTab === 'products' && 'Quản Lý Sản Phẩm'}
            {activeTab === 'categories' && 'Quản Lý Danh Mục'}
            {activeTab === 'brands' && 'Quản Lý Hãng Sản Xuất'}
            {activeTab === 'orders' && 'Quản Lý Đơn Hàng'}
            {activeTab === 'users' && 'Quản Lý Người Dùng'}
            {activeTab === 'announcement' && 'Quản Lý Thông Báo'}
            {activeTab === 'coupons' && 'Quản Lý Mã Giảm Giá'}

          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-admin" style={{ background: '#2980b9' }} onClick={() => setShowExportModal(true)}>📥 Xuất Báo Cáo</button>
            <button className="btn-admin" style={{ background: '#34495e' }}>Cài Đặt</button>
            <button className="btn-admin" style={{ background: '#e74c3c' }} onClick={logout}>Đăng Xuất</button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="admin-stats">
              <div className="stat-card" style={{ borderBottomColor: '#3498db', background: 'linear-gradient(135deg, #ffffff 0%, #f1f8ff 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#34495e', fontWeight: 600 }}>Tổng Sản Phẩm</h4>
                  <span style={{ fontSize: '1.5rem' }}>📦</span>
                </div>
                <div className="stat-value" style={{ color: '#2980b9' }}>{products?.length || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#27ae60', marginTop: '8px', fontWeight: 'bold' }}>↑ 12% so với tháng trước</div>
              </div>
              <div className="stat-card" style={{ borderBottomColor: '#2ecc71', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#34495e', fontWeight: 600 }}>Doanh Thu</h4>
                  <span style={{ fontSize: '1.5rem' }}>💰</span>
                </div>
                <div className="stat-value" style={{ color: '#27ae60' }}>{orderStats?.revenue?.toLocaleString() || '0'} VNĐ</div>
                <div style={{ fontSize: '0.8rem', color: '#27ae60', marginTop: '8px', fontWeight: 'bold' }}>↑ 8% so với tháng trước</div>
              </div>
              <div className="stat-card" style={{ borderBottomColor: '#e74c3c', background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#34495e', fontWeight: 600 }}>Đơn Hàng Mới</h4>
                  <span style={{ fontSize: '1.5rem' }}>🛒</span>
                </div>
                <div className="stat-value" style={{ color: '#c0392b' }}>{orderStats?.pending || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '8px', fontWeight: 'bold' }}>Cần xử lý ngay</div>
              </div>
              <div className="stat-card" style={{ borderBottomColor: '#f1c40f', background: 'linear-gradient(135deg, #ffffff 0%, #fffdf0 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#34495e', fontWeight: 600 }}>Khách Hàng</h4>
                  <span style={{ fontSize: '1.5rem' }}>👥</span>
                </div>
                <div className="stat-value" style={{ color: '#f39c12' }}>{users?.length || 1}</div>
                <div style={{ fontSize: '0.8rem', color: '#27ae60', marginTop: '8px', fontWeight: 'bold' }}>↑ 3 user mới hôm nay</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              {/* Fake Chart CSS */}
              <div className="admin-content-area" style={{ flex: 2, minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Biểu Đồ Doanh Thu (7 Ngày Qua)</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>Thống kê doanh thu bán hàng hàng tuần</p>
                <div className="chart-container" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '250px', gap: '2%', marginTop: '40px', paddingBottom: '10px', borderBottom: '2px solid #ecf0f1', position: 'relative' }}>
                  {/* Grid lines */}
                  <div style={{ position: 'absolute', top: '0', left: 0, right: 0, borderTop: '1px dashed #ecf0f1', zIndex: 0 }}></div>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #ecf0f1', zIndex: 0 }}></div>
                  
                  {/* Real calculated bars */}
                  {chartData.map((item, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1, height: '100%', justifyContent: 'flex-end' }}>
                      <div className="chart-bar" style={{ 
                        width: '100%', 
                        maxWidth: '40px',
                        height: `${item.height}%`, 
                        background: 'linear-gradient(to top, #3498db, #2ecc71)', 
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}>
                        <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 'bold', color: '#7f8c8d' }}>
                          {item.val > 0 ? `${(item.val / 1000).toFixed(0)}k` : '0'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#95a5a6', fontWeight: 600 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="admin-content-area" style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Hoạt Động Gần Đây</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentActivities.map(act => (
                    <li key={act.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f2f6', display: 'flex', gap: '15px' }}>
                      <div style={{ background: act.bg, color: act.color, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>{act.icon}</div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#2c3e50' }}>{act.title}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#7f8c8d' }}>{act.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="btn-admin" style={{ width: '100%', marginTop: '15px', background: '#ecf0f1', color: '#2c3e50' }}>Xem tất cả</button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="admin-content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Danh Sách Sản Phẩm</h3>
              <button className="btn-admin" onClick={openAddModal}>+ Thêm Sản Phẩm</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Danh Mục</th>
                  <th>Giá gốc</th>
                  <th>Giảm (%)</th>
                  <th style={{color:'#2ecc71'}}>Tồn kho</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {products?.map(p => {
                  const stockVal = getStock(p.id) !== null ? getStock(p.id) : p.availability;
                  return (
                  <tr key={p.id}>
                    <td>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.productName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '0.8rem' }}>N/A</div>
                      )}
                    </td>
                    <td>{p.productName}</td>
                    <td>{p.category}</td>
                    <td>{(p.price * 1000)?.toLocaleString()} đ</td>
                    <td>{p.discountPercent > 0 ? <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>-{p.discountPercent}%</span> : '0%'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          defaultValue={stockVal}
                          style={{
                            width: '65px', padding: '4px 8px', background: '#1e2a38',
                            color: stockVal <= 0 ? '#e74c3c' : stockVal <= 5 ? '#e67e22' : '#2ecc71',
                            border: '1px solid #34495e', borderRadius: '6px', textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                          onBlur={(e) => updateStock(p.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && updateStock(p.id, e.target.value)}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>sp</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-admin" style={{ background: '#f39c12' }} onClick={() => openEditModal(p)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(p.id)}>Xóa</button>
                    </td>
                  </tr>
                  );
                })}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Danh Sách Danh Mục</h3>
              <button className="btn-admin" onClick={openAddCategoryModal}>+ Thêm Danh Mục</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Danh Mục</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map(c => (
                  <tr key={c.id}>
                    <td>
                      <img src={c.imageUrl} alt={c.categoryName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{c.categoryName}</td>
                    <td>
                      <button className="btn-admin" style={{ background: '#f39c12' }} onClick={() => openEditCategoryModal(c)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDeleteCategory(c.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {(!categories || categories.length === 0) && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="admin-content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Danh Sách Hãng Sản Xuất</h3>
              <button className="btn-admin" onClick={() => { setBrandFormData({ id: null, brandName: '', logoUrl: '' }); setShowBrandModal(true); }}>+ Thêm Hãng</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Tên Hãng</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {brands?.map(b => (
                  <tr key={b.id}>
                    <td>
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt={b.brandName} style={{ width: '60px', height: 'auto', maxHeight: '40px', objectFit: 'contain' }} />
                      ) : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{b.brandName}</td>
                    <td>
                      <button className="btn-admin" style={{ background: '#f39c12' }} onClick={() => { setBrandFormData(b); setShowBrandModal(true); }}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDeleteBrand(b.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {(!brands || brands.length === 0) && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="admin-content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Danh Sách Người Dùng</h3>
              <div>
                <button className="btn-admin" onClick={() => { setUserFormData({ id: null, userName: '', password: '', role: { id: 2, roleName: 'USER' }, active: 1 }); setShowUserModal(true); }} style={{ marginRight: '10px' }}>+ Thêm Mới</button>
                <button className="btn-admin" style={{ background: '#34495e' }} onClick={loadUsers}>Làm Mới (API)</button>
              </div>
            </div>
            {loadingUsers ? <p>Đang tải...</p> : (
              <table className="admin-table" id="userTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Đăng Nhập</th>
                    <th>Quyền Hạn</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.userName}</td>
                      <td>{u.role ? u.role.roleName : 'USER'}</td>
                      <td>{u.active === 1 ? 'Hoạt động' : 'Đã khóa'}</td>
                      <td>
                        <button className="btn-admin" style={{ background: '#f39c12' }} onClick={() => { setUserFormData(u); setShowUserModal(true); }}>Sửa</button>
                        <button className="btn-delete" style={{ background: u.active === 1 ? '#e74c3c' : '#2ecc71', marginLeft: '5px' }} onClick={() => handleToggleLockUser(u.id)}>
                          {u.active === 1 ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button className="btn-delete" style={{ background: '#c0392b', marginLeft: '5px' }} onClick={() => handleDeleteUser(u.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                  {(!users || users.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>Không có người dùng nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-content-area">
            {/* Order Stats */}
            <div className="order-stats-row">
              <div className="order-stat-card" style={{ borderColor: '#3498db' }}>
                <div className="osc-icon">📋</div>
                <div className="osc-val">{orderStats.total}</div>
                <div className="osc-label">Tổng đơn</div>
              </div>
              <div className="order-stat-card" style={{ borderColor: '#f39c12' }}>
                <div className="osc-icon">⏳</div>
                <div className="osc-val">{orderStats.pending}</div>
                <div className="osc-label">Chờ xử lý</div>
              </div>
              <div className="order-stat-card" style={{ borderColor: '#9b59b6' }}>
                <div className="osc-icon">🚚</div>
                <div className="osc-val">{orderStats.shipping}</div>
                <div className="osc-label">Đang giao</div>
              </div>
              <div className="order-stat-card" style={{ borderColor: '#2ecc71' }}>
                <div className="osc-icon">✅</div>
                <div className="osc-val">{orderStats.delivered}</div>
                <div className="osc-label">Đã giao</div>
              </div>
              <div className="order-stat-card" style={{ borderColor: '#d4af37' }}>
                <div className="osc-icon">💰</div>
                <div className="osc-val">{orderStats.revenue.toLocaleString()}</div>
                <div className="osc-label">Doanh thu (VNĐ)</div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="order-toolbar">
              <div className="order-search-wrap">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tên khách, SĐT..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="order-search-input"
                />
              </div>
              <div className="order-filter-tabs">
                {['ALL','PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED'].map(s => (
                  <button
                    key={s}
                    className={`ofilter-btn ${orderFilter === s ? 'active' : ''}`}
                    onClick={() => setOrderFilter(s)}
                  >
                    {s === 'ALL' ? 'Tất cả' : getStatusInfo(s).label}
                  </button>
                ))}
              </div>
              <button className="btn-admin" onClick={loadOrders}>🔄 Làm mới</button>
            </div>

            {/* Table */}
            {filteredOrders.length === 0 ? (
              <div className="order-empty">
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📦</div>
                <p>Chưa có đơn hàng nào.</p>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Đơn hàng sẽ xuất hiện sau khi khách thanh toán VNPay thành công.</p>
              </div>
            ) : (
              <div className="order-table-wrap">
                <table className="admin-table order-table" id="orderTable">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th>Tổng tiền</th>
                      <th>Thanh toán</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const st = getStatusInfo(order.status);
                      const pm = getPaymentBadge(order.paymentMethod);
                      return (
                        <tr key={order.id}>
                          <td><span className="order-id-badge">#{order.id?.slice(-8)}</span></td>
                          <td>
                            <div className="customer-cell">
                              <strong>{order.customerName || 'N/A'}</strong>
                              <span>{order.phone || ''}</span>
                            </div>
                          </td>
                          <td>
                            <span className="item-count-badge">
                              {order.items?.length || 0} sản phẩm
                            </span>
                          </td>
                          <td><strong style={{ color: '#d4af37' }}>{order.total?.toLocaleString()} VNĐ</strong></td>
                          <td>
                            <span className="payment-badge" style={{ background: pm.color }}>
                              {pm.label}
                            </span>
                          </td>
                          <td style={{ color: '#888', fontSize: '0.85rem' }}>{order.date || ''}</td>
                          <td>
                            <span className="status-badge" style={{ color: st.color, background: st.bg }}>
                              {st.label}
                            </span>
                          </td>
                          <td>
                            <div className="order-actions">
                              <button className="btn-admin" style={{ background: '#3498db', padding: '5px 10px', fontSize: '0.8rem' }}
                                onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                                👁 Chi tiết
                              </button>
                              <select
                                className="status-select"
                                value={order.status}
                                onChange={e => updateOrderStatus(order.id, e.target.value)}
                              >
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="CONFIRMED">Xác nhận</option>
                                <option value="SHIPPING">Đang giao</option>
                                <option value="DELIVERED">Đã giao</option>
                                <option value="CANCELLED">Hủy</option>
                              </select>
                              <button className="btn-delete" style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                onClick={() => deleteOrder(order.id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcement' && (
          <div className="admin-content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Quản Lý Thông Báo (Banner)</h3>
              <button className="btn-admin" onClick={() => { setAnnouncementForm(emptyAnnouncement); setShowAnnouncementForm(!showAnnouncementForm); }}>
                {showAnnouncementForm ? 'Đóng Form' : '+ Thêm Thông Báo Mới'}
              </button>
            </div>
            
            {!showAnnouncementForm ? (
              <>
                <p style={{ color: '#bdc3c7', marginBottom: '20px' }}>
                  Danh sách các thông báo hiển thị ở đầu trang web. Bạn chỉ có thể kích hoạt 1 thông báo hiển thị tại một thời điểm.
                </p>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nội dung</th>
                      <th>Loại</th>
                      <th>Link / Nút</th>
                      <th>Tốc độ (s)</th>
                      <th>Trạng thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(a => (
                      <tr key={a.id}>
                        <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</td>
                        <td>
                          {a.type === 'sale' ? '🔴 Khuyến mãi' : a.type === 'new' ? '🟡 Hàng mới' : a.type === 'info' ? '🔵 Thông tin' : '🟠 Cảnh báo'}
                        </td>
                        <td>{a.link ? <a href={a.link} target="_blank" rel="noreferrer" style={{color: '#3498db'}}>{a.linkLabel}</a> : 'Không'}</td>
                        <td>{a.duration}s</td>
                        <td>
                          <button 
                            className="btn-admin" 
                            style={{ background: a.active ? '#2ecc71' : '#7f8c8d', padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => toggleAnnouncementActive(a.id, a.active)}
                          >
                            {a.active ? 'Đang bật' : 'Tắt'}
                          </button>
                        </td>
                        <td>
                          <button className="btn-admin" style={{ background: '#f39c12' }} onClick={() => { setAnnouncementForm(a); setShowAnnouncementForm(true); }}>Sửa</button>
                          <button className="btn-delete" onClick={() => handleDeleteAnnouncement(a.id)}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                    {announcements.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>Chưa có thông báo nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="announcement-form-card" style={{ background: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
                <h4>{announcementForm.id ? 'Sửa thông báo' : 'Thêm thông báo mới'}</h4>
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label>Nội dung thông báo (chữ sẽ chạy vòng lặp):</label>
                  <input 
                    type="text" 
                    value={announcementForm.text} 
                    onChange={(e) => setAnnouncementForm({...announcementForm, text: e.target.value})} 
                    placeholder="Vd: 🔥 Siêu Sale 11/11 giảm giá lên tới 50% toàn bộ mặt hàng!" 
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Giao diện nền:</label>
                    <select 
                      value={announcementForm.type} 
                      onChange={(e) => setAnnouncementForm({...announcementForm, type: e.target.value})}
                    >
                      <option value="sale">Khuyến mãi (Đỏ)</option>
                      <option value="new">Hàng mới (Đen/Vàng)</option>
                      <option value="info">Thông tin (Xanh dương)</option>
                      <option value="warning">Cảnh báo (Cam)</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Tốc độ vòng lặp (giây):</label>
                    <input 
                      type="number" 
                      value={announcementForm.duration} 
                      onChange={(e) => setAnnouncementForm({...announcementForm, duration: parseInt(e.target.value) || 10})} 
                      min="1" 
                      title="Thời gian để dòng chữ chạy hết màn hình"
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Đường dẫn liên kết (khi nhấn vào nút):</label>
                    <input 
                      type="text" 
                      value={announcementForm.link} 
                      onChange={(e) => setAnnouncementForm({...announcementForm, link: e.target.value})} 
                      placeholder="https://... (để trống nếu không cần nút)" 
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Chữ trên nút:</label>
                    <input 
                      type="text" 
                      value={announcementForm.linkLabel} 
                      onChange={(e) => setAnnouncementForm({...announcementForm, linkLabel: e.target.value})} 
                      placeholder="Vd: Xem ngay" 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={announcementForm.active} 
                      onChange={(e) => setAnnouncementForm({...announcementForm, active: e.target.checked})} 
                      style={{ width: '20px', height: '20px' }}
                    />
                    <strong>Kích hoạt thông báo này ngay</strong> (Sẽ tắt các thông báo khác)
                  </label>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button className="btn-admin" onClick={handleSaveAnnouncement}>
                    💾 Lưu Thông Báo
                  </button>
                  <button className="btn-admin" style={{ background: '#7f8c8d' }} onClick={() => setShowAnnouncementForm(false)}>
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modal Cập nhật / Thêm mới */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <h3>{formData.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Tên Sản Phẩm:</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleChange} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Danh Mục:</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.categoryName}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Hãng Sản Xuất:</label>
                  <select name="brand" value={formData.brand} onChange={handleChange}>
                    <option value="">-- Chọn hãng --</option>
                    {brands?.map(b => (
                      <option key={b.id} value={b.brandName}>{b.brandName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phân Loại (Section):</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <select name="section" value={formData.section} onChange={handleChange} style={{ flex: 1 }}>
                      {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Thêm Mục Mới:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={newSectionName} 
                    onChange={(e) => setNewSectionName(e.target.value)} 
                    placeholder="Nhập tên mục mới..." 
                  />
                  <button type="button" className="btn-admin" onClick={addSection}>Thêm</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Giá Gốc (VNĐ):</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Giảm Giá (%):</label>
                  <input type="number" name="discountPercent" value={formData.discountPercent || ''} onChange={handleChange} min="0" max="100" />
                </div>
              </div>
              
              <div className="form-row" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', background: '#2c3e50', padding: '1.5rem', borderRadius: '8px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ color: '#ecf0f1', fontWeight: 'bold' }}>🖼️ Hình Ảnh Chính (Dán Link):</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      name="imageUrl" 
                      value={formData.imageUrl || ''} 
                      onChange={handleChange} 
                      placeholder="https://example.com/image.jpg" 
                      style={{ flex: 1, padding: '0.8rem' }} 
                    />
                    <button type="button" className="btn-admin" style={{ padding: '0 1rem' }} onClick={() => fileInputRef.current.click()} title="Tải ảnh lên từ máy tính">📂</button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'imageUrl')} />
                  </div>
                  {formData.imageUrl && (
                    <div className="image-preview-container" style={{ textAlign: 'center', background: '#34495e', padding: '10px', borderRadius: '4px' }}>
                      <p style={{ fontSize: '0.7rem', color: '#bdc3c7', marginBottom: '5px' }}>Xem trước ảnh chính:</p>
                      <img src={formData.imageUrl} alt="P1 Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', border: '1px solid #555' }} />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ color: '#ecf0f1', fontWeight: 'bold' }}>🖼️ Ảnh Phụ / Hover (Dán Link):</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      name="imageUrl2" 
                      value={formData.imageUrl2 || ''} 
                      onChange={handleChange} 
                      placeholder="https://example.com/image2.jpg" 
                      style={{ flex: 1, padding: '0.8rem' }} 
                    />
                    <button type="button" className="btn-admin" style={{ padding: '0 1rem' }} onClick={() => fileInputRef2.current.click()} title="Tải ảnh lên từ máy tính">📂</button>
                    <input type="file" ref={fileInputRef2} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'imageUrl2')} />
                  </div>
                  {formData.imageUrl2 && (
                    <div className="image-preview-container" style={{ textAlign: 'center', background: '#34495e', padding: '10px', borderRadius: '4px' }}>
                      <p style={{ fontSize: '0.7rem', color: '#bdc3c7', marginBottom: '5px' }}>Xem trước ảnh phụ:</p>
                      <img src={formData.imageUrl2} alt="P2 Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', border: '1px solid #555' }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết:</label>
                <textarea name="discription" value={formData.discription} onChange={handleChange} rows="3" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-admin" style={{ background: '#95a5a6' }} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-admin">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <h3>{categoryFormData.id ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label>Tên Danh Mục:</label>
                <input 
                  type="text" 
                  value={categoryFormData.categoryName} 
                  onChange={(e) => setCategoryFormData({...categoryFormData, categoryName: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Hình Ảnh Danh Mục (Link):</label>
                <input 
                  type="text" 
                  value={categoryFormData.imageUrl} 
                  onChange={(e) => setCategoryFormData({...categoryFormData, imageUrl: e.target.value})} 
                  required 
                  placeholder="https://..."
                />
              </div>
              {categoryFormData.imageUrl && (
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <img src={categoryFormData.imageUrl} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-admin" style={{ background: '#95a5a6' }} onClick={() => setShowCategoryModal(false)}>Hủy</button>
                <button type="submit" className="btn-admin">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBrandModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{brandFormData.id ? 'Sửa Hãng Sản Xuất' : 'Thêm Hãng Sản Xuất Mới'}</h3>
            <form onSubmit={handleSaveBrand}>
              <div className="form-group">
                <label>Tên Hãng:</label>
                <input 
                  type="text" 
                  value={brandFormData.brandName} 
                  onChange={(e) => setBrandFormData({...brandFormData, brandName: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Link Logo Hãng:</label>
                <input 
                  type="text" 
                  value={brandFormData.logoUrl} 
                  onChange={(e) => setBrandFormData({...brandFormData, logoUrl: e.target.value})} 
                  placeholder="https://..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-admin" style={{ background: '#7f8c8d' }} onClick={() => setShowBrandModal(false)}>Hủy</button>
                <button type="submit" className="btn-admin">Lưu Hãng</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{userFormData.id ? 'Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</h3>
            <div className="form-group">
              <label>Tên đăng nhập / Email</label>
              <input type="text" value={userFormData.userName} onChange={e => setUserFormData({...userFormData, userName: e.target.value})} placeholder="Nhập tên đăng nhập" />
            </div>
            {!userFormData.id && (
              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" value={userFormData.password || ''} onChange={e => setUserFormData({...userFormData, password: e.target.value})} placeholder="Nhập mật khẩu" />
              </div>
            )}
            <div className="form-group">
              <label>Quyền Hạn (Role)</label>
              <select value={userFormData.role?.roleName || 'USER'} onChange={e => setUserFormData({...userFormData, role: { id: e.target.value === 'ADMIN' ? 1 : 2, roleName: e.target.value }})}>
                <option value="USER">Khách hàng (USER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng Thái</label>
              <select value={userFormData.active === undefined ? 1 : userFormData.active} onChange={e => setUserFormData({...userFormData, active: parseInt(e.target.value)})}>
                <option value={1}>Hoạt động</option>
                <option value={0}>Đã khóa</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-admin" onClick={handleSaveUser}>Lưu Người Dùng</button>
              <button className="btn-admin" style={{ background: '#95a5a6' }} onClick={() => setShowUserModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Xuất Báo Cáo (Word)</h3>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>Vui lòng chọn loại dữ liệu bạn muốn xuất ra file Word.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button className="btn-admin" style={{ background: '#27ae60', width: '100%' }} onClick={handleExportRevenue}>
                📊 Báo Cáo Doanh Thu
              </button>
              <button className="btn-admin" style={{ background: '#2980b9', width: '100%' }} onClick={handleExportOrders}>
                🛒 Danh Sách Đơn Hàng
              </button>
              <button className="btn-admin" style={{ background: '#8e44ad', width: '100%' }} onClick={handleExportUsers}>
                👥 Danh Sách Người Dùng
              </button>
            </div>

            <div className="modal-actions" style={{ marginTop: '25px', justifyContent: 'center' }}>
              <button className="btn-admin" style={{ background: '#95a5a6', width: '100%' }} onClick={() => setShowExportModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="admin-content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>🎫 Mã Giảm Giá</h3>
              <p style={{ margin: '5px 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Tạo và quản lý mã giảm giá cho khách hàng</p>
            </div>
            <button className="btn-admin" style={{ background: '#27ae60' }}
              onClick={() => { setCouponForm({ id: null, code: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, used: 0, expiry: '', active: true, description: '' }); setShowCouponModal(true); }}>
              + Tạo Mã Mới
            </button>
          </div>

          {coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎫</div>
              <p>Chưa có mã giảm giá nào. Hãy tạo mã đầu tiên!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Code</th>
                  <th>Mô Tả</th>
                  <th>Giảm Giá</th>
                  <th>Đơn Tối Thiểu</th>
                  <th>Đã Dùng</th>
                  <th>Hết Hạn</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const isExpired = c.expiry && new Date(c.expiry) < new Date();
                  const isMaxed = c.used >= c.maxUses;
                  return (
                    <tr key={c.id}>
                      <td><span style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '2px', color: '#2980b9' }}>{c.code}</span></td>
                      <td style={{ color: '#7f8c8d', fontSize: '0.88rem' }}>{c.description || '—'}</td>
                      <td><span style={{ fontWeight: 'bold', color: '#27ae60' }}>{c.type === 'percent' ? `${c.value}%` : `${c.value.toLocaleString()} VNĐ`}</span></td>
                      <td>{c.minOrder > 0 ? `${c.minOrder.toLocaleString()} VNĐ` : 'Không giới hạn'}</td>
                      <td>{c.used || 0} / {c.maxUses}</td>
                      <td style={{ color: isExpired ? '#e74c3c' : '#666', fontSize: '0.85rem' }}>{c.expiry || 'Không giới hạn'}{isExpired ? ' (Hết hạn)' : ''}</td>
                      <td>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                          background: c.active && !isExpired && !isMaxed ? '#e8f5e9' : '#ffebee',
                          color: c.active && !isExpired && !isMaxed ? '#27ae60' : '#e74c3c' }}>
                          {c.active && !isExpired && !isMaxed ? '✅ Đang dùng' : isExpired ? '⏰ Hết hạn' : isMaxed ? '🚫 Hết lượt' : '❌ Tắt'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-admin" style={{ background: '#f39c12', marginRight: '5px' }}
                          onClick={() => { setCouponForm(c); setShowCouponModal(true); }}>Sửa</button>
                        <button className="btn-admin" style={{ background: c.active ? '#e74c3c' : '#27ae60', marginRight: '5px' }}
                          onClick={() => handleToggleCoupon(c.id)}>{c.active ? 'Tắt' : 'Bật'}</button>
                        <button className="btn-delete" onClick={() => handleDeleteCoupon(c.id)}>Xóa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '460px' }}>
            <h3>{couponForm.id ? 'Sửa Mã Giảm Giá' : '🎫 Tạo Mã Giảm Giá Mới'}</h3>
            <div className="form-group">
              <label>Mã Code (VD: SALE50, VIP2024)</label>
              <input type="text" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="Nhập mã code..." style={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px' }} />
            </div>
            <div className="form-group">
              <label>Mô tả (Hiện cho khách hàng)</label>
              <input type="text" value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} placeholder="VD: Giảm 50k cho đơn hàng đầu tiên" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Loại giảm giá</label>
                <select value={couponForm.type} onChange={e => setCouponForm({...couponForm, type: e.target.value})}>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div className="form-group">
                <label>{couponForm.type === 'percent' ? 'Giảm (%)' : 'Giảm (VNĐ)'}</label>
                <input type="number" value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: parseFloat(e.target.value)})} min="1" max={couponForm.type === 'percent' ? 100 : undefined} />
              </div>
              <div className="form-group">
                <label>Đơn hàng tối thiểu (VNĐ)</label>
                <input type="number" value={couponForm.minOrder} onChange={e => setCouponForm({...couponForm, minOrder: parseInt(e.target.value)})} min="0" step="10000" />
              </div>
              <div className="form-group">
                <label>Số lần dùng tối đa</label>
                <input type="number" value={couponForm.maxUses} onChange={e => setCouponForm({...couponForm, maxUses: parseInt(e.target.value)})} min="1" />
              </div>
            </div>
            <div className="form-group">
              <label>Ngày hết hạn</label>
              <input type="date" value={couponForm.expiry} onChange={e => setCouponForm({...couponForm, expiry: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={String(couponForm.active)} onChange={e => setCouponForm({...couponForm, active: e.target.value === 'true'})}>
                <option value="true">✅ Đang hoạt động</option>
                <option value="false">❌ Tắt</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-admin" onClick={handleSaveCoupon} style={{ background: '#27ae60' }}>💾 Lưu Mã</button>
              <button className="btn-admin" style={{ background: '#95a5a6' }} onClick={() => setShowCouponModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
