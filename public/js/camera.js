  // Map ปุ่ม id กับทิศทาง
  const camBtnMap = {
    'btn-cam-up': 'up',
    'btn-cam-down': 'down',
    'btn-cam-left': 'left',
    'btn-cam-right': 'right',
    'btn-cam-home': 'home'
  };

  Object.keys(camBtnMap).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        fetch(PATH_REQUEST, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            direction: camBtnMap[id]
          })
        })
        .then(res => res.json())
        .then(data => {
          // Optional: show toast/notify
          if(data.status !== 'ok') {
            alert('Move failed: ' + (data.message || 'unknown error'));
          }
        })
        .catch(err => {
          alert('Network error: ' + err.message);
        });
      });
    }
  });