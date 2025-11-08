document.addEventListener('DOMContentLoaded', function() {
  
  //=== เฉพาะใน .nav-ctn
  const navCtn = document.querySelector('.nav-ctn nav');

  //=== 1.) ปุ่มแฮมเบอร์เกอร์ ที่มุมขวา
  // const btn = document.getElementById('navDropdownBtn');
  // const menu = document.getElementById('navDropdownMenu');
  const btn = navCtn.querySelector('#navDropdownBtn');
  const menu = navCtn.querySelector('#navDropdownMenu');
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', function() {
    menu.style.display = 'none';
  });


  //=== 2.) เมื่อเปลี่ยน select ในเมนูเพื่อเลือกหน้ารายงาน
  const nav_reportType = navCtn.querySelector('#nav_reportType');
  if(nav_reportType) {
    nav_reportType.addEventListener('change', function() {
      if(nav_reportType.value) {
        window.location.href = nav_reportType.value;
      }
    });
  }

});



