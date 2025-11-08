//==================================================
// แบบใหม่ - สร้าง Element ใหม่ขึ้นมาเองทั้งหมด 
//
function showToast(msg, classBorder="blue",ms=3000, sep="{{sep}}"){  
  const toastsAll = document.querySelectorAll('.toast')
  toastsAll.forEach( t => t.style.opacity = 0.5 )

  const toastElm = document.createElement('DIV')
  toastElm.style.zIndex = '99'
  toastElm.style.position = 'fixed'
  toastElm.style.left = '0'
  toastElm.style.bottom = `90px` // เริ่มที่ 90 จากล่าง ต้องตรงกับ CSS
  toastElm.style.width = '100%'
  toastElm.style.minWidth = '250px'
  toastElm.style.textAlign = 'center'
  toastElm.style.padding = '10px 5px'
  toastElm.style.animation = 'none'
  toastElm.style.animation = null
  toastElm.classList.add("toast",classBorder)
  // 
  const msgArr = msg.split(sep)
  msgArr.forEach( m => {    
    const p = document.createElement("P")
    p.style.lineHeight = "1.75rem"
    const span =  document.createElement('span')
    span.appendChild(document.createTextNode(m))
    p.appendChild(span)
    toastElm.appendChild(p)
  });

  toastElm.style.visibility = "visible"
  toastElm.style.animation = `fadeToastIn 0.5s, fadeToastOut 0.5s ${Number(ms/1000)}s`
  document.body.appendChild(toastElm)
  setTimeout( () => toastElm.remove(), ms)
}
//==================================================
//
//
function showToastStill(msg, classBorder="blue", sep="{{sep}}"){  
  const toastsAll = document.querySelectorAll('.toast')
  toastsAll.forEach( t => t.remove() )
  const toastElm = document.createElement('DIV')
  toastElm.style.zIndex = '99'
  toastElm.style.position = 'fixed'
  toastElm.style.left = '0'
  toastElm.style.bottom = `30px` // เริ่มที่ 30 จากล่าง ต้องตรงกับ CSS
  toastElm.style.width = '100%'
  toastElm.style.minWidth = '250px'  
  toastElm.style.textAlign = 'center'
  toastElm.style.padding = '16px 5px'
  toastElm.style.animation = 'none'
  toastElm.style.animation = null  
  // toastElm.style.lineHeight = "5rem"
  toastElm.classList.add("toast",classBorder)
  // 
  const msgArr = msg.split(sep)
  msgArr.forEach( ms => {    
    const p = document.createElement("P")
    const span =  document.createElement('span')
    span.appendChild(document.createTextNode(ms))
    p.appendChild(span)
    toastElm.appendChild(p)
  });
  toastElm.style.visibility = "visible"
  toastElm.style.animation = `fadeToastIn 0.5s`
  document.body.appendChild(toastElm)
}


