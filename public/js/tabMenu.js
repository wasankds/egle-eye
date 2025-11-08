
document.addEventListener("DOMContentLoaded", () => {  
  if(tabNumberClicked){
    document.getElementById(`tab${tabNumberClicked}Menu`).click()
  }else{
    document.getElementById('tab1Menu').click()
  }

  // // หมายเหตุ ในทุกๆเอกสาร ม่เกิน 5-9 บรรทัด
  // // - ทุกเอกสารใช้ชื่อเดียวกัน name=DOC_REMARK
  // const docs_remark = document.querySelectorAll("[name=DOC_REMARK]")
  // if(docs_remark){
  //   docs_remark.forEach( elm => {
  //     elm.addEventListener("input", function(event) {    
  //       const el = event.target
  //       // const rowsMin = parseInt(el.dataset.rowsMin)
  //       const rowsMax = parseInt(el.dataset.rowsMax)
  //       if(el.value.split('\n').length > rowsMax) {
  //         el.value = el.value.split('\n').slice(0, rowsMax).join('\n');
  //         showToast(`กรุณากรอกไม่เกิน ${rowsMax} บรรทัด`,'yellow',2000);
  //       }
  //     });
  //   });
  // }


})



// //==========================================================================
// // ป้องกนกด Enter แล้วส่งฟอร์มอัตโนมัติ
// //
// window.addEventListener('keydown', e => {
//   const isInputBody = e.target.nodeName == 'BODY' || e.target.nodeName == "INPUT"
//   if( e.key == 'Enter' && isInputBody ){
//     e.preventDefault();
//     return false ;
//   }
// },true) ;


//========================================================================== 
//
//
function openMenu(button, tabcontentId) {  
  const tabMenus = document.querySelectorAll(".tabMenu")
  Array.prototype.forEach.call( tabMenus, button => {
    delete button.dataset.active
    var startsWith = "bg-"
    var classes = button.className.split(" ").filter( v => {
      return v.lastIndexOf(startsWith, 0) !== 0;
    });
    button.className = classes.join(" ").trim()
  })
  //=== ปุ่มแท็บ
  button.classList.add('bg-tab1')
  button.dataset.active = 'active'

  //=== ซ่อนเนื้อหาทั้งหมด ไปก่อน 
  const tabcontents = document.querySelectorAll(".tabcontent");
  Array.prototype.forEach.call( tabcontents, tab => { 
    tab.style.display = "none"
  }) ;
  //=== เปิดแสดง content ตามแท็บที่ถูกคลิก 
  const activeTabContent = document.getElementById(tabcontentId)  
  activeTabContent.style.display = "block"
}
//==========================================================================
//
function hideTabs() {  
  // ปุ่มแท็บ - เอาแบ็คกราวน์ของปุ่มออกทั้งหมด
  const tabMenus = document.querySelectorAll(".tabMenu");
  Array.prototype.forEach.call( tabMenus, button => {
    delete button.dataset.active
    var startsWith = "bg-";
    var classes = button.className.split(" ").filter( v => {
      return v.lastIndexOf(startsWith, 0) !== 0;
    });
    button.className = classes.join(" ").trim();
  })
  //=== ซ่อนเนื้อหาทั้งหมด ไปก่อน 
  const tabcontents = document.querySelectorAll('.tabcontent')
  Array.prototype.forEach.call( tabcontents, tab => { 
    tab.style.display = "none"
  }) ;
}


// //==========================================================================
// //
// const DOC_REMARK = document.getElementById("DOC_REMARK");
// if(DOC_REMARK){
//   DOC_REMARK.addEventListener("input", function(event) {    
//     const el = event.target
//     if(el.value.split('\n').length > 9) {
//       el.value = el.value.split('\n').slice(0, 9).join('\n');
//       showToast('กรุณากรอกไม่เกิน 9 บรรทัด','yellow',2000);
//     }
//   });
// }