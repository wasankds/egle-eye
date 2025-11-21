import path from 'path'
function pathToFolder( ...args){  
  const rootFolder = process.cwd()
  return path.join(rootFolder, ...args)
}
global.SYS_NAME = 'ตาเหยี่ยว'
global.SYS_NAME2 = 'บินเดี่ยว'
global.SYS_VERSION = '1.0'
// ใช้ในหน้า term and conditions
global.SYS_OWNER_FULLNAME = 'นายวสันต์ คุณดิลกเศวต'
global.SYS_OWNER_EMAIL = 'wasankds@gmail.com'
global.SYS_OWNER_PHONE = '081-459-8343'
// ค่าคงที่ระบบ
global.DB_ENCRYPTED = process.env.DB_ENCRYPTED == 1 ? true : false;
global.BCRYPT_NUMBER = 12
// GPIO Pin & Devices
// global.LED1_PIN = 17;   // พิน 11 - ยกเลิกใช้
// global.LED1_STATE = 0;   // เริ่มต้น LED ปิด (0=ปิด, 1=เปิด) - ยกเลิกใช้
global.BTN1_PIN = 12;   // พิน 32
global.BTN2_PIN = 16;   // พิน 36
// Relay 1 & 2
global.RELAY1_PIN = 20;  // พิน 38
global.RELAY1_STATE = 1; // เริ่มต้นรีเลย์ปิด (1=ปิด, 0=เปิด) - Active Low
global.RELAY2_PIN = 21; // พิน 40 - ***
global.RELAY2_STATE = 1; // เริ่มต้นรีเลย์ปิด (1=ปิด, 0=เปิด) - Active Low
// // 
// global.SERVO1_PIN = 18 // พิน 12
// global.SERVO2_PIN = 13 // พิน 33 
//== Stepper Motor
global.STEPPER1_PIN1 = 17   // พิน 11
global.STEPPER1_PIN2 = 18   // พิน 12
global.STEPPER1_PIN3 = 27   // พิน 13
global.STEPPER1_PIN4 = 22   // พิน 15
// Database
global.dbName = process.env.DB_NAME
// global.dbColl_settings = 'settings'              // ไม่ได้ใช้แล้ว
// global.dbColl_settingsSystem = 'settingsSystem'  // ไม่ได้ใช้แล้ว
// global.dbColl_sessions = 'sessions' // ไม่ได้ใช้แล้ว
// global.dbColl_users = 'users'       // ไม่ได้ใช้แล้ว
// global.dbColl_usersResetPassword = 'usersResetPassword'  // ไม่ได้ใช้แล้ว
// ระบบ
global.PAGE_HOME = 'ตาเหยี่ยว'
global.PAGE_TERM = 'ข้อกำหนดและเงื่อนไข'
global.PAGE_LOGIN = 'เข้าสู่ระบบ'
global.PAGE_MANAGE_USERS = 'จัดการผู้ใช้งาน'
global.PAGE_MANAGE_SETTINGS = 'ตั้งค่า'
global.PAGE_MANAGE_SETTINGS_SYSTEM = 'ตั้งค่าระบบ'
global.PAGE_MANAGE_SESSIONS = 'จัดการเซสชั่น'
global.PAGE_USERS = 'ผู้ใช้งาน'
global.PAGE_USER_INFO = 'ข้อมูลผู้ใช้งาน'
global.PAGE_PASSWORD_FORGOT = 'ลืมรหัสผ่าน'
global.PAGE_PASSWORD_RESET = 'รีเซ็ตรหัสผ่าน'
global.PAGE_SWITCH = 'สวิตช์'
global.PAGE_CAMERA = 'กล้อง'
global.PAGE_VIDEOS = 'วิดีโอ'
global.USER_AUTHORITIES = ["O", "A", "U"]
global.USER_AUTHORITIES_TABLE = [ 
  { auth: "O", name : 'Owner', nameThai : 'เจ้าของระบบ' }, 
  { auth: "A", name : 'Admin', nameThai : 'สมาชิก' }, 
  { auth: "U", name : 'User', nameThai : 'อื่นๆ' }
]
global.USER_AUTHORITIES_TITLE = global.USER_AUTHORITIES_TABLE.reduce( (acc, obj) => {  
  acc += `${obj.auth} : ${obj.name} (${obj.nameThai})` + '\n'
  return acc
}, 'สิทธิ์ของผู้ใช้งาน\n\n');

