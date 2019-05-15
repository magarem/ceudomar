const fs = require('fs');
// Get login data
// var login_var = require(__dirname + '/../login.json');
// Get content of site
// var content = {}
// content.calendar = require(__dirname + '/../content/calendar.json');
// content.text = require(__dirname + '/../content/text.json')

// // Aux functions
// function login_check(user_id){
//   return login_var.find(x => x.user_id.toString() === (user_id||0).toString())||false
// }
// Helpers functions
function call_img(file=null, fit=0){
  if (file !="" & fs.existsSync('public/uploads/' + file)) {
    var width = (fit==0)? "" : "style='width:"+ fit + "'"
    return "<img " + width + " src='/uploads/"+ file + "'>"
  }else{
    return null
  }
}
// function call_content(type, id){
//   return content[type].find(function (item){return item.id == id});
// }
// // Basics contets of views
// var sidebar = call_content('text','sidebar')
// var footer = call_content('text','footer')
// Consts aux
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
module.exports = {
    _MS_PER_DAY: _MS_PER_DAY,
    // login_var: login_var,
    // login_check: login_check,
    // call_content: call_content,
    call_img: call_img,
    // content: content,
    // sidebar: sidebar,
    // footer: footer
}
