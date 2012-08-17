var app = require('http').createServer(handler);
var io = require('socket.io').listen(app) ;
var fs = require('fs') ;
var url = require ('url');

app.listen(process.env.PORT || 8001);

var rooms = 0 ;

function handler (req, res)
{
	var pathname = url.parse(req.url).pathname;

	var file = "" ;
	var type="" ;
	switch ( pathname )
	{
		case '/': file = 'prj/project.html' ; type = "text/html" ; break ;
		case '/room2.html': file = 'room2.html'; type = "text/html" ; break ;
		case '/index.html': file = 'index.html'; type = "text/html" ; break ;
		case '/project' : file = 'prj/project.html'; type = "text/html" ; break ;
		case '/uijs.js': file = 'prj/uijs.js' ; type = "text/javascript" ; break ;
		case '/publicApi.js': file = 'prj/publicApi.js' ; type = "text/javascript" ; break ;
		case '/raphael-min.js': file = 'prj/raphael-min.js' ; type = "text/javascript" ; break ;
		case '/project.css': file = 'prj/project.css'; type ="text/css" ;break ;
		case '/javaUtils.js': file = 'prj/javaUtils.js'; type = "text/javascript" ; break ;
		case '/login.js': file = 'prj/login.js'; type = "text/javascript" ; break ;
		case '/map.js': file = 'prj/map.js'; type = "text/javascript" ; break ;
		case '/room.js': file = 'prj/room.js'; type = "text/javascript" ; break ;
	}

	console.log("Request for " + pathname + " received. ===> file:" + file + " type: " + type ) ;

	fs.readFile( file ,
	function (err, data)
	{
		if (err)
		{
			res.writeHead(500);
			return res.end('Error loading ' + file + "~~" );
		}

		res.writeHead(200, {'Content-Type': type, "Content-Length": data.length});
		res.end(data);
	} );

}


io.sockets.on ( 'connection' ,
	function (socket) {

		socket.on ( 'noRoom' , function ( ) { socket.join ( 'noRoom' ) ; } ) ;

		socket.on ( 'joinRoom' , function (room , username ) { joinRoom ( socket, room , username ) ; } ) ;

		socket.on( 'disconnect', function() { console.log ( "disconnected ~@!" ) ; disconnected ( socket ) ; } ) ;

		socket.on ( 'message' , function ( data ) { receivedMessage ( socket,  data ) ; } );

		socket.on ( 'updateMap' , function ( id , username ) { updateMap ( socket, id , username ) ; } );

		socket.on ( 'answer' , function ( room , username , answer , time ) { sendAnswerToUsers ( socket , room , username , answer , time ) ; } ) ;

		socket.on ( 'requestUsers' , function ( room ) { sendUsersForRoom ( socket, room ) ; } ) ;

		socket.on( 'newRoom' , function ( room ) { sendNewRoomToUsers ( socket , room ) ; } ) ;

		socket.on ( 'requestRoomNumber' , function ( ) { socket.emit ( 'roomNumber' , rooms) ; } ) ;
	} ) ;


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
	socket.emit ( 'usersForSpecificRoom' , conn , room ) ;
}

function sendAnswerToUsers ( socket ,  room , username , answer , time )
{
	socket.broadcast.to(room).send ( ">> " + username + " chose: " + answer + " in:" + time ) ;
	socket.send ( ">> " + username + " chose: " + answer + " in:" + time ) ;

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
	socket.set ( 'username' , username ) ;

	console.log ( "username:" + username + "    room:" + room ) ;

	socket.join ( room ) ;
	socket.send ( ">>> joined " + room ) ;

	var connectedArray = getClientsFromRoom ( room ) ;

	socket.emit ( 'usersUpdate' , connectedArray ) ;
	socket.broadcast.to(room).emit ( 'usersUpdate' , connectedArray ) ;
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

	socket.broadcast.to(room).emit ( 'showQuestion' ) ;
	socket.emit ( 'showQuestion' ) ;
}



















