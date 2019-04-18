const express = require('express');
// const multer = require('multer')
const ejs = require('ejs')
const path = require('path')
const fs = require('fs');
const multer = require("multer");
var session = require('express-session');


// const sharp = require('sharp')
var artigos = require('./data.json');
var login_var = require('./login.json');
 console.log('>>>login_var', login_var);



var bodyParser = require('body-parser');


// Init app
const app = express();

//app.use(session({secret:'delicitas***',  maxAge: Date.now() + (30 * 86400 * 1000)}));
// var sessionOptions = {
//   key: 'session.sid',
//   secret: 'Some secret key',
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//     secure: false,
//     maxAge: 600000
//   }
// };

// app.use(session(sessionOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// parse application/json
// app.use(bodyParser.json());

var upload = multer({ storage: multer.memoryStorage({}) })

function login_check(user_id){
  user_id = user_id||0
  logged = false
  console.log('user_id>>>:', user_id);
  console.log('login_var>>>:', login_var);
  logged = login_var.find(x => x.user_id.toString() === user_id.toString())
  console.log('logged:::>>>:', logged);
  return logged
}

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));


app.get('/login', (req, res) =>{
  //ssn=req.session;


  //if (!ssn.user_id) ssn.user_id = user_id
  res.render('site/login_form', {artigos:artigos, erro: false})
});

app.post('/login_do', (req, res) =>{
  // ssn=req.session;
  // user_id = req.body.user_id
  user = req.body.user

  password = req.body.password
  if (password == "topodamata"){
    user_id = Math.random().toString(26).slice(2);
    logged = true

    //Save loggin pass
    login_var_new = {
      user_id: user_id,
      logged: true,
      timestamp: Date.now()
    }

    console.log("login_var:", login_var);
    login_var = login_var.filter(function( obj ) {
        return obj.user_id.toString() !== user_id.toString();
    });

    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Clean up old entrys
    login_var = login_var.filter(function( obj ) {
      console.log('obj.timestamp:', obj.timestamp);
      console.log('(obj.timestamp - Date.now()):', (Date.now() - _MS_PER_DAY));
      return obj.timestamp > (Date.now() - _MS_PER_DAY)
    });

    login_var.push(login_var_new)

    fs.writeFileSync("./login.json", JSON.stringify(login_var, null, 4))
    res.render('site/login_form_pass', {user_id: user_id, logged: logged})
  }else{
    user_id = 0
    logged = false
    res.render('site/login_form', {user_id: user_id, erro: true})
  }

});


app.get('/logout', (req, res) =>{
  // ssn=req.session;
  // user_id = req.body.user_id
  user_id = req.query.user_id

  // Delte user id from user adm list
  login_var = login_var.filter(function( obj ) {
      return obj.user_id.toString() !== user_id.toString();
  });

  fs.writeFileSync("./login.json", JSON.stringify(login_var, null, 4))

  res.render('site/logout')
});


app.get('/', (req, res) =>{
  // console.log("-----------**");
  user_id_ = req.query.user_id
  logged_ = login_check(req.query.user_id)

  if (typeof user_id_ === 'undefined') {user_id_ = 0}else{console.log('user_id:',user_id_)}
  if (typeof logged_ === 'undefined') logged_ = false
  // if (typeof user_id === 'undefined') user_id = 0
  // if (user_id === null) user_id = 0
  // if (logged === null) logged = false
  //user_id = Math.random().toString(26).slice(2);
  // ssn=req.session;
  // if (!ssn.user_id) ssn.user_id = user_id
  res.render('site/home', {artigos:artigos, user_id: user_id_, logged: logged_})
});

app.get('/contact', (req, res) =>
  res.render('site/contact', {user_id: req.query.user_id})
);
app.get('/drive', (req, res) =>
  res.render('site/drive_virtual', {user_id: req.query.user_id})
);

//
//  Show artivle by Id
//
app.get('/article_show', (req, res) => {

  console.log(">>req.query.user_id:", req.query.user_id);

  logged = login_check(req.query.user_id)

  console.log(">>logged:", logged);

  //Select article item
  artigo = artigos.filter(function (item) {
    console.log('item:', item);
   return item.id === req.query.id;
  })

  console.log('artigo>>>', artigo);
  // Checks if is a logged user
  // user_id = 0
  // logged = false
  // if (req.query.user_id) {
  user_id = req.query.user_id
  //   logged = true
  // }
  res.render('site/article_show', {artigo: artigo[0], user_id: user_id, logged: logged})

});