//==================================================================
// EXCLUDE
// รายชื่อ Elements Id ถ้ามีชื่อในนี้ จะไม่มีการ Disabled (menuAction ไม่มีผล)
// เช่น const EXCLUDE = ['searchCoursesResNum']
// 
var btnCounter 
var btnFace = ""
function menuAction(btnElm=null, action=null, excludeElmIdArr=[]){
  const EXCLUDE=['_id','_pagePre','_pageNxt']

  if(excludeElmIdArr.length > 0){
    excludeElmIdArr.forEach( id => EXCLUDE.push(id) )
  }

  const queryDisable = 'input, select, button, a'
  const inputsDisable = document.querySelectorAll(queryDisable)  
  var i = 1 ;
  if(action == "disabled"){
    if(btnFace == "") btnFace = btnElm.value
    btnCounter = setInterval( () => btnElm.value = (i++/10).toFixed(1),100) ;
    inputsDisable.forEach( input => { 
      if(!EXCLUDE.includes(input.id)){       
        input.disabled = true 
      }
    })    
  }else if(action == "active"){ // ใช้ EXCLUDE เฉพาะ active
    inputsDisable.forEach( input => { 
      if(!EXCLUDE.includes(input.id)){       
        input.disabled = false
      }
    })
    clearTimeout(btnCounter)
    if(btnElm){
      btnElm.value = btnFace
      btnFace = ""
    }
  }
}
// //==================================================================
// //
// // 
// function menuActionAll(action=null){
//   const queryDisable = 'input, select, button, a'
//   const inputsDisable = document.querySelectorAll(queryDisable)
//   if(action == "disabled"){
//     inputsDisable.forEach( input => { input.disabled = true })    
//   }else if(action == "active"){
//     inputsDisable.forEach( input => { input.disabled = false})
//   }
// }
//========================================================================== 
// 
function onBtnClicked(btnClicked,state,isDisable=true){
  var btnGroup = btnClicked.parentNode
  const btnShow = btnGroup.querySelector(".btn-show")
  const btnConfirm = btnGroup.querySelector(".btn-confirm")
  const btnCancel = btnGroup.querySelector(".btn-cancel")  
  if(state == "ON"){
    btnShow.style.display = "none"        
    btnCancel.style.display = "inline-block"        
    btnConfirm.style.display = "inline-block"   
    if(isDisable){
      btnShow.disabled = false ;
      btnCancel.disabled = false ;
      btnConfirm.disabled = false ;
    }
    btnConfirm.style.gridColumn = "1/3";
    btnCancel.style.gridColumn = "3/5";
  }else if(state == "CANCEL" || state == "SUBMITTED"){
    btnShow.style.display = "inline-block"
    btnCancel.style.display = "none"
    btnConfirm.style.display = "none"
    if(isDisable){
      btnShow.disabled = false ;
      btnCancel.disabled = false ;
      btnConfirm.disabled = false ;
    }
  }else if(state == "CONFIRM"){
    btnShow.style.display = "none"
    btnCancel.style.display = "none"
    btnConfirm.style.display = "inline-block"
    btnConfirm.style.gridColumn = "1/5";
    if(isDisable){
      btnShow.disabled = true ;
      btnCancel.disabled = true ;
      btnConfirm.disabled = true ;
    }
  }
}
//===============================================================
//
function clearBtnGroupAll(isDisable=true){
  const btnShows = document.querySelectorAll('.btn-show')
  btnShows.forEach( btn => {
    if(isDisable){
      onBtnClicked(btn,"CANCEL")
    }else{
      onBtnClicked(btn,"CANCEL",false)
    }
  })
  clearToast()
}
//===========================================
//
function clearToast(){
  const toastOldAll = document.querySelectorAll('.toast')
  toastOldAll.forEach( t => t.remove() )
}

// //=============================
// //
// function adjustWidth(size){
//   const body = document.getElementsByTagName("BODY")[0]
//   body.style.maxWidth = size ;     
//   body.style.width = size ;
// }


