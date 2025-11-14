

document.addEventListener('DOMContentLoaded', function() {

  const s01el = document.getElementById('s01');
  const s01status = document.getElementById('s01-status');
  if (s01el && s01status) {
    s01el.addEventListener('change', function() {

      //=== ยิง fetch ไปที่เซิร์ฟเวอร์ เพื่อบันทึกสถานะสวิตช์
      const switchState = this.checked ? 'on' : 'off';
      fetch(PATH_SWITCH_WEB, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          switchState: switchState ,
          id: 's01'
        })
      }).then( response => {
        return response.json()
      }).then( data => { 
        if (data.status === 'ok') {
          s01status.textContent = switchState.toUpperCase();
          s01status.style.color = this.checked ? '#4CAF50' : '#2196F3';
        } else {
          console.log('Error updating switch state:', data.message);
        }
      }).catch(error => {
        console.log('Network error:', error.message);
      });
    });
  }



});