//
// Delete articles item
//
app.post('/article_delete', (req, res, next) => {
  //Checks user profile
  logged = login_check(req.body.user_id)

  if (logged){
    console.log("req:", req.body.id)
    artigos = artigos.filter(function( obj ) {
        return obj.id.toString() !== req.body.id.toString();
    });
    fs.writeFileSync("./data.json", JSON.stringify(artigos, null, 4))

    res.status(200).json({user_id:req.body.user_id, status:"ok"})
 }
})
//
// Delete articles item
//
app.get('/article_delete_ok', (req, res, next) => {
  res.render('site/article_delete_ok',{user_id: req.query.user_id})
})
//
// Form data save with image upload
//
app.post('/up', upload.single('blob'), (req, res, next) => {

  logged = login_check(req.body.user_id)
  console.log('/up:', logged);

  if (logged){
      var article_new_id = Math.random().toString(26).slice(2)
      console.log("article_new_id:", article_new_id)

      if (req.body.img_) {
        console.log("------------------");
        var imgName = req.body.img_
      }else{
        var imgName = ""
      }

      // Checks out if has a uploaded image
      if (req.body.blob){
        console.log("req.body.name:", req.body.name);
        console.log("req.body.blob:", req.body.blob);
        var base64Data = req.body.blob.replace(/^data:image\/png;base64,/, "");
        imgName = (req.body.id || article_new_id) + path.extname(req.body.name)
        // Save image
        require("fs").writeFile("public/uploads/" + imgName, base64Data, 'base64', function(err) {
          console.log(err);
        });
      }

      console.log("imgName:", imgName);





      //Deleting olders itens
      d = new Date(Date.now()).getDate().toString()
      m = (new Date(Date.now()).getMonth()).toString()
      y = new Date(Date.now()).getFullYear().toString()



      // Delete existent reg
      if (req.body.id){
        console.log("req.body.id:", req.body.id);
        // artigos.splice(artigos.findIndex(e => e.id.toString() === req.body.id.toString()),1);
        // Delete existent rec
        artigos = artigos.filter(function( obj ) {
            return obj.id.toString() !== req.body.id.toString();
        });

        article_id = req.body.id

      }else{
        article_id = article_new_id
      }

      file_txt =
        {
          "id": article_id,
          "title": req.body.title,
          "date": req.body.date,
          "time": req.body.time,
          "farda": req.body.farda,
          "hinario": req.body.hinario,
          "price": req.body.price,
          "img": imgName,
          "obs":req.body.obs
        }

      // Json Add Reg
      artigos.push(file_txt)


       console.log(":::::::::::>", new Date(y,m,d));

      //Exclude all old articles
      artigos_ = []
      artigos.forEach(function(item){
        console.log("before--*", new Date(item.date.split('-').join(',')), new Date(y,m,d,00,00,00));
        if (new Date(item.date.split('-').join(',')) >= new Date(y,m,d,00,00,00)){
          console.log("after--*", new Date(item.date), new Date(y,m,d));
          artigos_.push(item)
        }
      });
      artigos = artigos_

     // Cheks the limits
     if (artigos.length > 20) artigos.length = 20

     // Json file save
     fs.writeFileSync("./data.json", JSON.stringify(artigos, null, 4))
     res.send(article_id)
  }
})

app.post("/upload",
    (req, res) => {
      const article_new_id = Math.random().toString(26).slice(2)
      // image takes from body which you uploaded
      var imageBuffer = new Buffer.from(req.body.blob, 'base64');
      // const imgdata = req.body.blob;
      console.log('imageBuffer:', imageBuffer);
      const name = req.body.name;
      console.log('name:', name);
      const imgName = req.body.id || article_new_id
    }

  );




app.get('/article_create', (req, res) => {
  artigo = {
    id: "",
    title: "",
    date: "",
    time: "",
    farda: "",
    hinario: "",
    price: "",
    obs: ""
  }
  res.render('site/article_form', {user_id: req.query.user_id, artigo: artigo})

});

app.get('/article_edit', (req, res) => {
  artigo = artigos.filter(function (item) {
    console.log('item:', item);
   return item.id === req.query.id;
  })
  artigo = artigo[0]
  console.log('artigo>>>', artigo);
  res.render('site/article_form', {user_id: req.query.user_id, artigo: artigo})

});


app.post('/article_new_do', (req, res) => {
  //article_new_id = Math.random().toString(26).slice(2)

  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      console.log('req.body.id:', req.body.id);
      if (req.body.id){
        artigos.splice(artigos.findIndex(e => e.id.toString() === req.body.id.toString()),1);
      }

      file_txt =
        {
        "id": req.body.id || article_new_id,
        "title": req.body.title,
        "date": req.body.date,
        "time": req.body.time,
        "farda": req.body.farda,
        "hinario": req.body.hinario,
        "price": req.body.price,
        "img": req.body.img,
        "obs":req.body.obs}
      console.log('artigos:', artigos);
      console.log('file_txt:', file_txt);
      artigos.push(file_txt)
      console.log('artigos:', artigos);

      fs.writeFileSync("./data.json", JSON.stringify(artigos))
      res.render('site/article_new_do')
      //res.send('test');
    }
  })
})
const port = 3000;
const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};
app.listen(port, () => console.log('Server start on port ${port}'));
