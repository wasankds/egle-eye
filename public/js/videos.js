console.log('----------------');

//===========================================================
// 
document.querySelectorAll('.btn-delete').forEach( btn => {
  btn.addEventListener('click', (event) => {
    deleteJs(event, PATH_DELETE);
  })
})
//===========================================================
// 
document.querySelectorAll('.btn-delete-mp4').forEach( btn => {
  btn.addEventListener('click', (event) => {
    deleteJs(event, PATH_DELETE_MP4);
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
              if(pathAction === PATH_DELETE){
                const td = btn.closest('td');
                const tr = td.closest('tr');
                tr.remove();
              }else if(pathAction === PATH_DELETE_MP4){               
                btn.remove();  //=== ซ่อนปุ่มลบ mp4
              }
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