//============================
// 
function createSpinner() {
  // 1. Create the Spinner Container
  const spinnerContainer = document.createElement('div');
  spinnerContainer.id = 'custom-spinner-container';
  spinnerContainer.classList.add('custom-spinner-container')
  spinnerContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75); // Semi-transparent backdrop
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000; `;

  // 2. Create the Spinner Element (Customize as needed)
  const spinner = document.createElement('div');
  spinner.id = 'custom-spinner';
  spinner.style.cssText = `
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 2s linear infinite;

    position: absolute;    
    top: 50%; 
    left: 50%;
    transform: translate(-50%, -50%); 
  `;

  // 3. Add Keyframes for Spinner Animation
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style); 

  // 4. Append Spinner to Container, Container to Body
  spinnerContainer.appendChild(spinner);
  document.body.appendChild(spinnerContainer);
}
//============================
// 
function removeSpinner() {
  const spinnerContainer = document.getElementById('custom-spinner-container');
  if (spinnerContainer) {
    spinnerContainer.remove();
  }

  document.querySelectorAll('custom-spinner-container').forEach( elm => {
    elm.remove()
  })
}


//=========================================
// ใช้สำหรับส่ง HTTP Request
// - เมื่อคืนค่ากลับมาจะถูกแปลงเป็น JSON
//
const sendHttpRequest = async (method, url, data) => {
  const response = await fetch(url, {
    method: method,
    body: JSON.stringify(data),
    headers: data ? { 'Content-Type': 'application/json' } : {}
  });
  //===  จัดการ error
  if(response.status >= 400){
    // throw new Error('Somthing went wrong !')
    //=== ส่ง error ที่กำหนดเองไปให้จุดเรียกใช้
    return response.json().then( errResData => {      
      // console.log(errResData) // {error: 'Missing password'}
      //=== สร้าง Error เอง
      const error = new Error('Somthing went wrong !')
      error.data = errResData // error ที่มาจาก API
      throw error
    })
  }
  return await response.json();
};


/***************************************************/
/***************************************************/
/***************************************************/
/***************************************************/
/***************************************************/
/****************** flatpickr **********************/
/***************************************************/
/***************************************************/
/***************************************************/
/***************************************************/
/***************************************************/




//============================================================== 
// ฟังก์ชันสำหรับสร้าง Thai Date Picker - ใช้งานกับ flatpickr ****
// ตัวอย่างการใช้งาน
// createThaiDatePicker("#quotationDate", 'bottom', today);
// createThaiDatePicker("#proposerDate", 'top-right');
// 
function createThaiDatePicker(selector, position='bottom', initialDate=null) {
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  //=== สร้าง flatpickr
  const fp = flatpickr(selector, {
    dateFormat: "Y-m-d",
    defaultDate: initialDate, // จะเป็น null ถ้าไม่ส่งมา
    allowInput: false,
    clickOpens: true,
    static: false,
    appendTo: document.body,

    // enable: false,  // 

    // ไม่แน่ใจว่าทำงาตอนไหน
    parseDate: function(datestr, format) {
      console.log(`Parsing date: ${datestr}`);
      if (monthNames.some(month => datestr.includes(month))) {
        const input = document.querySelector(selector);
        const isoDate = input.getAttribute('data-iso-date');
        return isoDate ? new Date(isoDate) : new Date();
      }else{
        console.warn(`Invalid date format: ${datestr}`);
      }
      return new Date(datestr);
    },

    // เมื่อเปิดปฏิทิน
    onOpen: function(selectedDates, dateStr, instance) {
      setTimeout( () => {        
        const calendar = instance.calendarContainer;
        const input = instance.input;
        const inputRect = input.getBoundingClientRect();
        if(position == 'top-right'){
          const left = inputRect.right - calendar.offsetWidth;
          const top = inputRect.top - calendar.offsetHeight;
          calendar.style.left = `${left}px`;
          calendar.style.top = `${top}px`;
        }else{ // bottom
          const left = inputRect.right - calendar.offsetWidth;
          const top = inputRect.bottom + window.scrollY;        
          calendar.style.left = `${left}px`;
          calendar.style.top = `${top}px`;
        }
      }, 0);
    },

    // เมื่อเลือกวันที่ในปฏิทิน
    // dateStr - 22 สิงหาคม 2568 - วันที่ที่เลือกไว้แล้ว ไม่ใช่วันที่ล่าสุดที่เลือก
    // selectedDates - Sat Aug 16 2025 00:00:00 GMT+0700 (Indochina Time)
    onChange: function(selectedDates, dateStr, instance) {
      if (selectedDates[0]) {
        if (selectedDates.length) {
          // วันที่ที่เลือกในปฏิทิน
          const dateObj = selectedDates[0]; 

          const day = dateObj.getDate();
          const month = dateObj.getMonth();
          const year = dateObj.getFullYear() + 543;
          const thaiDateFormat = `${day} ${monthNames[month]} ${year}`;
          const isoDateFormat = newDate_ISO(dateObj)

          const input = document.querySelector(selector);
          if (!input) {
            console.error(`Element with selector "${selector}" not found`);
            return;
          }
          input.value = thaiDateFormat;
          input.setAttribute('data-iso-date', isoDateFormat);
          input.setAttribute('data-thai-date', thaiDateFormat);
        }
      }
    },
    onClose: function(selectedDates, dateStr, instance) {
      const thaiDate = instance.input.getAttribute('data-thai-date');
      if (thaiDate && instance.input.value !== thaiDate) {
        instance.input.value = thaiDate;
      }
    }
  });

  //=== ตั้งค่าเริ่มต้น - รอให้ DOM พร้อม (เฉพาะเมื่อมี initialDate)
  if (initialDate) {
    setTimeout(() => {
      const input = document.querySelector(selector);
      if (!input) {
        console.error(`Element with selector "${selector}" not found`);
        return;
      }      
      const day = initialDate.getDate();
      const month = initialDate.getMonth();
      const year = initialDate.getFullYear() + 543;
      const thaiDateFormat = `${day} ${monthNames[month]} ${year}`;
      const isoDateFormat = newDate_ISO(initialDate);

      input.value = thaiDateFormat;
      input.setAttribute('data-iso-date', isoDateFormat);
      input.setAttribute('data-thai-date', thaiDateFormat);
    }, 10);
  }

  return fp;
}

//================================= 
// 
function clear_FlatpickrElm(id, isDisable=false){
  const el = document.getElementById(id)
  el.value = '';
  delete el.dataset.thaiDate;
  delete el.dataset.isoDate;
  if(isDisable){
    el.disabled = true;
  }else{
    el.disabled = false;
  }
  // if (window.flatpickr) {
  //   const today = new Date();
  //   // สร้าง date picker สำหรับแต่ละ input
  //   createThaiDatePicker("#docDateTh", 'bottom');
  //   // createThaiDatePicker("#approverDateTh", 'top-right');
  //   // createThaiDatePicker("#proposerDateTh", 'top-right', today);
  //   docDateTh.disabled = false;
  // }
}



//=============================================================
// ถ้าไม่ส่ง dateObj ใช้เวลาปัจจุบัน
// ตัวอย่างการคืนค่า 2025-08-12
//
function newDate_ISO(dateObj=new Date()){
  const date = dateObj.getDate() < 10 ? "0"+dateObj.getDate() : dateObj.getDate()
  const month = (dateObj.getMonth()+1) < 10 ? "0"+(dateObj.getMonth()+1) : (dateObj.getMonth()+1)
  const year = dateObj.getFullYear().toString() 
  return `${year}-${month}-${date}`
}
//=============================================================
// ถ้าไม่ส่ง dateObj ใช้เวลาปัจจุบัน
// ตัวอย่างการคืนค่า 2025-08-12 14:30
//
function newDateTime_ISO(dateObj=new Date()){
  const date = dateObj.getDate() < 10 ? "0"+dateObj.getDate() : dateObj.getDate()
  const month = (dateObj.getMonth()+1) < 10 ? "0"+(dateObj.getMonth()+1) : (dateObj.getMonth()+1)
  const year = dateObj.getFullYear().toString() // .substring(2,4)
  const hour = dateObj.getHours() < 10 ? "0"+dateObj.getHours() : dateObj.getHours()
  const minute = dateObj.getMinutes() < 10 ? "0"+dateObj.getMinutes() : dateObj.getMinutes()
  return `${year}-${month}-${date} ${hour}:${minute}`  
}

//=============================================================
// ถ้าไม่ส่ง dateObj ใช้เวลาปัจจุบัน
// ตัวอย่างการคืนค่า 2025-08-12 14:30
//
function now(){
  const dateObj = new Date();
  const date = dateObj.getDate() < 10 ? "0"+dateObj.getDate() : dateObj.getDate()
  const month = (dateObj.getMonth()+1) < 10 ? "0"+(dateObj.getMonth()+1) : (dateObj.getMonth()+1)
  const year = dateObj.getFullYear().toString() // .substring(2,4)
  const hour = dateObj.getHours() < 10 ? "0"+dateObj.getHours() : dateObj.getHours()
  const minute = dateObj.getMinutes() < 10 ? "0"+dateObj.getMinutes() : dateObj.getMinutes()
  const second = dateObj.getSeconds() < 10 ? "0"+dateObj.getSeconds() : dateObj.getSeconds()
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`  
}

