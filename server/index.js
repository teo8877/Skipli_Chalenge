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

// 4. Chạy Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});