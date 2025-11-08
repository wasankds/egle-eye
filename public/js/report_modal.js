



//============================================== 
// 
// 
function popModalUsers(e){
  clearModalsAll()

  // const mousePos = {}
  // const rect = e.target.getBoundingClientRect()
  // mousePos.x = e.clientX - rect.left
  // mousePos.y = e.clientY - rect.top
  // //=== modal
  // const srhInput = e.target.value.toString().toLowerCase()
  // const modal = e.target.parentNode.querySelector('.modal')
  // modal.style.minWidth = rect.width + "px"
  // const modalList = e.target.parentNode.querySelector('.modal-list')
  // modalList.textContent = ''

  //=== คำค้นหา
  const mousePos = {}
  const srhInput = e.target.value.toString().toLowerCase()

  //=== modal - ขนาด/ตำแหน่ง/แสดง
  const rect = e.target.getBoundingClientRect();
  const modal = e.target.parentNode.parentNode.querySelector('.modal')
  modal.style.minWidth = rect.width + "px"
  const modalList = e.target.parentNode.parentNode.querySelector('.modal-list')
  modalList.textContent = ''

  //=== กรอง - แสดง 30 ลำดับเท่านั้น และ สถานะปกติเท่านั้น 
  const searchKeys = ['userId', 'userFullname']
  const filter = DATA_USERS.filter( obj => {
    return searchKeys.some( keyName => {
      return obj[keyName].toString().toLowerCase().indexOf(srhInput) !== -1 ;
    })
  })
  // .filter( row => { return row[U_Active-1] == 'active' })
  const res = filter.slice(0,30)
  // console.log(res)

  //=== 
  if(res.length > 0){

    //=== มีผลการค้นหา
    modal.style.maxWidth = (document.body.clientWidth - rect.left) + "px"
    res.forEach( (obj,i) => {
      const userId = obj.userId
      const userFullname = obj.userFullname
      const userFullnameShow = userFullname.length > 27 ? userFullname.substring(0, 27) + '...' : userFullname

      const p = document.createElement('p')
      p.classList.add('modal-p','flex-row')
      { // userPhone
        const span = document.createElement('span')
        span.textContent = `${userId}`
        span.classList.add("col-sm-2",'fc-lime')
        p.appendChild(span)
      }
      { // userFullname
        const span = document.createElement('span')
        span.title = userFullname
        span.textContent = userFullnameShow
        span.classList.add("col-sm-7")
        p.appendChild(span)
      }
      { // ลำดับ
        const span = document.createElement('span')
        span.textContent = `${i+1}/${filter.length}`
        span.classList.add("col-sm-1","al-r")
        p.appendChild(span)
      }
      
      p.onclick = () => {
        // กรอกชื่อนามสกุล
        e.target.value = userFullname
        // กรองเบอร์โทร
        const modalCtn = e.target.closest('.modalCtn')
        const userTelElm = modalCtn.nextElementSibling
        userTelElm.value = userId
        modal.classList.remove('show');
      }
      modalList.appendChild(p)
    })
    modal.classList.add('show');
    modal.style.left = mousePos.x + "px";
    modal.style.top = mousePos.y + "px";
  }else{
    modal.classList.remove('show');
  }
}


