/**************************************************************
***************************************************************
***************************************************************
***************************************************************
*************************** Window Utils **********************
***************************************************************
***************************************************************
***************************************************************
***************************************************************/

//============================================================
function closeWindow(btnClose){  
  const resultFrame = btnClose.closest('.window-ctn')
  if(resultFrame) {
    resultFrame.remove()
  }
}
// =================================================
function adjustWidthToggle(elm){
  const toogle = elm.dataset.toggle
  const body = document.getElementsByTagName("BODY")[0]
  if (toogle == '842px') {
    body.style.maxWidth = '100%'
    body.style.width = '100%'
    elm.dataset.toggle = '100%'
  } else{
    body.style.maxWidth = '842px'
    body.style.width = '842px'
    elm.dataset.toggle = '842px'
  }  
}
//================================================ 
function copyTable(btnCopy){
  if(!document.hasFocus()) return  

  const windowCtn = btnCopy.closest(".window-ctn")
  const tableElm = windowCtn.querySelector("table")
  if(!tableElm) return

  let textTable = ''  
  const rows = tableElm.rows
  const rowsNum = tableElm.rows.length
  
  for(let i=0; i<rowsNum; i++){
    const colsNum = rows[i].cells.length
    let rowText = ''
    
    for(let j=0; j<colsNum; j++){
      const cell = rows[i].cells[j]
      const cellText = cell.textContent.trim().replace(/\s{2,}/g,' ').replace(/\r\n|\r|\n/g,'')
      
      if(j > 0) rowText += '\t'  // เพิ่ม tab ก่อนคอลัมน์ที่ 2 เป็นต้นไป
      rowText += cellText
    }
    
    textTable += rowText + '\n'  // ใช้ \n แทน \r
  }

  navigator.clipboard.writeText(textTable)
  showToast('คัดลอกตารางเรียบร้อยแล้ว','blue')
}
//============================================= 
// 
// 
function moveWindow(span) {
  const action = span.dataset.direction
  const windowCtn = span.closest('.window-ctn')
  
  if (!windowCtn) { return }
  if (action === 'up') {
    const prev = windowCtn.previousElementSibling;
    if (prev) {
      windowCtn.parentNode.insertBefore(windowCtn, prev)
    }
  } else if (action === 'down') {
    const next = windowCtn.nextElementSibling
    if (next) {
      windowCtn.parentNode.insertBefore(next, windowCtn)
    }
  }
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