//================================= 
// แปลงวันที่ไทย เป็น ISO
// - เช่น thaiDate = 12 สิงหาคม 2568
//   แปลงเป็น isoDate = 2025-08-12
function format_StringDate_Thai_to_ISO(thaiDate) {  
  const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
  const [day, monthName, year] = thaiDate.split(' ');
  const month = monthNames.indexOf(monthName)+1;
  return `${year-543}-${String(month).padStart(2,'0')}-${String(day).padStart(2, '0')}`;
}
//================================= 
// แปลงวันที่ ISO เป็นไทย
// - เช่น isoDate = 2025-08-12
//   แปลงเป็น thaiDate = 12 สิงหาคม 2568
function format_StringDate_ISO_to_Thai(dateObj) {
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear() + 543;
  return `${day} ${monthNames[month]} ${year}`;
}



//================================= 
// แปลงเดือนไทย เป็น ISO
// - เช่น thaiMonth = สิงหาคม 2568
//   แปลงเป็น isoMonth = 2025-08
function format_StringMonth_Thai_to_ISO(thaiMonth) {  
  const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
  const [monthName, year] = thaiMonth.split(' ');
  const month = monthNames.indexOf(monthName)+1;
  return `${year-543}-${String(month).padStart(2,'0')}`;
}