// Message ต่างๆ
global.USERNAME_PATTERN_STRING = "^[a-z0-9_\\.\\-]{6,}$"
global.USERNAME_PATTERN_REGEX = new RegExp(global.USERNAME_PATTERN_STRING)
global.USERNAME_DESCRIPTION = "อักษรที่สามารถใช้เป็นชื่อยูสเซอร์ได้ a-z, 0-9, . , - อย่างน้อย 6 ตัวอักษร"
global.PASSWORD_PATTERN_STRING = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&_-])[a-zA-Z0-9!@#$%^&_-]{6,}$"
global.PASSWORD_PATTERN_REGEX = new RegExp(global.PASSWORD_PATTERN_STRING) // (?=.*[a-z]) ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว // (?=.*[A-Z]) ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว // (?=.*[!@#$%^&_-]) ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว // [a-zA-Z0-9!@#$%^&_-]{6,} ความยาวอย่างน้อย 6 ตัว
global.PASSWORD_DESCRIPTION = "รหัสผ่านอย่างน้อย 6 ตัวอักษร ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และอักขระพิเศษ(! @ # $ % ^ & _ -) อย่างน้อยอย่างละ 1 ตัว "
global.EMAIL_PATTERN_STRING = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
global.EMAIL_PATTERN_REGEX = new RegExp(global.EMAIL_PATTERN_STRING)
global.EMAIL_APP_PASSWORD_STRING = "[0-9a-zA-Z]{4}\\s[0-9a-zA-Z]{4}\\s[0-9a-zA-Z]{4}\\s[0-9a-zA-Z]{4}"
global.EMAIL_APP_PASSWORD_REGEX = new RegExp(global.EMAIL_APP_PASSWORD_STRING)
global.EMAIL_APP_PASSWORD_DESCRIPTION = "รหัสผ่านแอปพลิเคชันอีเมล์ 16 ตัวอักษร แบ่งเป็น 4 กลุ่ม กลุ่มละ 4 ตัวอักษร คั่นด้วยช่องว่าง เช่น xxxx xxxx xxxx xxxx"
global.TELEGRAM_BOT_TOKEN_PATTERN_STRING = "^[0-9]+:[A-Za-z0-9_]+$"
global.TELEGRAM_BOT_TOKEN_PATTERN_REGEX = new RegExp(global.TELEGRAM_BOT_TOKEN_PATTERN_STRING)
global.TELEGRAM_BOT_TOKEN_DESCRIPTION = "โทเค็นบ็อต Telegram เช่น 123456789:AAH..."
global.GROUP_CHAT_ID_PATTERN_STRING = "^-?[0-9]{9,}$"
global.GROUP_CHAT_ID_PATTERN_REGEX = new RegExp(global.GROUP_CHAT_ID_PATTERN_STRING)
global.GROUP_CHAT_ID_DESCRIPTION = "ไอดีกลุ่ม Telegram เช่น -123456789"
// global.PHONE_PATTERN_STRING = "^[0-9]{9,10}$"
// global.PHONE_PATTERN_REGEX = new RegExp(global.PHONE_PATTERN_STRING)
// global.PHONE_DESCRIPTION = "เบอร์โทรศัพท์ 9-10 หลัก"
// ไฟล์และโฟลเดอร์
global.folderPublic = pathToFolder('public')
global.folderImages = pathToFolder('public','images')
global.folderViews = pathToFolder('views')
global.folderPartials = pathToFolder('views','partials')
global.folderForms = pathToFolder('views','forms')
global.folderData = pathToFolder('data')
//=== ใช้เป็น abs path ไปยังพาทของโฟลเดอร์ videos เช่น wasankds@pi3:~/videos $ 
if(process.platform === 'linux'){
  global.folderVideos = pathToFolder('..','videos')
  global.folderVideosExtract = pathToFolder('..','videos-extract')
} else {
  global.folderVideos = pathToFolder('videos')
  global.folderVideosExtract = pathToFolder('videos-extract')
}
global.folderVideosMp4 = pathToFolder('videos-mp4')
global.folderBackup = pathToFolder('backup')
global.fileDb = pathToFolder('data', 'db.json')
global.file404 = pathToFolder('public','static', '404.html')

global.NAV_LEFT = [
  {
    path: '/switch', 
    title: PAGE_SWITCH,
    icon: 'fas fa-toggle-on', // ไอค่อนรูปสวิตช์
    menuColor : 'menu-blue',
    userAuthorities: ['O','A','U'],
    separator: false,    
  },
  {
    path: '/camera',
    title: PAGE_CAMERA,
    icon: 'fas fa-video', // ไอค่อนรูปกล้อง
    menuColor : 'menu-green',
    userAuthorities: ['O','A'],
    separator: false,
  },
  {
    path: '/videos',
    title: PAGE_VIDEOS,
    icon: 'fas fa-file-video',
    menuColor : 'menu-green',
    userAuthorities: ['O','A','U'],
    separator: false,
  }
]


global.NAV_USERS = [ // ผู้ใช้งาน
  {
    path: '/manage/users',
    title: PAGE_MANAGE_USERS,
    menuColor : 'menu-silver',    
    icon: 'fas fa-users-cog',    // icon: 'fas fa-users',
    userAuthorities: ['O'],
    separator: false
  },
  {
    path: '/manage/sessions',
    title: PAGE_MANAGE_SESSIONS,
    icon: 'fas fa-user-clock',
    menuColor : 'menu-silver',
    userAuthorities: ['O'],
    separator: false
  }
]

//======================== 
// เมนูด้านขวา
// 
global.NAV_RIGHT = [
  {
    path: '/manage/settings',
    title: PAGE_MANAGE_SETTINGS,
    icon: 'fas fa-sliders-h',
    menuColor : 'menu-silver',
    userAuthorities: ['O'],
    separator: false, 
  },
  {
    path: '/manage/settings/system',
    title: PAGE_MANAGE_SETTINGS_SYSTEM,
    icon: 'fas fa-gear',
    menuColor : 'menu-silver',
    userAuthorities: ['O'],
    separator: false
  },
  {
    path: '/term-and-conditions',
    title: PAGE_TERM,
    icon: 'fas fa-file-contract',
    menuColor : 'menu-silver',
    userAuthorities: ['O','A','U'],
    separator: false
  },
]


