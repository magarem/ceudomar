const express = require('express');
const ejs = require('ejs')
const path = require('path')
const fs = require('fs');

// Upload module
const multer = require("multer");
var upload = multer({ storage: multer.memoryStorage({}) })

var showdown  = require('showdown');
var bodyParser = require('body-parser');

var help = require('./app_modules/help');
var auth = require('./app_modules/auth');

// Modules of contents
var text = require('./app_modules/text');
var calendar = require('./app_modules/calendar');


content = {}
content.text = text
content.calendar = calendar

// Init app
const app = express();

console.log('content:', content);

app.locals.content = content

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// Helpers functions
// function call_img(file=null){
//   if (file !="" & fs.existsSync('public/uploads/' + file)) {
//     return "<img src='uploads/"+ file + "'>"
//   }else{
//     return null
//   }
// }
// function call_content(type, id){
//   return content[type].find(function (item){return item.id == id});
// }
// var help = {
//   call_content: call_content,
//   call_img: call_img
// }

// Aux functions
// function login_check(user_id){
//   return login_var.find(x => x.user_id.toString() === (user_id||0).toString())||false
// }

// Load Sidebar
// converter = new showdown.Converter()
//
// sidebar_txt = fs.readFileSync('./sidebar.md', 'utf8').toString()
// sidebar_txt  = converter.makeHtml(sidebar_txt);
//
// footer_txt = fs.readFileSync('./footer.md', 'utf8').toString()
// footer_txt  = converter.makeHtml(footer_txt);

// function call_content_all(type){
//   return content[type];
// }


// Date aux
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
// Filter to show only the newers
var d = new Date(Date.now()).getDate().toString()
var m = new Date(Date.now()).getMonth().toString()
var y = new Date(Date.now()).getFullYear().toString()

// Basics contets of views
//var sidebar = text.call_content('sidebar')
//var footer = text.call_content('footer')

// Load modules
app.use('/calendar', calendar);
app.use('/text', text);
app.use('/auth', auth);

// ---------------------------------------------------------------------
// Routers
// ---------------------------------------------------------------------

app.get('/', (req, res) =>{

  // Get values
  var user_id = (typeof req.query.user_id !== 'undefined') ? req.query.user_id : false
  var logged = auth.login_check(user_id)

  calendar_ = []
  calendar.data.events.forEach(function(item){
    if (new Date(item.date.split('-').join(',')) >= new Date(y,m,d,00,00,00)){
      calendar_.push(item)
    }
  });
  calendar.data.events = calendar_

  // Load Sidebar
  // converter = new showdown.Converter()
  //
  // sidebar_txt = fs.readFileSync('./sidebar.md', 'utf8').toString()
  // sidebar_txt  = converter.makeHtml(sidebar_txt);
  //
  // footer_txt = fs.readFileSync('./footer.md', 'utf8').toString()
  // footer_txt  = converter.makeHtml(footer_txt);

  // sidebar = require("./content.json").find(function (item){return item.id = "sidebar"});
  // console.log("sidebar:", sidebar);
  // sidebar = call_content("text", "sidebar")
  // footer = call_content("text", "footer")

  // Call view
  res.render('site/home', {help: help, calendar: calendar.data, user_id: user_id, logged: logged})
});

app.get('/drive', (req, res) =>{

  // Get values
  var user_id = req.query.user_id
  var logged = auth.login_check(user_id)

  var data = text.call_byId('drive_virtual')

  // Call view
  res.render('site/drive_virtual', {help: help, user_id: req.query.user_id, data: data, logged: logged, text: text})
});

app.get('/page', (req, res) =>{

  // Get values
  var user_id = req.query.user_id
  var id = req.query.id
  var logged = auth.login_check(user_id)

  var data = text.call_byId(id)

  // Call view
  res.render('site/page', {help: help, user_id: user_id, logged: logged, data: data})

});


app.get('/img_delete', (req, res) => {
  if (login_check(req.body.user_id)){
    fs.unlinkSync('./public/uploads/' + req.query.img)
    res.send(req.query.img)
  }
});

const port = 3000;
const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};
app.listen(port, () => console.log('Server start on port ${port}'));