//================================= 
// แปลงเดือนไทย เป็น ISO
// - เช่น thaiMonth = 2025-08
//   แปลงเป็น สิงหาคม 2568
function format_StringMonth_ISO_to_Thai(isoMonth) {  
  const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
  const [year, month] = isoMonth.split('-');
  const monthName = monthNames[Number(month)-1];
  return `${monthName} ${Number(year)+543}`;
}



//============================================
//  คำนวณหาความต่างของวัน/เวลา 
//  - คืนค่าเป็น 'days num  Days : hour num Hours, minutes num Minutes
//    และ หรือจำนวน Milllseconds คงเหลือ
// 
// - dateTime1String วันที่และเวลาในรูปแบบเช่น 2025-09-10 11:30
// - dateTime2String วันที่และเวลาในรูปแบบเช่น 2025-09-10 11:30
// *** อะไรจะมากกว่ากันก็ได้ แล้วแต่ว่าต้องการตรวจสอบอะไร ****
//  
function calc_DiffDateTime(dateTime1String, dateTime2String) {
  // console.log("================ calc_DiffDateTime ================")
  // console.log("dateTime1String ===> ", dateTime1String)
  // console.log("dateTime2String ===> ", dateTime2String)

  const dtNow = new Date(dateTime1String)
  const dtChk = new Date(dateTime2String)
  
  const aDayMs = 86400000 // milliseconds in a day
  const anHourMs = 3600000 // milliseconds in an hour  
  const diffMs = dtChk - dtNow // milliseconds // const diffMs = Math.abs(dtNow - dt2 ) // milliseconds
  const diffDays = Math.floor(diffMs / aDayMs); // days
  const diffHrs = Math.floor((diffMs % aDayMs) / anHourMs); // hours
  const diffMins = Math.round(((diffMs % aDayMs) % anHourMs) / 60000); // minutes
  const diffSecs = Math.round((((diffMs % aDayMs) % anHourMs) % 60000) / 1000); // seconds
  // console.log("================")
  // console.log("diffMs ===> ", diffMs)
  // console.log("diffDays ===> ", diffDays)
  // console.log("diffHrs ===> ", diffHrs)
  // console.log("diffMins ===> ", diffMins)
  // console.log("diffSecs ===> ", diffSecs)
  // console.log("================")

  if(      diffMs > 0 && diffDays > 0){
    return { diffMs, diffDhm: `${diffDays} วัน ${diffHrs} ชั่วโมง ${diffMins} นาที` }
  }else if(diffMs > 0 && diffDays == 0 && diffHrs > 0){
    return { diffMs, diffDhm: `${diffHrs} ชั่วโมง ${diffMins} นาที` }
  }else if(diffMs > 0 && diffDays == 0 && diffHrs == 0 && diffMins > 0){
    return { diffMs, diffDhm: `${diffMins} นาที` }
  }else if(diffMs > 0 && diffDays == 0 && diffHrs == 0 && diffMins == 0 && diffSecs > 0){
    return { diffMs, diffDhm: `${diffSecs} วินาที` }
  }else if(diffMs <= 0){
    return { diffMs, diffDhm: `-` }
  }
}













// //=============================================================
// //   DATE FORMAT - สำหรับจัดรูปแบบวันที่และเวลา
// function formatDateAndTime(dateObj=new Date(),
//                            isBuddhist=false,
//                            isMonthLong=true,
//                            isYearLong=true,
//                            isShowTime=false,
//                            isSecond=true){
//   const monthNames = [
//     "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
//     "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
//   ];
//   const monthNamesShort = [
//     "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
//     "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
//   ];
//   const date = dateObj.getDate()
//   const month = dateObj.getMonth()
//   const monthDisplay = isMonthLong == true ? monthNames[month] : monthNamesShort[month]
//   var year = isBuddhist == false ? dateObj.getFullYear() :  dateObj.getFullYear()+543
//   year = isYearLong == false ? year.toString().substring(2,4) : year
//   if(isShowTime == true){
//      const hour = dateObj.getHours() < 10 ? "0"+dateObj.getHours() : dateObj.getHours()
//      const minute = dateObj.getMinutes() < 10 ? "0"+dateObj.getMinutes() : dateObj.getMinutes()
//      if(isSecond == true){
//        const second = dateObj.getSeconds() < 10 ? "0"+dateObj.getSeconds() : dateObj.getSeconds()
//        return `${date} ${monthDisplay} ${year} ${hour}:${minute}:${second}`
//      }else{
//        return `${date} ${monthDisplay} ${year} ${hour}:${minute}`
//      }
//   }else{
//      return `${date} ${monthDisplay} ${year}`
//   } 
// }


