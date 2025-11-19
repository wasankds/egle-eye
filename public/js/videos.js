console.log('----------------');

//===========================================================
// 
document.querySelectorAll('.btn-delete').forEach( btn => {
  btn.addEventListener('click', (event) => {
    deleteJs(event, PATH_DELETE);
  })
})
function deleteJs(e, pathAction){
  e.preventDefault();

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "กรุณากด 'ยืนยัน' เพื่อดำเนินการลบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    }).then((result) => {
      //=== ยิง fetch ลบไฟล์
      if (result.isConfirmed) {
        // กรณีคลิกโดน <i> ให้หา parent button
        const btn = e.target.closest('button');
        const data = {
          filename: btn.getAttribute('data-filename')
        };
        btn.classList.add('disabled');

        sendHttpRequest('post', pathAction, data)
          .then(rtn => {
            if (rtn.status === 'ok') {      
              const td = btn.closest('td');
              const tr = td.closest('tr');
              tr.remove();
              showToast(rtn.message, rtn.class);
            } else {
              showToast(rtn.message, rtn.class);
            }
          }).catch(err => {
            console.log(err);
            showToast(err.message, rtn.class);
          }).finally(() => {
            btn.classList.remove('disabled');
          });
      }
    });
    return;
  } 
}




//===========================================================
// 
document.querySelectorAll('.btn-convert').forEach( btn => {
  btn.addEventListener('click', convertJs)
})
function convertJs(e){
  e.preventDefault();

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "ยืนยันการแปลงไฟล์",
      text: "กรุณากด 'ยืนยัน' เพื่อดำเนินการแปลงไฟล์",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    }).then((result) => {
      //=== ยิง fetch ดาวน์โหลดไฟล์
      if (result.isConfirmed) {
        const btn = e.target.closest('button');
        const data = {};
        data.filename = btn.getAttribute('data-filename');
        btn.classList.add('disabled');

        sendHttpRequest('post', PATH_CONVERT, data)
          .then( rtn => {
            console.log("rtn ===> " , rtn)
          }).catch(err => {
            console.log(err);
            showToast(err.message, rtn.class);
          }).finally(() => {
            btn.classList.remove('disabled');
          });
      }
    });
    return;
  }
  

}

//===========================================================
// เล่นวิดีโอ .mp4 บนเว็บเมื่อคลิกปุ่ม play

document.querySelectorAll('.btn-play').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const filename = btn.getAttribute('data-filename');

    // สร้าง modal หรือ embed video player
    let modal = document.getElementById('video-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'video-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.7)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.innerHTML = `
        <div style="position:relative;max-width:90vw;max-height:90vh;">
          <button id="close-video-modal" style="position:absolute;top:-40px;right:0;font-size:2rem;background:none;border:none;color:white;cursor:pointer;">&times;</button>
          <video id="video-player" controls autoplay style="max-width:90vw;max-height:80vh;background:#000;"></video>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('close-video-modal').onclick = function() {
        modal.remove();
      };
    } else {
      modal.style.display = 'flex';
    }
    // set src
    const video = document.getElementById('video-player');
    video.src = `${PATH_VIEW}/${filename}`;
    video.load();
    video.play();
  });
});





