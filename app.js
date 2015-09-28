var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

var bodyParser = require('body-parser');
app.use(express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


var inputManager = require('./modules/input-manager') ; 


var _ = require('underscore');

var natural = require('natural'),
  	tokenizer = new natural.WordTokenizer() , 
 	  NGrams = natural.NGrams;



app.post('/parse_line', function (req, res) {

  inputManager.handleSingleLine(req.body.text) ;
  res.send('ok - line');

});


app.post('/parse_text', function (req, res) {

  inputManager.handleTextBlock(req.body.text) ;
  res.send('ok - text');

});








router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});


app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

var server = app.listen(3000, function () {
  var host = server.address().address;
	var port = server.address().port;
	console.log('listening at http://%s:%s', host, port);
});