// // ปรับความสูงของ textarea - docRemark ให้อยู่ในช่วง 5-9 บรรทัด
// // ตามเนื้อหาใน textarea
// function adjust_textarea_rows(min=5, max=9){
//   let linesText = docRemark.value.split('\n').length;
//   docRemark.rows = linesText < min ? min : linesText > max ? max : linesText;
// }








// //============================================================
// // *** Sort จาก element เลย ***
// // 
// function sortTableJs(sortColumnIndex, type='asc') { 
//   const tableHeader = document.getElementById('tableHeader')
//   if(tableHeader){
//     const q='label span:first-child, label span:last-child'
//     tableHeader.querySelectorAll(q).forEach( span => {
//       span.style.opacity = 0.1
//     })
//   }
//   if(event.target.tagName == 'SPAN'){
//     event.target.style.opacity = 1
//   }
  
//   const tableContent = document.getElementById('tableContent')
//   const rowElms = Array.from(tableContent.querySelectorAll('.row'))

//   //=== 1. Determine the column to sort by
//   if (sortColumnIndex === -1) {
//     console.error('column not found by index')
//     return
//   }

//   //=== 2. Extract the values from each row to be sorted
//   const extractedValues = rowElms.map(row => {
//     const cells = Array.from(row.querySelectorAll('div'))
//     let value = ''
//     if (cells[sortColumnIndex]) { // check if exist then access it.
//       value = cells[sortColumnIndex].textContent.trim()
//     }
//     return { row, value:isNaN(value) ? value : parseFloat(value) }
//   })
  
//   //=== 3. Sort based on the type
//   extractedValues.sort((a, b) => {
//     if (a.value < b.value) { return type === 'asc' ? -1 : 1 }
//     if (a.value > b.value) { return type === 'asc' ? 1 : -1 }
//     return 0
//   })

//   //=== 4. Re-append sorted rows to the table
//   tableContent.innerHTML = '' // Clear the existing content  
//   extractedValues.forEach( item => tableContent.appendChild(item.row) )// Append all row

//   // //=== 5. Save localstorage สำหรับใช้ตอนโหลดหน้าใหม่
//   // localStorage.setItem(`${PREFIX}_sortColumnIndex`, sortColumnIndex)
//   // localStorage.setItem(`${PREFIX}_sortType`, type)
// }








// //============================================================
// // *** Sort จาก element เลย ***
// // 
// function sortItemsTableJs(sortColumnIndex, type='asc') { 
//   const tableHeader = document.getElementById('tableHeader')
//   if(tableHeader){
//     const q='label span:first-child, label span:last-child'
//     tableHeader.querySelectorAll(q).forEach( span => {
//       span.style.opacity = 0.1
//     })
//   }
//   if(event.target.tagName == 'SPAN'){
//     event.target.style.opacity = 1
//   }
  
//   const tableContent = document.getElementById('tableContent')
//   const rowElms = Array.from(tableContent.querySelectorAll('.row'))

//   //=== 1. Determine the column to sort by
//   if (sortColumnIndex === -1) {
//     // console.error('column not found by index')
//     return
//   }

//   //=== 2. Extract the values from each row to be sorted
//   const extractedValues = rowElms.map(row => {
//     const cells = Array.from(row.querySelectorAll('div input,div select'))
//     let value = ''
//     if (cells[sortColumnIndex]) { // check if exist then access it.
//       value = cells[sortColumnIndex].value.trim()
//     }
//     return { row, value:isNaN(value) ? value : parseFloat(value) }
//   })
  
//   //=== 3. Sort based on the type
//   extractedValues.sort((a, b) => {
//     if (a.value < b.value) { return type === 'asc' ? -1 : 1 }
//     if (a.value > b.value) { return type === 'asc' ? 1 : -1 }
//     return 0
//   })

//   //=== 4. Re-append sorted rows to the table
//   tableContent.innerHTML = '' // Clear the existing content  
//   extractedValues.forEach( item => tableContent.appendChild(item.row) )// Append all row

