



//============================================================
document.addEventListener('DOMContentLoaded', function() {
  
  // //=== สำหรับการเรียงลำดับในตารางค้นหา เมื่อโหลดหน้าเว็บใหม่ทุกครั้ง
  // const sortColumnIndex = localStorage.getItem(`${PREFIX}_sortColumnIndex`) || -1
  // const sortType = localStorage.getItem(`${PREFIX}_sortType`) || 'asc'
  // if(sortColumnIndex && sortColumnIndex != -1 && sortType){
  //   sortTableJs(sortColumnIndex, sortType)
  // }

  // //=== เมื่อเปลี่ยนค่าใน sip
  // // - เปลี่ยนค่าของ name='sip' ทุกตัวให้เป็นค่าเดียวกัน 
  // const sipElm = document.getElementById('sip')
  // if(sipElm){
  //   sipElm.oninput = (e) => {
  //     const sip = e.target.value
  //     document.querySelectorAll('[name=sip]').forEach( el => {
  //       if(el.id != 'sip'){
  //         el.value = sip
  //       }
  //     })
  //   }
  // }

  //=== เรียงลำดับตาราง 
  setTimeout( () => {  
    //=== ไม่มีการเรียง ถ้าไม่มี query string หรือ ไม่มี localstorage
    var sortColumnIndex = localStorage.getItem(`${PREFIX}_sortColumnIndex`) || -1
    var sortType = 'asc'
    if(sortColumnIndex && sortColumnIndex != -1){
      const tableHeader = document.getElementById('tableHeader')
      const header_td = tableHeader.querySelectorAll('th')[sortColumnIndex]
      sortTableJs(header_td, sortColumnIndex, sortType)
    }
  }, 1)

})




//============================================================
// *** Sort จาก element ***
// 
function sortTableJs(th_Clicked, sortColumnIndex, sortType=null){
  try{
    //=== จับค่าจาก localstorage หากมีการเรียงลำดับเดิม
    const sortType_local = localStorage.getItem(`${PREFIX}_sortType`)
    const sortColumnIndex_local = localStorage.getItem(`${PREFIX}_sortColumnIndex`)
    // console.log('sortType_local ===> ', sortType_local)
    // console.log('sortColumnIndex_local ===> ', sortColumnIndex_local)
    // console.log('sortColumnIndex ===> ', sortColumnIndex)
  
    //=== sortType จะระบุมาเฉพาะตอนโหลดหน้าเว็บ 
    // - ถ้าไม่ระบุ จะเป็นการเรียงหัลงจากโหลดหน้าเว็บแล้ว (ให้จับจาก localstorage)
    if(!sortType){
      // คลิกคอลัน์เดิม สลับค่า asc <===> dsc
      if(sortColumnIndex_local == sortColumnIndex){
        sortType = sortType_local == 'asc' ? 'desc' : 'asc'
      }else{
        sortType = 'asc'        
      }
    }

    //=== 
    if(th_Clicked.tagName == 'TH'){
      //===
      const tableHeader = document.getElementById('tableHeader')    
      tableHeader.querySelectorAll('th span').forEach( td => td.remove() )
      // 
      const span = document.createElement('span')
      span.textContent = sortType == 'asc' ? '▲' : '▼'
      span.style.color = sortType == 'asc' ? 'plum' : 'yellow'
      th_Clicked.appendChild(span)
    }
  
    //=== 
    const tableContent = document.getElementById('tableContent')
    const trElms = Array.from(tableContent.querySelectorAll('tr'))
  
    //=== 1. Determine the column to sort by
    if (sortColumnIndex === -1) {
      return console.error('column not found by index')
    }
  
    //=== 2. Extract the values from each row to be sorted
    const extractedValues = trElms.map( (tr,index) => {
      // console.log('tr ==> ', tr)
      const tdElms = Array.from(tr.querySelectorAll('td'))
      let value = ''
      if (tdElms[sortColumnIndex]) {
        const tdValue = tdElms[sortColumnIndex].textContent.trim().replace(/[\▲\▼\,]/g, '')
        value = tdValue
      }
  
      //=== value อาจเป็นค่าว่าง
      // - ถ้าเป็นตัวเลขที่ไม่ isNaN ให้แปลงเป็น float
      if(value){
        var valueConvert = isNaN(value) ? value : parseFloat(value)
      }else{
        var valueConvert = value
      }
      return { row:tr, value:valueConvert }
    })
    
    //=== 3. Sort based on the type
    extractedValues.sort((a, b) => {
      //=== ถ้าเป็นค่าว่าง ให้ไปด้านล่าง
      if (a.value === null || a.value === '') return 1
      if (b.value === null || b.value === '') return -1
      //=== เรียงตามปกติ
      if (a.value < b.value) { return sortType === 'asc' ? -1 : 1 }
      if (a.value > b.value) { return sortType === 'asc' ? 1 : -1 }
      return 0
    })
  
    //=== 4. Re-append sorted rows to the table
    tableContent.innerHTML = ''    
    extractedValues.forEach( item => tableContent.appendChild(item.row) )
  
    //=== 5. Save localstorage สำหรับใช้ตอนโหลดหน้าใหม่
    localStorage.setItem(`${PREFIX}_sortColumnIndex`, sortColumnIndex)
    localStorage.setItem(`${PREFIX}_sortType`, sortType)
  }catch(err){
    console.log('err ==> ', err)
  }

}



