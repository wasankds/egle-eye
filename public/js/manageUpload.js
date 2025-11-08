

document.addEventListener("DOMContentLoaded", () => {
  const btnSubmits = document.querySelectorAll('main form input[type=submit]')
  btnSubmits.forEach( btn => {
    btn.onclick = (e) => {
      uploadFile(e)
    }
  })
})


//===========================================================
function uploadFile(e){
  const btnSubmit = e.target
  btnSubmit.disabled = true
  const form = btnSubmit.form ;
  //===
  const fileElm = form.querySelector('input[type=file]')
  const afile  = fileElm.files[0] ;
  if(!afile){
    e.preventDefault()
    btnSubmit.disabled = false
    showToast("โปรดเลือกไฟล์","red", 2000)
    return
  }

  form.method = 'post';
  form.action = `${PATH_UPLOAD_FILE}/${btnSubmit.dataset.id}` ;
  form.submit();
  menuAction(btnSubmit,'disabled')
}





// //===========================================================
// // ซิงค์ข้อมูลจาก Excel ไปที่ DB
// // 
// const btnExcelFinanceToDb = document.getElementById("btnExcelFinanceToDb")
// btnExcelFinanceToDb.addEventListener("click", (e) => {
//   clearBtnGroupAll()
//   const btn = e.target
//   const filename = btn.dataset.filename
//   const data = {filename:filename}
//   excelFinanceToDbJs(e,data)
// })
// function excelFinanceToDbJs(e,data){
//   const btn = e.target

//   // //=== ดักด้วย Confirm Input
//   // const confirmInput = window.prompt("กรอกคำว่า 'confirm' เพื่อยืนยัน");
//   // if (confirmInput != 'confirm') {
//   //   return showToast('ยกเลิก','yellow')
//   // }

//   onBtnClicked(btn,'CONFIRM')
//   menuAction(btn,'disabled')
  
//   sendHttpRequest('post', URL_UPLOAD_EXCEL2DATABASE, data)
//     .then( rtn => {      
//       console.log(rtn)
//       if(!rtn.isSync){
//         return showToast(rtn.msg, rtn.class)
//       }      
//       showToast(rtn.msg, rtn.class, 5000)
      
//       // //== 1. ลบแถวในตาราง
//       // const _id2Delete = rtn._id2Delete
//       // const rowElm = btn.closest('.row')
//       // if(rowElm){
//       //   rowElm.classList.add('bg-red')
//       //   setTimeout( () => { rowElm.remove() },1000)
//       // }

//       // //== 2. อัพเดทข้อมูลใน Memory
//       // let indexFound = -1
//       // DATA_USERS.forEach( (obj,i) => {      
//       //   if(obj._id == _id2Delete){
//       //     return indexFound = i
//       //   }
//       // })   
//       // if(indexFound != -1) {
//       //   DATA_USERS.splice(indexFound,1)
//       // }
//     }).catch( err => {
//       showToast(err.message,'red')
//       console.log(err)
//     }).finally( () => {
//       onBtnClicked(btn,'SUBMITTED')
//       menuAction(btn,'active')
//     })
// }