//============================================== 
// 
// 
function popModalBranches(e){
  clearModalsAll()

  // const mousePos = {}
  // const rect = e.target.getBoundingClientRect()
  // mousePos.x = e.clientX - rect.left
  // mousePos.y = e.clientY - rect.top
  // //=== modal
  // const srhInput = e.target.value.toString().toLowerCase()
  // const modal = e.target.parentNode.querySelector('.modal')
  // modal.style.minWidth = rect.width + "px"
  // const modalList = e.target.parentNode.querySelector('.modal-list')
  // modalList.textContent = ''

  //=== คำค้นหา
  const mousePos = {}
  const srhInput = e.target.value.toString().toLowerCase()

  //=== modal - ขนาด/ตำแหน่ง/แสดง
  const rect = e.target.getBoundingClientRect();
  const modal = e.target.parentNode.parentNode.querySelector('.modal')
  modal.style.minWidth = rect.width + "px"
  const modalList = e.target.parentNode.parentNode.querySelector('.modal-list')
  modalList.textContent = ''

  //=== กรอง - แสดง 30 ลำดับเท่านั้น และ สถานะปกติเท่านั้น 
  const searchKeys = ['branchId', 'branchName']
  const filter = DATA_BRANCHES.filter( obj => {
    return searchKeys.some( keyName => {
      return obj[keyName].toString().toLowerCase().indexOf(srhInput) !== -1 ;
    })
  })
  // .filter( row => { return row[U_Active-1] == 'active' })
  const res = filter.slice(0,20)
  // console.log(res)

  //=== 
  if(res.length > 0){

    //=== มีผลการค้นหา
    modal.style.maxWidth = (document.body.clientWidth - rect.left) + "px"
    res.forEach( (obj,i) => {
      const branchId = obj.branchId
      const branchName = obj.branchName
      const branchNameShow = branchName.length > 27 ? branchName.substring(0, 27) + '...' : branchName

      const p = document.createElement('p')
      p.classList.add('modal-p','flex-row')
      { // userPhone
        const span = document.createElement('span')
        span.textContent = `${branchId}`
        span.classList.add("col-sm-2",'fc-lime')
        p.appendChild(span)
      }
      { // branchName
        const span = document.createElement('span')
        span.title = branchName
        span.textContent = branchNameShow
        span.classList.add("col-sm-7")
        p.appendChild(span)
      }
      { // ลำดับ
        const span = document.createElement('span')
        span.textContent = `${i+1}/${filter.length}`
        span.classList.add("col-sm-1","al-r")
        p.appendChild(span)
      }
      
      p.onclick = () => {
        // กรอกชื่อนามสกุล
        e.target.value = branchName
        // กรองเบอร์โทร
        const modalCtn = e.target.closest('.modalCtn')
        const elmToFill = modalCtn.nextElementSibling
        elmToFill.value = branchId
        modal.classList.remove('show');
      }
      modalList.appendChild(p)
    })
    modal.classList.add('show');
    modal.style.left = mousePos.x + "px";
    modal.style.top = mousePos.y + "px";
  }else{
    modal.classList.remove('show');
  }
}






/**************************************************************
***************************************************************
***************************************************************
***************************************************************
*************************** Modal *****************************
***************************************************************
***************************************************************
***************************************************************
**************************************************************/

//============================================= 
// คลิกนอกกรอบ midal แล้วปิดหน้าต่าง
document.addEventListener('click', (e) => {
  if (!e.target.closest('.modalCtn')) {
    document.querySelectorAll('.modalCtn .modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }
})
//============================================= 
// Close all modals when ESC key is pressed -   V2.9
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearModalsAll()
  }
})
//============================================== 
function clearSearchModal(elm){
  elm.value=''
  const modalCtn = elm.closest('.modalCtn')
  if(modalCtn){
    const input = modalCtn.nextElementSibling
    if(input){
      input.value = ''
    }
  }
}
//===============================================================
function closeModal(e){
  const ctn = e.target.closest('.modalCtn')      
  const text = ctn.querySelector('input[type=text]')
  text.value = ''
  text.focus()
  ctn.querySelector('.modal').classList.remove('show');
}
//===============================================================
function hideModal(e){
  const ctn = e.target.closest('.modalCtn')
  ctn.querySelector('.modal').classList.remove('show')
}
//===============================================================
function clearModalsAll(){
  document.querySelectorAll('.modalCtn').forEach( ctn => {
    ctn.querySelector('.modal').classList.remove('show')
  })
}

function clearSelectOne(btn){
  btn.closest('div').querySelectorAll('input').forEach(input => input.value = '')
}


//==================================================================
//
//
function clearSelectAll(){

  if(!['O','S'].includes(USER_AUTHORITY)){ return  }

  // users
  const searchUser = document.getElementById('searchUser')
  if(searchUser) searchUser.value = ''
  const userId = document.getElementById('userId')
  if(userId) userId.value = ''

  // items
  const searchItem = document.getElementById('searchItem')
  if(searchItem) searchItem.value = ''  
  const itemId = document.getElementById('itemId')
  if(itemId) itemId.value = ''

  // jobs
  const searchJob = document.getElementById('searchJob')
  if(searchJob) searchJob.value = ''
  const jobId = document.getElementById('jobId')
  if(jobId) jobId.value = ''

  // docId
  const docId = document.getElementById('docId')
  if(docId) docId.value = ''

  // branch
  const searchBranch = document.getElementById('searchBranch')
  if(searchBranch) searchBranch.value = ''
  const branchId = document.getElementById('branchId')
  if(branchId) branchId.value = ''
}











