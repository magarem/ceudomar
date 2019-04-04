const express = require('express');
// const multer = require('multer')
const ejs = require('ejs')
const path = require('path')
const fs = require('fs');
const multer = require("multer");
// const sharp = require('sharp')
var artigos = require('./data.json');
console.log('>>>', artigos[0].title);



var bodyParser = require('body-parser');


// Init app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// parse application/json
// app.use(bodyParser.json());

var upload = multer({ storage: multer.memoryStorage({}) })




// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));


app.get('/', (req, res) =>
  res.render('site/home', {artigos:artigos})
);

app.get('/contact', (req, res) =>
  res.render('site/contact')
);
app.get('/drive', (req, res) =>
  res.render('site/drive_virtual')
);

//
//  Show artivle by Id
//
app.get('/article_show', (req, res) => {

  //Select article item
  artigo = artigos.filter(function (item) {
    console.log('item:', item);
   return item.id === req.query.id;
  })

  console.log('artigo>>>', artigo);
  res.render('site/article_show', {artigo: artigo[0]})

});


//
// Delete articles item
//
app.post('/article_delete', (req, res, next) => {
  console.log("req:", req.body.id)
  artigos = artigos.filter(function( obj ) {
      return obj.id.toString() !== req.body.id.toString();
  });
  fs.writeFileSync("./data.json", JSON.stringify(artigos, null, 4))

  res.status(200).json({status:"ok"})
})
//
// Delete articles item
//
app.get('/article_delete_ok', (req, res, next) => {
  res.render('site/article_delete_ok')
})
//
// Form data save with image upload
//
app.post('/up', upload.single('blob'), (req, res, next) => {

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

  console.log('artigos:', artigos);
  console.log('file_txt:', file_txt);
  console.log('artigos:', artigos);

  // Json Add Reg
  artigos.push(file_txt)
  // Json file save
  fs.writeFileSync("./data.json", JSON.stringify(artigos, null, 4))

  // Pass to next layer of middleware
  //next();
  // res.render('site/article', {artigo:file_txt})
   res.end(article_id)

  // var imageBuffer = new Buffer.from(req.body.blob, 'base64');
  // console.log("imageBuffer:", imageBuffer);
  // const encoded = req.file.buffer.toString('base64');
//   fs.writeFile("public/uploads/out.jpg", encoded, {encoding: 'base64'}, function(err) {
//     console.log('File created');
//      if(err){
//         console.log(err);
//         return;
//       } else {
//         // res.redirect('/crop');
//       }
//   });
  // res.send(encoded)
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
      //const tempPath = req.file.path;
      // const ext = path.extname(req.file.originalname)
      // const targetPath = path.join(__dirname, "./public/uploads/" + imgName + ext);
      // const targetPath2 = path.join(__dirname, "./public/uploads/" + imgName + ".jpg");
      // const fileNewName = targetPath.split("/").pop()

      // fs.rename(tempPath, targetPath, err => {
      //   if (err) return handleError(err, res);
      //   res
      //     .status(200)
      //     .contentType("text/plain")
      //     .end("File uploaded!");
      // });
      //
      //
      // if (req.body.id){
      //   artigos.splice(artigos.findIndex(e => e.id.toString() === req.body.id.toString()),1);
      // }
      //
      // file_txt =
      //   {
      //   "id": req.body.id || article_new_id,
      //   "title": req.body.title,
      //   "date": req.body.date,
      //   "time": req.body.time,
      //   "farda": req.body.farda,
      //   "hinario": req.body.hinario,
      //   "price": req.body.price,
      //   "img": fileNewName,
      //   "obs":req.body.obs}
      // console.log('artigos:', artigos);
      // console.log('file_txt:', file_txt);
      // artigos.push(file_txt)
      // console.log('artigos:', artigos);
      //
      // fs.writeFileSync("./data.json", JSON.stringify(artigos)+"\n")
      //
      // res.send('ok')


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
  res.render('site/article_form', {artigo: artigo})

});

app.get('/article_edit', (req, res) => {
  artigo = artigos.filter(function (item) {
    console.log('item:', item);
   return item.id === req.query.id;
  })
  artigo = artigo[0]
  console.log('artigo>>>', artigo);
  res.render('site/article_form', {artigo: artigo})

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
