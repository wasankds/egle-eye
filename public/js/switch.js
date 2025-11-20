

document.addEventListener('DOMContentLoaded', function() {


  //=== จัดการสวิตช์ S01
  const s01el = document.getElementById('s01');
  const s01status = document.getElementById('s01-status');
  if (s01el && s01status) {
    s01el.addEventListener('change', function() {

      //=== ยิง fetch ไปที่เซิร์ฟเวอร์ เพื่อบันทึกสถานะสวิตช์
      const relayState = this.checked ? 'on' : 'off';
      fetch(PATH_SWITCH_WEB, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          relayState: relayState ,
          id: 's01'
        })
      }).then( response => {
        return response.json()
      }).then( data => { 
        console.log(data);
        if (data.status === 'ok') {
          s01status.textContent = data.relayState.toUpperCase();
          s01status.style.color = this.checked ? '#4CAF50' : '#2196F3';
        } else {
          console.log('Error updating switch state:', data.message);
        }
      }).catch(error => {
        console.log('Network error:', error.message);
      });
    });
  }

  //=== จัดการสวิตช์ S02
  const s02el = document.getElementById('s02');
  const s02status = document.getElementById('s02-status');
  if (s02el && s02status) {
    s02el.addEventListener('change', function() {
      //=== ยิง fetch ไปที่เซิร์ฟเวอร์ เพื่อบันทึกสถานะสวิตช์
      const relayState = this.checked ? 'on' : 'off';
      fetch(PATH_SWITCH_WEB, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relayState: relayState ,
          id: 's02'
        })
      }).then( response => {
        return response.json()
      }).then( data => {
        console.log(data);
        if (data.status === 'ok') {
          s02status.textContent = data.relayState.toUpperCase();
          s02status.style.color = this.checked ? '#4CAF50' : '#2196F3';
        } else {
          console.log('Error updating switch state:', data.message);
        }
      }).catch(error => {
        console.log('Network error:', error.message);
      });
    });
  }
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

    //=== ใช้สถานะ btn1
    const { buttonId, relayState } = data;
    if (buttonId === 'btn1') {
      const s01el = document.getElementById('s01');
      const s01status = document.getElementById('s01-status');
      if (s01el && s01status) {
        s01el.checked = relayState === 1;
        s01status.textContent = relayState === 1 ? 'ON' : 'OFF';
        s01status.style.color = relayState === 1 ? '#4CAF50' : '#2196F3';
      } 
    }else if(buttonId === 'btn2'){
      const s02el = document.getElementById('s02');
      const s02status = document.getElementById('s02-status');
      if (s02el && s02status) {
        s02el.checked = relayState === 1;
        s02status.textContent = relayState === 1 ? 'ON' : 'OFF';
        s02status.style.color = relayState === 1 ? '#4CAF50' : '#2196F3';
      }
    }
  });

});
