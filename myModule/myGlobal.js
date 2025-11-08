import path from 'path'
function pathToFolder( ...args){  
  const rootFolder = process.cwd()
  return path.join(rootFolder, ...args)
}
global.SYS_NAME = 'Eagle Eye Remote System'
global.SYS_NAME2 = ''
global.SYS_VERSION = '1.1.1'
// ใช้ในหน้า term and conditions
global.SYS_OWNER_FULLNAME = 'นายวสันต์ คุณดิลกเศวต'
global.SYS_OWNER_EMAIL = 'wasankds@gmail.com'
global.SYS_OWNER_PHONE = '081-459-8343'
global.PY_FILE_DHT11 =  process.env.PY_FILE_DHT11
// Database
global.dbName = process.env.DB_NAME
global.dbColl_settings = 'settings'
global.dbColl_settingsSystem = 'settingsSystem'
global.dbColl_sessions = 'sessions'
global.dbColl_users = 'users'
global.dbColl_usersResetPassword = 'usersResetPassword'
// ระบบ
global.PAGE_HOME = 'MMS'
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
// ให้จับจาก .env เวลาขึ้น Server หรือ Update จะได้ไม่มีปัญหา
global.BCRYPT_NUMBER = 12
global.USER_AUTHORITIES = ["O", "A", "U"]
global.USER_AUTHORITIES_TABLE = [ 
  { auth: "O", name : 'Owner', nameThai : 'เจ้าของระบบ' }, 
  { auth: "A", name : 'Admin', nameThai : 'ผู้ดูแลระบบ' }, 
  { auth: "U", name : 'User', nameThai : 'พนักงาน' }
]
global.USER_AUTHORITIES_TITLE = global.USER_AUTHORITIES_TABLE.reduce( (acc, obj) => {  
  acc += `${obj.auth} : ${obj.name} (${obj.nameThai})` + '\n'
  return acc
}, 'สิทธิ์ของผู้ใช้งาน\n\n');

// Message ต่างๆ
global.USERNAME_PATTERN = "^[a-z0-9_\\.\\-]{6,}$"
global.USERNAME_DESCRIPTION = "อักษรที่สามารถใช้เป็นชื่อยูสเซอร์ได้ a-z, 0-9, . , - อย่างน้อย 6 ตัวอักษร"
global.USER_SIGNATURE_DESCRIPTION = "ไฟล์ภาพ .png ไม่เกิน 1MB เท่านั้น ขนาดที่แนะนำ 330x120px"
global.PASSWORD_PATTERN = "^[a-zA-Z0-9._!@#%&*+\\-=]{6,}$"
global.PASSWORD_DESCRIPTION = "อักษรที่สามารถใช้เป็นพาสเวิร์ดได้ a-z, A-Z, 0-9, ., _, !, @, #, %, &, *, -, +, = อย่างน้อย 6 ตัวอักษร"
global.EMAIL_PATTERN = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
global.PHONE_PATTERN = "^[0-9]{9,10}$"
global.PHONE_DESCRIPTION = "เบอร์โทรศัพท์ 9-10 หลัก"
global.TELEGRAM_BOT_TOKEN_PATTERN = "^[0-9]+:[A-Za-z0-9_]+$"
global.TELEGRAM_BOT_TOKEN_DESCRIPTION = "โทเค็นบ็อต Telegram เช่น 123456789:AAH..."
global.GROUP_CHAT_ID_PATTERN = "^-?[0-9]{9,}$"
global.GROUP_CHAT_ID_DESCRIPTION = "ไอดีกลุ่ม Telegram เช่น -123456789"
// ไฟล์และโฟลเดอร์
global.folderPublic = pathToFolder('public')
global.folderImages = pathToFolder('public','images')
global.folderViews = pathToFolder('views')
global.folderPartials = pathToFolder('views','partials')
global.folderForms = pathToFolder('views','forms')
global.file404 = pathToFolder('public','static', '404.html')



global.NAV_LEFT = [
  { // 
    path: '/', 
    title: PAGE_HOME,
    icon: 'fas fa-home' ,
    menuColor : 'menu-blue', // ไม่มีในหน้า home
    userAuthorities: ['O','A','U'],
    separator: false,    
  },
]


global.NAV_USERS = [ // ผู้ใช้งาน
  {
    path: '/manage/users',
    title: PAGE_MANAGE_USERS,
    menuColor : 'menu-silver',
    icon: 'fas fa-users',
    userAuthorities: ['O','A'],
    separator: false
  },
  {
    path: '/manage/sessions',
    title: PAGE_MANAGE_SESSIONS,
    icon: 'fas fa-user-clock',
    menuColor : 'menu-silver',
    userAuthorities: ['O','A'],
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
    userAuthorities: ['O','A'],
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


