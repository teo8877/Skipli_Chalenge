const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// 1. Khởi tạo App
const app = express();
app.use(cors()); // Cho phép Frontend gọi
app.use(express.json()); // Để đọc được dữ liệu JSON gửi lên

// 2. Kết nối Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Đây là biến để thao tác với Database

// 3. API Test thử (Hello World)
app.get('/test', async (req, res) => {
  try {
    // Thử ghi 1 dòng vào Firebase để xem có ăn không
    await db.collection('test_collection').add({
        message: "Hello from Node.js",
        timestamp: new Date()
    });
    res.send({ success: true, message: "Kết nối Firebase thành công!" });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// --- API NGÀY 2: AUTHENTICATION ---

// 1. API Gửi OTP (Giả lập)
app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  
  // Tạo mã ngẫu nhiên 6 số
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Lưu mã này vào Firebase (Collection 'otp_codes')
    // Dùng phoneNumber làm ID để dễ tìm
    await db.collection('otp_codes').doc(phoneNumber).set({
      code: otpCode,
      createdAt: new Date()
    });

    // MOCK: Thay vì gửi SMS, ta in ra console của Server
    console.log("------------------------------------------------");
    console.log(`⚠️  MÃ OTP CHO ${phoneNumber} LÀ: ${otpCode}`);
    console.log("------------------------------------------------");

    res.send({ success: true, message: "Đã gửi mã OTP (Check console server)" });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// 2. API Xác thực OTP
app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    // Lấy mã đã lưu trong Firebase ra
    const doc = await db.collection('otp_codes').doc(phoneNumber).get();

    if (!doc.exists) {
      return res.status(400).send({ success: false, message: "SĐT chưa yêu cầu mã!" });
    }

    const data = doc.data();
    
    // So sánh mã người dùng nhập với mã trong DB
    if (data.code === code) {
      // Nếu đúng: Xóa mã đi (để không dùng lại được) và báo thành công
      await db.collection('otp_codes').doc(phoneNumber).delete();
      res.send({ success: true, message: "Đăng nhập thành công!" });
    } else {
      res.status(400).send({ success: false, message: "Mã OTP không đúng!" });
    }

  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// 4. Chạy Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});