
// ห้ามคลิกขวา
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});


let FLAG = true
const pwd = ['newPassword', 'confirmPassword']
document.getElementById("btnViewPassword").addEventListener('click', (e) => {
  e.preventDefault()
  pwd.forEach( id => {
    const elm = document.getElementById(id)
    if(elm){
      elm.type = FLAG ? 'text' : 'password'
    }
  })
  FLAG = !FLAG
})

// ตรวจสอบความตรงกันของรหัสผ่าน
document.getElementById('newPassword' ).addEventListener('input', checkPasswordMatch);
document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);
function checkPasswordMatch() {
  const newPwd = document.getElementById('newPassword');
  const confirmPwd = document.getElementById('confirmPassword');
  if (newPwd && confirmPwd) {
    if (newPwd.value !== confirmPwd.value) {
      newPwd.style.backgroundColor = 'yellow';
      confirmPwd.style.backgroundColor = 'yellow';
    } else {
      newPwd.style.backgroundColor = '';
      confirmPwd.style.backgroundColor = '';
    }
  }
}
