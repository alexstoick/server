var app = require('http').createServer(handler);
var io = require('socket.io').listen(app) ;
var fs = require('fs') ;
var url = require ('url');
var path = require("path");
app.listen(process.env.PORT || 8001);

function handler(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  console.log(filename);

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

	if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}

var _mysql = require('mysql');

var HOST = 'localhost';
var PORT = 3306;
var MYSQL_USER = 'root';
var MYSQL_PASS = '';
var DATABASE = 'warehous_lucru';


var connection = _mysql.createConnection({
  host     : HOST ,
  user     : MYSQL_USER ,
  password : MYSQL_PASS ,
  database : DATABASE ,
});


connection.connect();

connection.query('SELECT * FROM moves', function(err, rows, fields) {
  if (err) throw err;

  console.log( rows.length);
});