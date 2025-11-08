const btnViewPassword = document.getElementById("btnViewPassword")
let FLAG = true
const pwd = ['userPassword']
if(btnViewPassword){
  document.getElementById("btnViewPassword").addEventListener('click', (e) => {
    e.preventDefault()
    pwd.forEach( id => {
      const elm = document.getElementById(id)
      if(elm){
        elm.type = FLAG ? 'text' : 'password'
      }
    })
    FLAG = !FLAG
  })
}