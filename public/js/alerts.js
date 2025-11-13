//============================================================
document.addEventListener('DOMContentLoaded', function() {
  
  // //=== เรียงลำดับตาราง 
  // setTimeout( () => {  
  //   //=== ไม่มีการเรียง ถ้าไม่มี query string หรือ ไม่มี localstorage
  //   var sortColumnIndex = localStorage.getItem(`${PREFIX}_sortColumnIndex`) || -1
  //   var sortType = 'asc'
  //   if(sortColumnIndex && sortColumnIndex != -1){
  //     const tableHeader = document.getElementById('tableHeader')
  //     const header_td = tableHeader.querySelectorAll('th')[sortColumnIndex]
  //     sortTableJs(header_td, sortColumnIndex, sortType)
  //   }
  // }, 1)

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








//================================================ 
function copyTable(btnCopy){
  if(!document.hasFocus()) return  

  // const windowCtn = btnCopy.closest(".window-ctn")
  const tableElm = document.querySelector("table")
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





// //===========================================================
// // 
// function printUsersJs(btn){

//   const tableContent = document.getElementById('tableContent')
//   const _idArr = []
//   tableContent.querySelectorAll('tr').forEach( rowElm => {
//     const btnLoad = rowElm.querySelector(`input[name=_id]`)
//     if(btnLoad){ _idArr.push(btnLoad.value) }
//   })
//   // console.log('_idArr ===> ', _idArr)

//   if(_idArr.length == 0){ 
//     return  showToast('ไม่มีข้อมูลที่จะพิมพ์', 'yellow')    
//   }

//   createSpinner()
//   sendHttpRequest('post', PATH_PRINT, {_idArr:_idArr})
//     .then( rtn => {
//       if(!rtn.isPrint){
//         return showToast(rtn.msg, rtn.class)
//       }
//       const htmlPage = rtn.htmlPage
//       const blobHtml = new Blob([htmlPage], { type: 'text/html' })
//       const urlBlob = URL.createObjectURL(blobHtml)
//       const windowFeatures = 'width=800,height=1122,resizable=yes,scrollbars=yes'
//       window.open(urlBlob, '_blank', windowFeatures) 
//     }).catch( err => {
//       console.log(err)
//       showToast(err.message,'red')
//     }).finally( () => {
//       removeSpinner()
//     })
// }