//   // //=== 5. Save localstorage สำหรับใช้ตอนโหลดหน้าใหม่
//   // localStorage.setItem(`${PREFIX}_sortColumnIndex`, sortColumnIndex)
//   // localStorage.setItem(`${PREFIX}_sortType`, type)
// }



// //============================================================
// // *** Sort จาก element เลย ***
// // 
// function sortTableJs(sortColumnIndex, type='asc') {
//   const tableContent = document.getElementById('tableContent')
//   const rowElms = Array.from(tableContent.querySelectorAll('.row'))

//   //=== 1. Determine the column to sort by
//   if (sortColumnIndex === -1) {
//     console.error('column not found by index');
//     return
//   }

//   //=== 2. Extract the values from each row to be sorted
//   const extractedValues = rowElms.map(row => {
//     const cells = Array.from(row.querySelectorAll('div'))
//     let value = ''
//     if (cells[sortColumnIndex]) { // check if exist then access it.
//       value = cells[sortColumnIndex].textContent.trim()
//     }
//     return { row, value: isNaN(value) ? value : parseFloat(value) }
//   })
//   // console.log(extractedValues);

//   //=== 3. Sort based on the type
//   extractedValues.sort((a, b) => {
//     if (a.value < b.value) { return type === 'asc' ? -1 : 1 }
//     if (a.value > b.value) { return type === 'asc' ? 1 : -1 }
//     return 0
//   })

//   //=== 4. Re-append sorted rows to the table
//   tableContent.innerHTML = '' // Clear the existing content  
//   extractedValues.forEach( item => tableContent.appendChild(item.row) )// Append all row

//   //=== 5. Save localstorage สำหรับใช้ตอนโหลดหน้าใหม่
//   localStorage.setItem(`${PREFIX}_sortColumnIndex`, sortColumnIndex)
//   localStorage.setItem(`${PREFIX}_sortType`, type)
// }







// //====================
// // 
// // 
// function loadOptions(arr, selectElm, isFirst=null){
//   if(isFirst){
//     const option = document.createElement('option')
//     option.textContent = '-'
//     option.value = ''
//     selectElm.appendChild(option)
//   }
//   arr.forEach( imgName => {
//     const option = document.createElement('option')
//     option.textContent = imgName
//     option.value = imgName
//     selectElm.appendChild(option)
//   })
// }


// //=== สำหรับอัปโหลดไฟล์ โดยใช้ Ajax === ห้ามลบ เก็บไว้เป็นสำรอง
// //=== ใช้งานได้ดี - ไม่ต้องใช้ปุ่ม Upload 
// // - แต่จะอัปโหลดเมื่อเลือกไฟล์เลย ต้องทำไฟล์ File Filter ดีๆ 
// const URL = `http://localhost:8001/test/upload`
// const fileInput2 = document.getElementById('file-input2');
// fileInput2.onchange = async (event) => {
//   const file = await event.target.files[0];    

//   //=== เฉพาะไฟล์ที่ระบุเท่านั้น
//   if (!file.name.match(/\.(jpg|jpeg|mp4)$/i)) {
//     showToast("Please select only a JPEG/MP4 file!","red")
//     return;
//   }

//   //===
//   menuActionAll('disabled')
//   showToastStill('Uploading Please wait','blue')
//   const formData = new FormData();
//   formData.append('file', file);
//   const response = await fetch( URL, {
//     method: 'POST',
//     body: formData,
//     headers : {
//       // 'Content-Type': 'image/jpeg', // ระบุ Content-Type ไม่ได้ จะ Error 
//       'enctype': 'multipart/form-data',
//     }
//   }).then( async (res) => {          
//     const resJson = await res.json()
//     showToast(resJson.msg,"green")
//   }).catch( error => {
//     console.log("error.toString() ===> ", error.toString());
//   }).finally( () => {
//     clearToast()
//     menuActionAll('active')
//     fileInput2.value = ''
//   })
// }
