// //========================================
// // สร้าง option ใหม่ใน select userAuthority
// // - เพราะบางครั้งจะตอนโหลดจะไม่เหมอนกันทุกครั้ง
// // - เช่น ถ้าเป็นตัวเองที่กำลังใช้งานอยู่ จะไม่มี A ให้เลือก
// function newUserJs(e){
//   const form = e.target.closest('form');
//   if(form) {
//     form.userId ? form.userId.value = '' : null
//     form._id ? form._id.value = '' : null
//     form.userEmail ? form.userEmail.value = '' : null
//     form.userPassword ? form.userPassword.value = '' : null
//     form.username ? form.username.value = '' : null
//   }
  
//   //=== สร้าง option ใหม่ สำหรับ userAuthority
//   const userAuthorityElm = form.userAuthority
//   userAuthorityElm.textContent = ''
//   const fistOption = document.createElement('option')
//   fistOption.value = ''
//   fistOption.textContent = '-'
//   userAuthorityElm.appendChild(fistOption)
//   USER_AUTHORITIES.forEach( option => {
//     const opt = document.createElement('option')
//     opt.value = option
//     opt.textContent = option
//     userAuthorityElm.appendChild(opt)
//   })
// }


//=================================================
// 
// 
const btnClearForm = document.getElementById('btnClearForm')
if(btnClearForm){
  btnClearForm.addEventListener('click', (e) => {
    e.preventDefault();
    clearForm(e);
  })
}
//========================================
// สร้าง option ใหม่ใน select userAuthority
// - เพราะบางครั้งจะตอนโหลดจะไม่เหมอนกันทุกครั้ง
// - เช่น ถ้าเป็นตัวเองที่กำลังใช้งานอยู่ จะไม่มี A ให้เลือก
function clearForm(e){
  e.preventDefault();
  const form = e.target.closest('form');
  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }
  
  //=== สร้าง option ใหม่ สำหรับ userAuthority
  const navForm = document.getElementById('navForm')
  const userAuthority_login = navForm.userAuthority_login.value
  if(userAuthority_login == 'O'){
    var userAuthoritysToUse = [...USER_AUTHORITIES]
  }else if(userAuthority_login == 'A'){
    var userAuthoritysToUse = ['A','U']
  }

  //=== สร้าง option ใหม่ สำหรับ userAuthority
  const userAuthorityElm = form.userAuthority
  userAuthorityElm.textContent = ''
  
  const fistOption = document.createElement('option')
  fistOption.value = ''
  fistOption.textContent = '-'
  userAuthorityElm.appendChild(fistOption)
  userAuthoritysToUse.forEach( option => {
    const opt = document.createElement('option')
    opt.value = option
    opt.textContent = option
    userAuthorityElm.appendChild(opt)
  })
}




//========================================
// สร้าง User ใหม่โดยไม่ส่งอิเมล์
//
const btnCreateNew = document.getElementById('btnCreateNew')
if(btnCreateNew){
  btnCreateNew.addEventListener('click', (e) => {
    e.preventDefault();
    createNewUser_suddenly();
  })
}
function createNewUser_suddenly(){ 
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "ยืนยันการสร้างผู้ใช้ใหม่",
      text: "คุณต้องการสร้างผู้ใช้ใหม่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    }).then((result) => {
      if (result.isConfirmed) {
        // createSpinner()
        sendHttpRequest('post', PATH_NEW, {})
          .then( rtn => {
            if(!rtn.isCreate){
              showToast(rtn.msg, 'red')
            }else if(rtn.isCreate && rtn.redirectUrl){
              showToast(rtn.msg, 'green')
              setTimeout(() => {
                window.location.href = rtn.redirectUrl
              }, 3000)
            }
          }).catch( err => {
            console.log(err)
            showToast(err.message,'red')
          }).finally( () => {
            // removeSpinner()
          })
      }
    })
  }
}



