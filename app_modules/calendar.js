var express = require('express');
const ejs = require('ejs')
const path = require('path')
const fs = require('fs');

const multer = require("multer");
var upload = multer({ storage: multer.memoryStorage({}) })

var bodyParser = require('body-parser');

var help = require('./help');
var auth = require('./auth');

// Get data
var data = require('../content/calendar.json');

// Get login data
var login_var = require('../login.json');
// Helpers functions
function call_byId(data, id){
  return data.find(function (item){return item.id == id});
}

// Consts aux
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// Basics contents of views
// var data = content.call_content_all('calendar')
// var sidebar = call_content(data.text, 'sidebar')
// var footer = call_content(data.text, 'footer')

var router = express.Router();


router.get('/evento_show', (req, res) => {

  // Get values
  var user_id = req.query.user_id
  var id = req.query.id
  var logged = auth.login_check(req.query.user_id)

  //debug
  console.log('id:', id);

  //Select evento
  evento = data.events.filter(function (item) {
   return item.id === id;
  })

  //debug
  console.log('evento:', evento);

  // Call view
  res.render('site/calendar/evento_show', {help: help, evento: evento[0], user_id: user_id, logged: logged})

});

router.get('/evento_edit', (req, res) => {

  // Get values
  var user_id = req.body.user_id||req.query.user_id
  var id = req.query.id
  var logged = auth.login_check(user_id)

  // Auth checks
  if (logged){

    var evento = {
      id: id,
      title: "",
      date: "",
      time: "",
      farda: "",
      hinario: "",
      price: "",
      obs: ""}

    // Get event
    evento_filter = data.events.filter(function (item) {
      return item.id === id;
    })[0]

    evento = evento_filter ? evento_filter : evento

    // Get images list in uploads directory
    var img_files = fs.readdirSync('./public/uploads')

    // Call view
    res.render('site/calendar/evento_form', {help: help, user_id: user_id, logged: logged, evento: evento, files: img_files})
  }else{
    res.send("erro!")
  }
});

router.post('/evento_edit_do', upload.single('blob'), (req, res, next) => {

  // Auth cheks
  if (auth.login_check(req.body.user_id)){

    // Get id
    var id = req.body.id

    //Get the name of a existent image or use null
    var imgName = req.body.img_||""

    // Checks out if has a uploaded image
    if (req.body.blob){
      //Ser a img hash name
      var img_name_hash = Math.random().toString(26).slice(2)
      var base64Data = req.body.blob.replace(/^data:image\/png;base64,/, "");
      imgName = req.body.id + '_' + img_name_hash + path.extname(req.body.name)
      // Save image
      require("fs").writeFile("public/uploads/" + imgName, base64Data, 'base64', function(err) {
        console.log(err);
      });
    }

    // Delete existent article ro rewrite updated
    calendar = data.filter(function( obj ) {
      return obj.id.toString() !== req.body.id.toString();
    });

    var file_txt = {
      "id": id,
      "title": req.body.title,
      "date": req.body.date,
      "time": req.body.time,
      "farda": req.body.farda,
      "hinario": req.body.hinario,
      "price": req.body.price,
      "img": imgName,
      "obs":req.body.obs }

    // Array add reg
    calendar.push(file_txt)

    // Json file save
    fs.writeFileSync(__dirname + "/../content/calendar.json", JSON.stringify(calendar, null, 4))

    // Finish process
    res.send(id)
  }
})

router.post('/evento_delete', (req, res, next) => {

  //Checks user profile
  if (auth.login_check(req.body.user_id)){
    data = data.filter(function( obj ) {
        return obj.id.toString() !== req.body.id.toString();
    });
    fs.writeFileSync(__dirname + "/../content/calendar.json", JSON.stringify(data, null, 4))

    res.status(200).json({user_id:req.body.user_id, status:"ok"})
 }
})

router.get('/evento_delete_ok', (req, res, next) => {

  // Auth test
  var logged = auth.login_check(req.body.user_id)

  // Call
  res.render('site/evento_delete_ok', {help: help, user_id: req.query.user_id, logged: logged})

})

router.data = data
router.call_byId = call_byId
module.exports = router;
