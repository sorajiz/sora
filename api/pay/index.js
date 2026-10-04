const { BANK_CONFIG } = require('../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  res.json({
    status: 'online',
    service: "Sora's Station Payment Gateway API",
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    bank: BANK_CONFIG,
    endpoints: {
      createOrder: {
        method: 'POST',
        path: '/api/pay/create',
        description: 'Tạo phiên thanh toán mới cho Discord Bot',
        body: {
          srCode: 'ORD197 (hoặc để trống tự tạo)',
          amount: 10000,
          description: 'Thanh toán đơn hàng'
        }
      },
      checkStatus: {
        method: 'GET',
        path: '/api/pay/status/:srCode',
        description: 'Kiểm tra trạng thái thanh toán (pending / paid / expired)'
      },
      confirmPayment: {
        method: 'POST',
        path: '/api/pay/confirm',
        description: 'Xác nhận thanh toán thành công khi MBBank báo có'
      },
      getQR: {
        method: 'GET',
        path: '/api/pay/qr?amount=10000&code=ORD197',
        description: 'Lấy trực tiếp ảnh VietQR sạch chuẩn'
      }
    },
    webUrls: {
      mainDomain: 'https://sorae.tokyo/pay/:code',
      subDomain: 'https://payment.sorae.tokyo/:code'
    }
  });
};
