// ใช้กับ flash message 
// .page-notify ต้องตรงกับที่ใช้ใน notify.ejs
const notifyElm = document.querySelector('.page-notify')  ;
document.addEventListener("DOMContentLoaded", () => {
  if(notifyElm){
    setTimeout( () => {
      // notifyElm.classList.add("dp-n")
      notifyElm.remove()
    }, 3000)
  }      
}) 
  