/* 

//============================================== 
// แบบเก่า - อยู่ด้านขวามือ หามลบ
//
function popModalDocId(e){
  clearModalsAll()

  const rect = e.target.getBoundingClientRect()
  const modal = e.target.parentNode.querySelector('.modal')
  modal.style.minWidth = (rect.width + 100) + "px"
  const modalList = e.target.parentNode.querySelector('.modal-list')
  modalList.textContent = ''

  //=== กรอง - แสดง 30 ลำดับเท่านั้น และ สถานะปกติเท่านั้น 
  const selectMonth = document.getElementById('selectMonth').value
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(selectMonth)) {
    return showToast('กรุณาเลือกเดือนที่ต้องการดู','yellow')
  }
  const srhInput = e.target.value

  const searchKeys = [ 'docId', 'docDate']
  const filter = DATA_DOC_CONCLUDE.filter( obj => {
    return searchKeys.some( keyName => {
      return obj[`${keyName}`].toString().toLowerCase().indexOf(srhInput) !== -1 
             && obj.docDate.substring(0,7) == selectMonth
    })
  })
  const res = filter.slice(0,30)
  if(res.length == 0){
    return  modal.classList.remove('show')
  }

  res.forEach(( obj, i) => {
    const docId = obj.docId
    const docDate = obj.docDate

    const p = document.createElement('p')
    p.style.width = '100%'
    p.classList.add('row')
    {
      const span = document.createElement('span')
      span.classList.add("col-8-5")
      const span1 = document.createElement('span')
      // span1.classList.add('fc-lime')
      const span2 = document.createElement('span')
      span1.textContent = `${docId}`
      span2.classList.add('mg-l-l','fc-lime')
      span2.textContent = `[ ${docDate} ]`
      span.appendChild(span1)
      span.appendChild(span2)
      p.appendChild(span)
    }
    {
      const span = document.createElement('span')
      span.textContent = `${i + 1}/${filter.length}`
      span.classList.add("col-1-5","al-r","mg-l-xxl")
      p.appendChild(span)
    }

    p.onclick = () => {
      e.target.value = docId
      modal.classList.remove('show')
    }
    modalList.appendChild(p)
  })

  modal.classList.add('show')
  modal.style.left = rect.left + "px"
  modal.style.top = rect.bottom + "px"
}
  
*/









//============================================== 
//  V3.0
// function popModalDocId(e){
//   clearModalsAll()

//   const rect = e.target.getBoundingClientRect()
//   const modal = e.target.parentNode.querySelector('.modal')
//   modal.style.minWidth = (rect.width + 100) + "px"
//   const modalList = e.target.parentNode.querySelector('.modal-list')
//   modalList.textContent = ''

//   const srhInput = e.target.value
//   const filter = DATA_BMAIN.filter(r => r[0].indexOf(srhInput) !== -1)
//   filter.sort( (a,b) => a > b ? -1 : 1) // V3.0
//   const res = filter.slice(0, 30)

//   if (res.length == 0) {
//     return modal.classList.remove('show')
//   }

//   res.forEach((row, i) => {
//     const docId = row[0]
//     const p = document.createElement('p')
//     p.style.width = '100%'
//     p.classList.add('row')
//     {
//       const span = document.createElement('span')
//       span.textContent = docId
//       span.classList.add("col-80", 'fc-lime')
//       p.appendChild(span)
//     }
//     {
//       const span = document.createElement('span')
//       span.textContent = `${i + 1}/${filter.length}`
//       span.classList.add("col-20")
//       p.appendChild(span)
//     }
//     p.onclick = () => {
//       e.target.value = docId
//       // modal.classList.remove('show')
//       modal.remove()
//     }
//     modalList.appendChild(p)
//   })

//   modal.classList.add('show')
//   modal.style.left = rect.left + "px"
//   modal.style.top = rect.bottom + "px"
// }




// //============================================================ 
// function expandFrame(btn,percentNumber){  
//   const frame = btn.parentNode.parentNode.parentNode  
//   const classNameArr = frame.classList
//   classNameArr.forEach( cn => {
//     if(cn.search(/col-/g) != -1) frame.classList.remove(cn)
//   })
//   frame.classList.add("col-"+percentNumber)
// }
// //============================================================ 
// function switchflexWrap(btn){
//   const resultOACtn = btn.parentNode.parentNode.parentNode.parentNode
//   const wrap = resultOACtn.style.flexWrap
//   if(wrap == ''){ resultOACtn.style.flexWrap = 'wrap' ;
//   }else{ resultOACtn.style.flexWrap = '' ; }
// }








// //============================================== 
// //
// //
// function popModalItems(e){
//   clearModalsAll()
  
//   //=== 
//   const srhInput = e.target.value.toString().toLowerCase()
//   const mousePos = {}
//   const rect = e.target.getBoundingClientRect()
//   //=== modal - ขนาด/ตำแหน่ง/แสดง
//   const modal = e.target.parentNode.parentNode.querySelector('.modal')
//   if(!modal) return 
//   modal.style.minWidth = rect.width + "px"
//   const modalList = e.target.parentNode.parentNode.querySelector('.modal-list')
//   modalList.textContent = ''

//   //=== กรอง - แสดง 30 ลำดับเท่านั้น และ สถานะปกติเท่านั้น 
//   const searchKeys = ['itemId']
//   const filter = DATA_ITEMS.filter( obj => {
//     return searchKeys.some( keyName => {
//       return obj[keyName].toString().toLowerCase().indexOf(srhInput) !== -1 
//     })
//   })
//   const res = filter.slice(0,30)

