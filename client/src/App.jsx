import { useState } from 'react'
import axios from 'axios'

function App() {
  // Các biến để lưu trạng thái
  const [step, setStep] = useState(1); // 1: Nhập SĐT, 2: Nhập OTP, 3: Đã Login
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState([]); // Danh sách NV
  const [newEmp, setNewEmp] = useState({ name: '', email: '', department: '' }); // Form thêm NV

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
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>Skipli Challenge - Day 2: Auth</h1>
      
      {/* Màn hình 1: Nhập SĐT */}
      {step === 1 && (
        <div>
          <h3>Bước 1: Nhập Số Điện Thoại</h3>
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
          <h3>Bước 2: Nhập mã OTP</h3>
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
    <button onClick={fetchEmployees}>🔄 Tải danh sách NV</button>

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
  </div>
)}

      {/* Thông báo lỗi/thành công */}
      {message && <p style={{ marginTop: '20px', color: 'blue' }}>Wait: {message}</p>}
    </div>
  )
}

export default App