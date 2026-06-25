const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8900/api';
const API_MOHINH_URL = 'http://localhost:5271/api';


export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/products`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
    }
};

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/categories`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Create failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Update failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/categories/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete failed');
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchBrands = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/brands`);
        if (!response.ok) throw new Error('Fetch brands failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createBrand = async (brandData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/brands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brandData)
        });
        if (!response.ok) throw new Error('Create brand failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateBrand = async (id, brandData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/brands/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brandData)
        });
        if (!response.ok) throw new Error('Update brand failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteBrand = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/brands/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete brand failed');
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Create failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Update failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete failed');
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts/users`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            throw new Error("Login failed");
        }
        return await response.json();
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            throw new Error("Registration failed");
        }
        return await response.json();
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_MOHINH_URL}/accounts/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Không thể gửi mã");
        }
        return await response.json();
    } catch (error) {
        console.error("Forgot password error:", error);
        throw error;
    }
};

export const verifyOtp = async (email, otp) => {
    try {
        const response = await fetch(`${API_MOHINH_URL}/accounts/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Mã OTP không chính xác");
        }
        return await response.json();
    } catch (error) {
        console.error("Verify OTP error:", error);
        throw error;
    }
};

export const resetPassword = async (email, newPassword) => {
    try {
        const response = await fetch(`${API_MOHINH_URL}/accounts/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Không thể đổi mật khẩu");
        }
        return await response.json();
    } catch (error) {
        console.error("Reset password error:", error);
        throw error;
    }
};

export const fetchReviews = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/reviews/${productId}`);
        if (!response.ok) throw new Error('Fetch reviews failed');
        return await response.json();
    } catch (error) {
        console.error("Fetch reviews error:", error);
        return null;
    }
};

export const createReview = async (reviewData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/catalog/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        if (!response.ok) throw new Error('Create review failed');
        return await response.json();
    } catch (error) {
        console.error("Create review error:", error);
        throw error;
    }
};

export const createOrder = async (userId, paymentMethod) => {
    try {
        const response = await fetch(`${API_BASE_URL}/shop/order/${userId}?paymentMethod=${paymentMethod}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': 'cart-id-placeholder' 
            }
        });
        if (!response.ok) throw new Error('Create order failed');
        return await response.json();
    } catch (error) {
        console.error("Create order error:", error);
        throw error;
    }
};

export const fetchOrderStatus = async (orderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/shop/order/${orderId}/status`);
        if (!response.ok) throw new Error('Fetch status failed');
        return await response.text();
    } catch (error) {
        console.error("Fetch status error:", error);
        throw error;
    }
};

export const createVNPayUrl = async (amount, orderInfo) => {
    try {
        const response = await fetch(`${API_BASE_URL}/shop/order/vnpay/create-url?amount=${amount}&orderInfo=${encodeURIComponent(orderInfo)}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to create VNPay URL');
        return await response.text();
    } catch (error) {
        console.error("VNPay URL error:", error);
        throw error;
    }
};