//   if(res.length == 0){
//     return modal.classList.remove('show')
//   }

//   // //=== มีผลการค้นหา - ห้ามลบ
//   // modal.style.maxWidth = '850px'
//   // modal.style.minWidth = '600px'
//   res.forEach( (obj,i) => {
//     const itemId = obj.itemId
//     const itemName = obj.itemName
//     const itemNameShow = itemName.length > 37 ? itemName.substring(0, 37) + '...' : itemName
//     // 
//     const p = document.createElement('p')
//     p.classList.add('row')
//     { // itemId
//       const span = document.createElement('span')
//       span.textContent = itemId
//       span.classList.add("col-2-5",'fc-lime')
//       p.appendChild(span)
//     }
//     { // itemName
//       const span = document.createElement('span')
//       span.title = itemName
//       span.textContent = itemNameShow
//       span.classList.add("col-6", "mg-l-xxl")
//       p.appendChild(span)
//     } 
//     { // index
//       const span = document.createElement('span')
//       span.textContent = `${i+1}/${filter.length}`
//       span.classList.add("col-1-5",'pd-l-s','al-r') 
//       p.appendChild(span)
//     }
    
//     p.onclick = () => {
//       // กรอก1
//       e.target.value = itemName
//       // กรอก2
//       const modalCtn = e.target.closest('.modalCtn')
//       const fillElm = modalCtn.nextElementSibling
//       fillElm.value = itemId
//       modal.classList.remove('show');
//     }
//     modalList.appendChild(p)
//   })
//   modal.classList.add('show');
//   modal.style.left = mousePos.x + "px";
//   modal.style.top = mousePos.y + "px";
// }

// //============================================== 
// //
// //
// function popModalDocId(e){
//   clearModalsAll()

//   //=== คำค้นหา
//   // const mousePos = {}
//   const srhInput = e.target.value

//   //=== modal - ขนาด/ตำแหน่ง/แสดง
//   const rect = e.target.getBoundingClientRect();
//   const modal = e.target.parentNode.parentNode.querySelector('.modal')
//   modal.style.minWidth = rect.width + "px"
//   const modalList = e.target.parentNode.parentNode.querySelector('.modal-list')
//   modalList.textContent = ''

//   //=== กรอง - แสดง 30 ลำดับเท่านั้น และ สถานะปกติเท่านั้น 
//   const selectMonth = document.getElementById('selectMonth').value
//   const regex = /^\d{4}-\d{2}$/;
//   if (!regex.test(selectMonth)) {
//     return showToast('กรุณาเลือกเดือนที่ต้องการดู','yellow')
//   }

//     //=== กรอง - แสดง 30 ลำดับเท่านั้น และ สถานะปกติเท่านั้น 
//   const searchKeys = [ 'docId', 'docDate']
//   const filter = DATA_DOC_CONCLUDE.filter( obj => {
//     return searchKeys.some( keyName => {
//       return obj[`${keyName}`].toString().toLowerCase().indexOf(srhInput) !== -1 
//              && obj.docDate.substring(0,7) == selectMonth
//     })
//   })
//   const res = filter.slice(0,30)
//   // if(res.length == 0){ return  modal.classList.remove('show') }

//   res.forEach(( obj, i) => {
//     const docId = obj.docId
//     const docDate = obj.docDate
//     const docStatusNumber = obj.docStatusNumber
//     const customerName = obj.customerName
//     const customerNameShow = customerName.length > 37 ? customerName.substring(0, 37) + '...' : customerName

//     const p = document.createElement('p')
//     p.style.width = '100%'
//     p.classList.add('row')
//     {
//       const span = document.createElement('span')
//       span.classList.add("col-8-5")
//       const span1 = document.createElement('span')
//       const span2 = document.createElement('span')
//       span1.textContent = `${docId}`
//       span2.classList.add('mg-l-l','fc-lime')
//       span2.textContent = `[${docStatusNumber}] [${docDate}] ${customerNameShow}`
//       span.appendChild(span1)
//       span.appendChild(span2)
//       p.appendChild(span)
//     }
//     {
//       const span = document.createElement('span')
//       span.textContent = `${i + 1}/${filter.length}`
//       span.classList.add("col-1-5","al-r","mg-l-xxl")
//       p.appendChild(span)
//     }

//     p.onclick = () => {
//       e.target.value = docId
//       modal.classList.remove('show')
//     }
//     modalList.appendChild(p)
//   })

//   modal.classList.add('show')
//   modal.style.left = rect.left + "px"
//   modal.style.top = rect.bottom + "px"
// }