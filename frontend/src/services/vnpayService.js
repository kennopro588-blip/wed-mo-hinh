// VNPay URL Generator - Frontend (Sandbox)
// Chạy trực tiếp ở frontend, không cần gọi backend

const VNPAY_CONFIG = {
    tmnCode: '8M5YQ2GN',
    hashSecret: 'P98GUK7ULO19XCL84J4MGKT2MFV70SX1',
    payUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: 'http://localhost:3000/payment-success',
};

// HMAC-SHA512 sử dụng Web Crypto API
async function hmacSHA512(key, data) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(data);

    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getRandomOrderRef() {
    return Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
}

function getVNPayDate() {
    const now = new Date();
    // GMT+7
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return vnTime.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
}

export async function createVNPayPaymentUrl(amountVND, orderInfo) {
    const vnp_Params = {};

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = VNPAY_CONFIG.tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = getRandomOrderRef();
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = String(Math.round(amountVND) * 100);
    vnp_Params['vnp_ReturnUrl'] = VNPAY_CONFIG.returnUrl;
    vnp_Params['vnp_IpAddr'] = '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = getVNPayDate();

    // Expire in 15 minutes
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15 + 7 * 60); // +7 for GMT+7
    vnp_Params['vnp_ExpireDate'] = expireDate.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);

    // Sort params by key
    const sortedKeys = Object.keys(vnp_Params).sort();
    const hashDataParts = [];
    const queryParts = [];

    for (const key of sortedKeys) {
        const val = vnp_Params[key];
        if (val !== null && val !== undefined && val !== '') {
            hashDataParts.push(`${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`);
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val).replace(/%20/g, '+')}`);
        }
    }

    const hashData = hashDataParts.join('&');
    const queryString = queryParts.join('&');

    const secureHash = await hmacSHA512(VNPAY_CONFIG.hashSecret, hashData);

    return `${VNPAY_CONFIG.payUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
}