//===========================================================
// 
document.querySelectorAll('.btn-delete').forEach(btn => {
  btn.addEventListener('click', deleteJs)
})
function deleteJs(e){
  // console.log('deleteJs');
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
      if (result.isConfirmed) {
        const btn = e.target
        const form = btn.closest('form');
        if (form) { form.submit(); }
      }
    });
    return;
  }
  
  // //=== ดักด้วย Confirm Input
  // const confirmInput = window.prompt("กรอกคำว่า 'confirm' เพื่อยืนยันการลบ");
  // if (confirmInput != 'confirm') { return }

  // // ใช้ form submit แทน AJAX
  // const form = btn.closest('form')
  // if (form) { form.submit() }

  // // รวมรวมอิเลเมนต์จาก form แล้วสร้าง FormData
  // const formData = new FormData(form);
  // const data = {};
  // formData.forEach((value, key) => {
  //   data[key] = value;
  // });
  // menuAction(btn,'disabled')  
  // sendHttpRequest('post', PATH_DELETE, data)
  //   .then( rtn => {      
  //     console.log('rtn ===> ', rtn)  
  //   }).catch( err => {
  //     console.log(err)
  //   }).finally( () => {
  //     menuAction(btn,'active')
  //   })
}



//===========================================================
// 
function printUsersJs(btn){

  const tableContent = document.getElementById('tableContent')
  const _idArr = []
  tableContent.querySelectorAll('tr').forEach( rowElm => {
    const btnLoad = rowElm.querySelector(`input[name=_id]`)
    if(btnLoad){ _idArr.push(btnLoad.value) }
  })
  // console.log('_idArr ===> ', _idArr)

  if(_idArr.length == 0){ 
    return  showToast('ไม่มีข้อมูลที่จะพิมพ์', 'yellow')    
  }

  createSpinner()
  sendHttpRequest('post', PATH_PRINT, {_idArr:_idArr})
    .then( rtn => {
      if(!rtn.isPrint){
        return showToast(rtn.msg, rtn.class)
      }
      const htmlPage = rtn.htmlPage
      const blobHtml = new Blob([htmlPage], { type: 'text/html' })
      const urlBlob = URL.createObjectURL(blobHtml)
      const windowFeatures = 'width=800,height=1122,resizable=yes,scrollbars=yes'
      window.open(urlBlob, '_blank', windowFeatures) 
    }).catch( err => {
      console.log(err)
      showToast(err.message,'red')
    }).finally( () => {
      removeSpinner()
    })
}




/**********************************************/
/**********************************************/
/**********************************************/
/******************** Changes *****************/
/**********************************************/
/**********************************************/
/**********************************************/
//===========================================================
// 
// ประวัติการแก้ไขเอกสาร
document.querySelectorAll('.btn-print-changes').forEach(btn => {
  btn.addEventListener('click', (event) => {
    event.preventDefault();

    const form = btn.closest('form')
    const userId = form.userId.value
    const pathForm = form.action

    if(!userId){
      showToast('ไม่พบ userId ที่ต้องการพิมพ์', 'yellow', 2000)
      return
    }

    printChanges(userId, pathForm);
  })
})
function printChanges(userId, pathForm){  
  const data = { userId }

  createSpinner()
  sendHttpRequest('post', pathForm, data)
    .then( rtn => {
      if(!rtn.isPrint){
        showToast(rtn.msg, rtn.class);
        return
      }
      const htmlPage = rtn.htmlPage
      const blobHtml = new Blob([htmlPage], { type: 'text/html' })
      const urlBlob = URL.createObjectURL(blobHtml)
      // const windowFeatures = 'width=850,height=1122,resizable=yes,scrollbars=yes'
      const windowFeatures = 'width=794,height=1122,resizable=yes,scrollbars=yes';
      window.open(urlBlob, '_blank', windowFeatures)
    }).catch( err => { 
      console.log(err)
      showToast(err.toString(),'red')
    }).finally( () => {
      removeSpinner()
    })

}


