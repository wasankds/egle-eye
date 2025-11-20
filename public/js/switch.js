document.addEventListener('DOMContentLoaded', function() {

  //=== จัดการสวิตช์ S01/S02 แบบรวม
  ['s01', 's02'].forEach(id => {
    const el = document.getElementById(id);
    const statusEl = document.getElementById(id + '-status');
    if (el && statusEl) {
      el.addEventListener('change', function() {
        const switchState = this.checked ? 'on' : 'off';
        fetch(PATH_SWITCH_WEB, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            switchState: switchState,
            id: id
          })
        }).then(response => response.json())
          .then(data => {
            console.log(data);
            // {status: 'ok', switchId: 's01', relayState: 0}

            if (data.status === 'ok') {
              // relayState - Active Low 0=ON, 1=OFF
              statusEl.textContent = data.relayState == 0 ? 'ON' : 'OFF';
              statusEl.style.color = data.relayState == 0 ? '#4CAF50' : '#2196F3';
            } else {
              console.log('Error updating switch state:', data.message);
            }
          }).catch(error => {
            console.log('Network error:', error.message);
          });
      });
    }
  });
});



//=============================================
// รับข้อความจาก server ผ่านทาง socket.io
// - เมื่อมีการกดสวิตช์ที่บอร์ด ปรับสถานะบนเว็บให้ตรงกัน
//
document.addEventListener('DOMContentLoaded', function() {
  const socket = io();
  socket.on('button_pressed', function(data) {
    console.log(data);
    // { "buttonId": "btn1", "relayState": 0 }
    // map buttonId เป็น id element

    const map = { btn1: 's01', btn2: 's02' };
    const id = map[data.buttonId];
    if (id) {
      const el = document.getElementById(id);
      const statusEl = document.getElementById(id + '-status');
      if (el && statusEl) {
        el.checked = data.relayState === 1;
        statusEl.textContent = data.relayState === 1 ? 'ON' : 'OFF';
        statusEl.style.color = data.relayState === 1 ? '#4CAF50' : '#2196F3';
      }
    }
  });
});
