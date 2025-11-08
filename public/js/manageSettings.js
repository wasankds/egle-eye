// 
document.addEventListener('DOMContentLoaded', function() {

  //=== ปุ่ม Backup
  var btnBackupDb = document.getElementById('btnBackupDb');
  var btnConfirmBackupDb = document.getElementById('btnConfirmBackupDb');
  if (btnBackupDb && btnConfirmBackupDb) {
    btnBackupDb.addEventListener('click', function(e) {
      e.preventDefault();
      btnBackupDb.classList.add('dp-n');
      btnConfirmBackupDb.classList.remove('dp-n');
    });
  }

  //=== ปุ่ม Update
  var btnUpdateSystem = document.getElementById('btnUpdateSystem');
  var btnConfirmUpdateSystem = document.getElementById('btnConfirmUpdateSystem');
  if (btnUpdateSystem && btnConfirmUpdateSystem) {
    btnUpdateSystem.addEventListener('click', function(e) {
      e.preventDefault();
      btnUpdateSystem.classList.add('dp-n');
      btnConfirmUpdateSystem.classList.remove('dp-n');
    });
  }

  //=== ปุ่ม Restart PM2
  var btnRestartPm2 = document.getElementById('btnRestartPm2');
  var btnConfirmRestartPm2 = document.getElementById('btnConfirmRestartPm2');
  if (btnRestartPm2 && btnConfirmRestartPm2) {
    btnRestartPm2.addEventListener('click', function(e) {
      e.preventDefault();
      btnRestartPm2.classList.add('dp-n');
      btnConfirmRestartPm2.classList.remove('dp-n');
    });
  }
  
});



//============================================================
function toActive(elm){
  if(elm.value == '1'){
    elm.classList.remove('bg-red')
    elm.classList.add('bg-green')
  }else{
    elm.classList.remove('bg-green')
    elm.classList.add('bg-red')
  }
}


//============================================================
// ใช้ Swal ในการยืนยันการลบโฟลเดอร์สำรองข้อมูล
// 
document.querySelectorAll('.remove-backup-form').forEach( form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault(); // ป้องกันการส่งฟอร์มทันที

    Swal.fire({
      title: 'ยืนยันการลบ',
      text: "การลบโฟลเดอร์สำรองข้อมูลจะไม่สามารถกู้คืนได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit(); // ส่งฟอร์มถ้าผู้ใช้ยืนยัน
      }
    });
  });
});


//============================================================
// ใช้ Swal ในการยืนยันการดาวน์โหลดโฟลเดอร์สำรองข้อมูล
// 
document.querySelectorAll('.download-backup-form').forEach( form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault(); // ป้องกันการส่งฟอร์มทันที

    Swal.fire({
      title: 'ยืนยันการดาวน์โหลด',
      text: "คุณต้องการดาวน์โหลดโฟลเดอร์สำรองข้อมูลนี้หรือไม่?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ดาวน์โหลดเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit(); // ส่งฟอร์มถ้าผู้ใช้ยืนยัน
      }
    });
  });
});