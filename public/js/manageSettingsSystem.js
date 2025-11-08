



// const itemsForm = document.getElementById('itemsForm');
// if(itemsForm){
//   itemsForm.addEventListener('submit', function(event) {
//     event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ
//     // createSpinner();
  
//     Swal.fire({
//       title: 'โปรดยืนยันการลบ?',
//       text: "พิมพ์คำว่า confirm เพื่อยืนยันการลบ!",
//       icon: "warning",
//       input: 'text',
//       inputPlaceholder: 'พิมพ์ว่า confirm',
//       showCancelButton: true,
//       confirmButtonText: "ยืนยัน",
//       cancelButtonText: "ยกเลิก",
//       preConfirm: (value) => {
//         if (value !== "confirm") {
//           Swal.showValidationMessage("กรุณาพิมพ์คำว่า 'confirm' ให้ถูกต้อง");
//         }
//       }
//     }).then((result) => {
//       if (result.isConfirmed && result.value === "confirm") {
//         Swal.fire({
//           title: "กำลังดำเนินการ...",
//           text: "โปรดรอสักครู่",
//           allowOutsideClick: false,
//           didOpen: () => { Swal.showLoading() }
//         });
        
//         itemsForm.submit();
//       }
//     }).finally(() => {
//       // removeSpinner();
//     });
//   });
    
// }