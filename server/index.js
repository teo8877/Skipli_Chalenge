const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const http =require('http');//thư viện tạo server
const {Server} = require('socket.io');//thư viện realtime
// 1. Khởi tạo App
const app = express();
app.use(cors()); // Cho phép Frontend gọi
app.use(express.json()); // Để đọc được dữ liệu JSON gửi lên
// KHỞI TẠO SOCKET.IO  
const server = http.createServer(app); // Bọc Express app vào HTTP Server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Cho phép Frontend gọi vào
    methods: ["GET", "POST"]
  }
});
//KHI CÓ AI ĐÓ KẾT NỐI VÀO SOCKET
io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // Nghe sự kiện: Client gửi tin nhắn lên
  socket.on("send_message", (data) => {
    console.log("📩 Nhận tin nhắn:", data);
    // Gửi tin nhắn này lại cho TẤT CẢ mọi người (Broadcast)
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

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
app.get('/employees', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();
    // Biến đổi dữ liệu từ Firebase thành mảng JSON đẹp
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(list);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 4. Thêm nhân viên mới
app.post('/create-employee', async (req, res) => {
  const { name, email, department } = req.body;
  try {
    const newEmp = { 
      name, 
      email, 
      department, 
      createdAt: new Date().toISOString() 
    };
    
    // Lưu vào Firebase
    const docRef = await db.collection('employees').add(newEmp);

    // MOCK EMAIL: Thay vì gửi email thật, in ra console
    console.log("------------------------------------------------");
    console.log(`📧 GỬI EMAIL MỜI CHO: ${email}`);
    console.log(`🔗 LINK SETUP ACCOUNT: http://localhost:5173/setup/${docRef.id}`);
    console.log("------------------------------------------------");

    res.send({ success: true, id: docRef.id, message: "Đã thêm NV & Gửi mail!" });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// 5. Xóa nhân viên
app.delete('/delete-employee/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('employees').doc(id).delete();
    res.send({ success: true, message: "Đã xóa nhân viên!" });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});
// 4. Chạy Server
const PORT = 5000;
server.listen(PORT, () => { // Đổi app -> server
  console.log(`SERVER SOCKET ĐANG CHẠY TẠI http://localhost:${PORT}`);
});