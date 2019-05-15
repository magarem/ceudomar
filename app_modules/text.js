var express = require('express');
const ejs = require('ejs')
const path = require('path')
const fs = require('fs');
const multer = require("multer");
var upload = multer({ storage: multer.memoryStorage({}) })
var bodyParser = require('body-parser');

// Load modules
var help = require('./help');
var auth = require('./auth');

// Load text content
var data = require('../content/text.json');
// console.log('data:', data);
// Consts aux
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// Aux functions
function call_byId(id){
  return data.find(function (item){return item.id == id});
}

// Get moldura data
//var footer = call_content('footer')

var router = express.Router();

router.get('/edit', (req, res) =>{

  // Get form values
  var user_id = req.query.user_id
  var title = req.query.title
  var id = req.query.id
  var logged = auth.login_check(user_id)

  // Auth checks
  if (logged){

    console.log('id:', id);
    // Get content by id
    data_ = call_byId(id)

    // Get images list in uploads directory
    var imgs = fs.readdirSync('./public/uploads')

    // Call view
    res.render('site/text/edit', {help: help, user_id: user_id, logged: logged, data: data_, imgs: imgs})
  }
});

router.post('/edit_do', upload.single('blob'), (req, res, next) => {

  // Get the form values
  var user_id = req.body.user_id
  var title = req.body.title
  var id = req.body.id
  var txt = req.body.txt
  var img_fit = req.body.img_fit||""
  var logged = auth.login_check(user_id)

  // Checks auth
  if (logged){
    // Set img ramdom name (to a new img uploaded)
    var img_new_name = Math.random().toString(26).slice(2)

    // Delete item
    data = data.filter(function( obj ) {
      return obj.id.toString() !== id.toString();
    });

    //Set the img name
    var imgName = req.body.img_ || ""

    // Checks out if has a uploaded image
    if (req.body.blob){
      var base64Data = req.body.blob.replace(/^data:image\/png;base64,/, "");
      imgName = img_new_name + path.extname(req.body.name)
      // Save image
      require("fs").writeFile("public/uploads/" + imgName, base64Data, 'base64', function(err) {
        console.log(err);
      });
    }

    // Add item
    item = {
      "id": id,
      "img": imgName,
      "img_fit": img_fit,
      "title": title,
      "body": txt}

    // Json Add Reg
    data.push(item)

    // Json file save
    fs.writeFileSync("./content/text.json", JSON.stringify(data, null, 4))

    //Finish process
    res.send(item)
  }else{
    //Auth error
    res.send("Auth error")
  }

  // }
})

router.data = data.text
router.call_byId = call_byId
module.exports = router;
