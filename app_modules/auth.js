var express = require('express');
const fs = require('fs');
var router = express.Router();
var login_var = require(__dirname + '/../login.json');
var help = require('./help');
var content = require('./content');

// Basics contets of views
var sidebar = content.call_content('text','sidebar')
var footer = content.call_content('text','footer')

// Aux functions
function login_check(user_id){
  return login_var.find(x => x.user_id.toString() === (user_id||0).toString())||false
}

router.login_check = login_check

router.get('/login', (req, res) =>{
  // Auth cheks
  var user_id = (typeof req.query.user_id !== 'undefined') ? req.query.user_id : false
  var logged = login_check(user_id)

  // Call view
  res.render('site/auth/login_form', {help: help, user_id: user_id, logged: logged, footer: footer, erro: false})
});

router.post('/login_do', (req, res) =>{

  // Get form values
  var user = req.body.user
  var password = req.body.password

  // Cheks password
  if (password == "topodamata"){
    user_id = Math.random().toString(26).slice(2);
    logged = true
    //Save loggin pass
    login_var_new = {
      user_id: user_id,
      logged: true,
      timestamp: Date.now()
    }
    // Delete old user id (if exists)
    login_var = login_var.filter(function( obj ) {
      return obj.user_id.toString() !== user_id.toString();
    });

    // Clean up old entrys
    login_var = login_var.filter(function( obj ) {
      return obj.timestamp > (Date.now() - help._MS_PER_DAY)
    });

    // Add user
    login_var.push(login_var_new)

    // Save auth file
    fs.writeFileSync("./login.json", JSON.stringify(login_var, null, 4))

    //Exclude all old articles
    //Deleting olders itens
    // d = new Date(Date.now()).getDate().toString()
    // m = (new Date(Date.now()).getMonth()).toString()
    // y = new Date(Date.now()).getFullYear().toString()
    // calendar_ = []
    // content.calendar.forEach(function(item){
    //   if (new Date(item.date.split('-').join(',')) >= new Date(y,m,d,00,00,00)){
    //     calendar_.push(item)
    //   }
    // });
    // content.calendar = calendar_
    //
    // // Cheks the limits
    // if (content.calendar.length > 20) content.calendar.length = 20
    //
    // // Json file save
    // fs.writeFileSync("./content/calendar.json", JSON.stringify(content.calendar, null, 4))

    // Call de view
    res.render('site/auth/login_form_pass', {help: help, user_id: user_id, footer: help.footer, logged: logged})
  }else{
    // Auth error
    user_id = 0
    logged = false
    res.render('site/auth/login_form', {user_id: user_id, erro: true})
  }
});

router.get('/logout', (req, res) =>{

  // Auth cheks
  var user_id = (typeof req.query.user_id !== 'undefined') ? req.query.user_id : false

  // Delete user id from user adm list
  login_var = login_var.filter(function( obj ) {
      return obj.user_id.toString() !== user_id.toString();
  });
  fs.writeFileSync("./login.json", JSON.stringify(login_var, null, 4))

  // Call view
  res.render('site/auth/logout',{help: help, user_id: user_id, logged: false, footer: footer})

});

module.exports = router;
