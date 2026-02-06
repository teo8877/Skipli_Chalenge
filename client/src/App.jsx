import { useState } from 'react'
import axios from 'axios'

function App() {
  const [status, setStatus] = useState('Chưa kết nối')

  const checkConnection = async () => {
    try {
      // Gọi API test của Backend
      const response = await axios.get('http://localhost:5000/test');
      console.log(response.data);
      setStatus(response.data.message);
    } catch (error) {
      console.error(error);
      setStatus('Lỗi kết nối: ' + error.message);
    }
  }

  return (
    <div style={{ padding: 50 }}>
      <h1>Skipli Challenge - Day 1</h1>
      <p>Trạng thái Server: <strong>{status}</strong></p>
      <button onClick={checkConnection}>Test Kết Nối Server & Firebase</button>
    </div>
  )
}

export default App