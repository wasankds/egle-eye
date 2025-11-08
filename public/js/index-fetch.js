
let isOnline = false;

function updateData() {
  fetch('/api/data')
    .then( response => response.json())
    .then( data => {
      console.log('Data received:', data);
      /*      
        {
            "temperature": 24.3,
            "humidity": 44.4,
            "timestamp": 1762585590
        } 
      */

      // อัปเดตค่า
      document.getElementById('temperature').textContent = data.temperature.toFixed(1);
      document.getElementById('humidity').textContent = data.humidity.toFixed(1);

      // อัปเดตเวลา
      const date = new Date(data.timestamp * 1000);
      document.getElementById('lastUpdate').textContent = date.toLocaleString('th-TH');

      // อัปเดตสถานะ
      const statusEl = document.getElementById('status');
      if (!isOnline) {
        statusEl.textContent = '✅ เชื่อมต่อแล้ว';
        statusEl.className = 'status online';
        isOnline = true;
      }
    })
    .catch(error => {
      console.error('Error:', error);

      // แสดงสถานะออฟไลน์
      const statusEl = document.getElementById('status');
      statusEl.textContent = '❌ ไม่สามารถเชื่อมต่อได้';
      statusEl.className = 'status offline';
      isOnline = false;
    });
}

// อัปเดตทุก 2 วินาทีพอดีกับ sensor
setInterval(updateData, 2000);

// อัปเดตครั้งแรกทันที
updateData();

console.log('🌐 DHT11 Web Monitor Ready');