// //==================================================
// // ห้ามลบ Toast แบบเปลี่ยนระดับขึ้นไปเรื่อยๆ  *** ห้ามลบ ***
// //
// function showToast_V3(msg, classBorder="blue",ms=3000, sep="\n"){  
//   const toastsAll = document.querySelectorAll('.toast')
//   const toastNum = toastsAll.length
//   if(toastNum > 0){
//     const bottomTxt = toastsAll[toastNum-1].style.bottom
//     var bottomLastOld = Number(bottomTxt.replace("px",""))
//     if(bottomLastOld >= 800){ var bottom = 100 }
//     else{ var bottom = bottomLastOld+60 }
//   }else{ var bottom = 100 }

//   const toastElm = document.createElement('DIV')
//   toastElm.style.zIndex = '99'
//   toastElm.style.position = 'fixed'
//   toastElm.style.left = '0'
//   toastElm.style.bottom = `${bottom}px` // เริ่มที่ 100 จากล่าง
//   toastElm.style.width = '100%'
//   toastElm.style.minWidth = '250px'  
//   toastElm.style.color = 'white'
//   toastElm.style.textAlign = 'center'
//   toastElm.style.padding = '16px 5px'
//   //
//   toastElm.style.animation = 'none'
//   toastElm.style.animation = null
//   toastElm.classList.add("toast")
//   if(classBorder == 'blue'){    
//     toastElm.style.borderTop = '3px solid darkslateblue'
//     toastElm.style.borderBottom = '3px solid darkslateblue'
//     toastElm.style.backgroundColor = 'DodgerBlue'
//   }else if(classBorder == 'green'){
//     toastElm.style.borderTop = '3px solid lime'
//     toastElm.style.borderBottom = '3px solid lime'
//     toastElm.style.backgroundColor = 'darkgreen'
//   }else if(classBorder == 'red'){
//     toastElm.style.borderTop = '3px solid red'
//     toastElm.style.borderBottom = '3px solid red'
//     toastElm.style.backgroundColor = 'darkred'
//   }
//   // 
//   const msgArr = msg.split(sep)
//   msgArr.forEach( ms => {    
//     const p = document.createElement("P")
//     const span =  document.createElement('span')
//     span.appendChild(document.createTextNode(ms))
//     p.appendChild(span)
//     toastElm.appendChild(p)
//   });

//   let dynamicStyles = null;
//   function addAnimation(body) {
//     if (!dynamicStyles) {
//       dynamicStyles = document.createElement('style');
//       // dynamicStyles.type = 'text/css';
//       document.head.appendChild(dynamicStyles);
//     }  
//     dynamicStyles.sheet.insertRule(body, dynamicStyles.length);
//   }
  
//   addAnimation(`@keyframes fadein { 
//     from { bottom:0; opacity:0; }
//     to { bottom:${bottom}px; opacity:1;}
//   }`); // ไปที่ 100 แล้วแปสดงให้ขัด
//   toastElm.style.visibility = "visible"
//   toastElm.style.animation = `fadein 0.5s, fadeout 0.5s ${Number(ms/1000)}s`
//   document.body.appendChild(toastElm)
//   setTimeout( () => toastElm.remove(), ms)
// }




// //==================================================
// //
// function openTab(e, tabCtn) {
//   const tcs = document.querySelectorAll(".tabcontent");
//   tcs.forEach( t => t.style.display = "none" )
//   //
//   const tls = document.querySelectorAll(".tab button");
//   tls.forEach( t => t.className = t.className.replace(" active", "") )
//   document.getElementById(tabCtn).style.display = "block";
//   e.currentTarget.className += " active";
// }

// //==================================================
// //
// function openInnerTab(e, tabCtn) {
//   const ctnElm = document.getElementById(tabCtn)
//   const colCtn = ctnElm.parentNode
//   // 
//   const tcs = colCtn.querySelectorAll(".inner-tabcontent");
//   tcs.forEach( t => t.style.display = "none" )
//   //
//   const tls = colCtn.querySelectorAll(".inner-tab button");
//   tls.forEach( t => t.className = t.className.replace(" active", "") )
//   ctnElm.style.display = "block";
//   e.currentTarget.className += " active";
// }



// //========================================
// // ป้องกันกด Enter แล้วส่งฟอร์ม
// // - แบบใส่ในแท็ก form  onkeydown="return event.key != 'Enter';"
// window.addEventListener('keydown', (e) => {        
//   if (e.key === 'Enter') {
//     const isTextareaFocused = document.activeElement && 
//                               document.activeElement.tagName === 'TEXTAREA';
//     if (!isTextareaFocused) {
//       e.preventDefault()
//       return false
//     }
//   }
// })


