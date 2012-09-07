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






var rooms = 0 ;
var themes = [] ;
io.sockets.on ( 'connection' ,
	function (socket) {

		socket.on ( 'noRoom' , function ( username ) { newUserConnected ( socket , username ) ; } ) ;

		socket.on ( 'joinRoom' , function ( room ) { joinRoom ( socket, room  ) ; } ) ;

		socket.on( 'disconnect', function() { console.log ( "disconnected ~@!" ) ; disconnected ( socket ) ; } ) ;

		socket.on ( 'message' , function ( data ) { receivedMessage ( socket,  data ) ; } );

		socket.on ( 'updateMap' , function ( id , username ) { updateMap ( socket, id , username ) ; } );

		socket.on ( 'answer' , function ( room , username , answer , time ) { sendAnswerToUsers ( socket , room , username , answer , time ) ; } ) ;

		socket.on ( 'requestUsers' , function ( room ) { sendUsersForRoom ( socket, room ) ; } ) ;

		socket.on( 'newRoom' , function ( room , theme ) { themes[themes.length] = theme ; sendNewRoomToUsers ( socket , room ) ; } ) ;

		socket.on ( 'requestRoomNumber' , function ( ) { socket.emit ( 'roomNumber' , rooms) ; } ) ;
		socket.on ( 'showQuestion' , function ( ) { showQuestion (socket ) ; } ) ;
	} ) ;

function showQuestion ( socket )
{
	var room = getProperty ( socket, 'room' ) ;
	socket.emit ( 'showQuestion' ) ;
	socket.broadcast.to(room).emit ( 'showQuestion' ) ;
}

function newUserConnected ( socket , username  )
{
	socket.join ( 'noRoom' ) ;
	socket.set ( 'username' , username ) ;
	//Get list of free users and send them

	var clients = getClientsFromRoom ( 'noRoom' ) ;
	socket.emit ( 'getFreeUsers' ,  clients ) ;
	socket.broadcast.to('noRoom').emit ( 'getFreeUsers' ,  clients ) ;
}

function sendNewRoomToUsers ( socket , room )
{
	socket.broadcast.to('noRoom').emit ( 'addRoom' , room ) ;
	++rooms ;
}

function getProperty ( socket , propertyName )
{
	var prop ;
	socket.get ( propertyName , function ( err , property)
								{
									console.log ( propertyName + " :: " + property ) ;
									prop =  property ;
								}) ;
	return prop ;
}

function sendUsersForRoom ( socket , room )
{
	var conn = getClientsFromRoom( room ) ;
	console.log ( "~~~~~~~~~~~~~~~~~~" + room + "		" +themes[room-1] ) ;
	socket.emit ( 'usersForSpecificRoom' , conn , room , themes[room-1] ) ;
}

function sendAnswerToUsers ( socket ,  room , username , answer , time )
{
	socket.broadcast.to(room).emit ( 'answer' , username , answer , time ) ;
	socket.emit ( 'answer' , username , answer , time ) ;
	console.log ( "~~ received answer for room: " + room ) ;
}

function getClientsFromRoom ( room )
{
	var connectedArray = [] ;
	var i ;

	console.log ( "roomId " + room ) ;

	for ( i = 0 ; i < io.sockets.clients(room).length ; ++ i )
	{
		var currSocket = io.sockets.clients(room)[i];
		var user = getProperty( currSocket , 'username' ) ;
		connectedArray.push ( user ) ;
	}
	console.log ( "||||||||||||||||||||||||||" + connectedArray ) ;
	return connectedArray ;

}

function joinRoom ( socket , room , username )
{

	socket.leave ( 'noRoom' ) ;
	socket.set ( 'room' , room ) ;

	console.log ( "username:" + username + "    room:" + room ) ;

	socket.join ( room ) ;
	socket.send ( ">>> joined " + room ) ;

	var connectedArray = getClientsFromRoom ( room ) ;

	socket.emit ( 'usersUpdate' , connectedArray ) ;
	socket.broadcast.to(room).emit ( 'usersUpdate' , connectedArray ) ;

	if ( io.sockets.clients(room).length == 2 ) //avem toti userii necesari => incepe jocul
	{
		socket.broadcast.to(room).send ( "Preparing to start game" ) ;
		socket.send ( "Preparing to start game" ) ;
		setTimeout( startGameForRoom ( socket ,room ) ,1250);
	}
}

function startGameForRoom ( socket,  roomId )
{
	socket.emit ( 'showQuestion' ) ;
	socket.broadcast.to(roomId).emit ( 'showQuestion' ) ;
}


function disconnected ( socket )
{
	var user = getProperty( socket , 'username' ) ;
	var room = getProperty( socket , 'room' ) ;

	console.log ( "Disconnected " + user + " from room:" + room ) ;
	socket.broadcast.to(room).emit ( 'userDisconnected' , user ) ;
}

function receivedMessage ( socket , data )
{
	console.log("Client data: " + data);

	// lookup room and broadcast to that room
	var room ;
	room = getProperty( socket , 'room' ) ;
	console.log ( "Client room:" + room ) ;
	socket.broadcast.to(room).emit( 'message' , data );
}


function updateMap ( socket , id , username  )
{
	var room ;
	console.log ( "~~update map" ) ;
	room = getProperty( socket , 'room' ) ;
	console.log ( "UPDATING " + room + " zone " + id + " by user:" + username ) ;
	socket.broadcast.to(room).emit ( 'mapUpdate' , id , username ) ;
	socket.emit ( 'mapUpdate' , id , username ) ;

//	socket.broadcast.to(room).emit ( 'showQuestion' ) ;
//	socket.emit ( 'showQuestion' ) ;
}



















