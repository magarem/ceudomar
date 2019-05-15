var content = {}
content.calendar = require(__dirname + '/../content/calendar.json');
content.text = require(__dirname + '/../content/text.json')

// Helpers functions
// function call_img(file=null){
//   if (file !="" & fs.existsSync('public/uploads/' + file)) {
//     return "<img src='uploads/"+ file + "'>"
//   }else{
//     return null
//   }
// }

function call_content_all(type){
  return content[type];
}

function call_content(type, id){
  return content[type].find(function (item){return item.id == id});
}

module.exports = {
  call_content_all: call_content_all,
  call_content: call_content
}
