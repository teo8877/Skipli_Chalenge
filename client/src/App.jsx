import './App.css'
import { useState ,useEffect} from 'react'
import axios from 'axios'
import io from 'socket.io-client';
const socket = io.connect("http://localhost:5000");// Kết nối tới Server tranh kết nối nnhiều lần
function App() {
  // Các biến để lưu trạng thái
  const [step, setStep] = useState(1); // 1: Nhập SĐT, 2: Nhập OTP, 3: Đã Login
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState([]); // Danh sách NV
  const [newEmp, setNewEmp] = useState({ name: '', email: '', department: '' }); // Form thêm NV
// State cho Chat
const [currentMessage, setCurrentMessage] = useState("");
const [messageList, setMessageList] = useState([]);
  // Hàm gọi API gửi OTP
  const handleSendOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/send-otp', { phoneNumber });
      setMessage(res.data.message);
      setStep(2); // Chuyển sang màn hình nhập OTP
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  }

  // Hàm gọi API check OTP
  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/verify-otp', { phoneNumber, code: otp });
      if (res.data.success) {
        setStep(3); // Login thành công
      }
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  }


    // Hàm lấy danh sách NV từ Server
const fetchEmployees = async () => {
  try {
    const res = await axios.get('http://localhost:5000/employees');
    setEmployees(res.data);
  } catch (error) {
    console.error(error);
  }
};

// Hàm thêm NV
const handleAddEmployee = async () => {
  try {
    await axios.post('http://localhost:5000/create-employee', newEmp);
    alert("Thêm thành công!");
    setNewEmp({ name: '', email: '', department: '' }); // Reset form
    fetchEmployees(); // Tải lại danh sách
  } catch (error) {
    alert("Lỗi thêm NV");
  }
};

// Hàm xóa NV
const handleDelete = async (id) => {
  if(!confirm("Bạn chắc chắn xóa chứ?")) return;
  try {
    await axios.delete(`http://localhost:5000/delete-employee/${id}`);
    fetchEmployees(); // Tải lại danh sách
  } catch (error) {
    alert("Lỗi xóa NV");
  }
};

// Lắng nghe tin nhắn từ Server gửi về
useEffect(() => {
  // Khi server phát sự kiện 'receive_message'
  socket.on("receive_message", (data) => {
    // Thêm tin nhắn mới vào danh sách
    setMessageList((list) => [...list, data]);
  });

  // Cleanup khi thoát trang
  return () => socket.off("receive_message");
}, [socket]);

// Hàm gửi tin nhắn
const sendMessage = async () => {
  if (currentMessage !== "") {
    const messageData = {
      author: phoneNumber, // Người gửi là số điện thoại đang login
      message: currentMessage,
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    };

    // Gửi lên server
    await socket.emit("send_message", messageData);
    setCurrentMessage(""); // Xóa ô nhập
  }
};
  return (
     
    <div  className="container" style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>Skipli Challenge</h1>
  
      {/* Màn hình 1: Nhập SĐT */}
      {step === 1 && (
        <div>
          <h3>Nhập Số Điện Thoại</h3>
          <input 
            type="text" 
            placeholder="Số điện thoại (VD: 0987654321)" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          />
          <button onClick={handleSendOtp} style={{ padding: '10px' }}>Gửi mã OTP</button>
        </div>
      )}

      {/* Màn hình 2: Nhập OTP */}
      {step === 2 && (
        <div>
          <h3>Nhập mã OTP</h3>
          <p>Đã gửi mã đến: <strong>{phoneNumber}</strong></p>
          <p><em>(Hãy nhìn vào Terminal đang chạy Server để lấy mã)</em></p>
          <input 
            type="text" 
            placeholder="Nhập mã 6 số" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          />
          <button onClick={handleVerifyOtp} style={{ padding: '10px' }}>Xác thực</button>
        </div>
      )}

      {/* Màn hình 3: Thành công */}
      {step === 3 && (
  <div>
    <h2>Dashboard Quản Lý (Owner: {phoneNumber})</h2>
    <button onClick={fetchEmployees}> Tải danh sách NV</button>

    {/* Form thêm NV */}
    <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
      <h3>Thêm Nhân Viên Mới</h3>
      <input 
        placeholder="Tên nhân viên" 
        value={newEmp.name}
        onChange={e => setNewEmp({...newEmp, name: e.target.value})}
        style={{ margin: 5 }}
      />
      <input 
        placeholder="Email" 
        value={newEmp.email}
        onChange={e => setNewEmp({...newEmp, email: e.target.value})}
        style={{ margin: 5 }}
      />
       <input 
        placeholder="Phòng ban" 
        value={newEmp.department}
        onChange={e => setNewEmp({...newEmp, department: e.target.value})}
        style={{ margin: 5 }}
      />
      <button onClick={handleAddEmployee} style={{ backgroundColor: '#4CAF50', color: 'white' }}>+ Thêm</button>
    </div>

    {/* Bảng danh sách */}
    <h3>Danh sách nhân viên ({employees.length})</h3>
    <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Tên</th>
          <th>Email</th>
          <th>Phòng ban</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(emp => (
          <tr key={emp.id}>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>{emp.department}</td>
            <td>
              <button onClick={() => handleDelete(emp.id)} style={{ color: 'red' }}>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {/* --- KHUNG CHAT REALTIME --- */}
<div style={{ marginTop: 50, border: '2px solid #007bff', padding: 20, maxWidth: 400 }}>
  <h3>Chat Nội Bộ</h3>

  {/* Khung hiển thị tin nhắn */}
  <div style={{ height: 200, overflowY: 'scroll', border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
    {messageList.map((msgContent, index) => (
      <div key={index} style={{ textAlign: msgContent.author === phoneNumber ? 'right' : 'left' }}>
        <div>
          <strong>{msgContent.author}</strong> <small>({msgContent.time})</small>
        </div>
        <div style={{ 
          background: msgContent.author === phoneNumber ? '#dcf8c6' : '#f1f0f0',
          padding: '5px 10px', 
          borderRadius: 10,
          display: 'inline-block',
          margin: '5px 0'
        }}>
          {msgContent.message}
        </div>
      </div>
    ))}
  </div>

  {/* Ô nhập tin nhắn */}
  <div style={{ display: 'flex' }}>
    <input 
      type="text" 
      value={currentMessage} 
      placeholder="Nhập tin nhắn..." 
      onChange={(event) => { setCurrentMessage(event.target.value); }}
      onKeyPress={(event) => { event.key === "Enter" && sendMessage(); }}
      style={{ flex: 1, padding: 10 }}
    />
    <button onClick={sendMessage} style={{ padding: 10, background: '#007bff', color: 'white' }}>Gửi</button>
  </div>
  
</div>
  </div>
 
)}

      {/* Thông báo lỗi/thành công */}
      {message && <p style={{ marginTop: '20px', color: 'blue' }}>Wait: {message}</p>}
    </div>
  )
}

export default App