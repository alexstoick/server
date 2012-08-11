var app = require('http').createServer(handler);
var io = require('socket.io').listen(app) ;
var fs = require('fs') ;
var url = require ('url');

app.listen(process.env.PORT || 8001);

function handler (req, res) 
{
    var pathname = url.parse(req.url).pathname;
    console.log("Request for " + pathname + " received.");
    var file = "" ;
    var type="" ;
    switch ( pathname ) 
    {
        case '/': file = 'index.html' ; type = "text/html" ; break ;
        case '/room2.html': file = 'room2.html'; type = "text/html" ; break ;
        case '/index.html': file = 'index.html'; type = "text/html" ; break ;
        case '/project' : file = 'prj/project.html'; type = "text/html" ; break ;
        case '/js.js': file = 'prj/js.js' ; type = "text/javascript" ; break ;
        case '/raphael-min.js': file = 'prj/raphael-min.js' ; type = "text/javascript" ; break ;
        case '/project.css': file = 'prj/project.css'; type ="text/css" ;break ;
    }
    
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
        
        socket.on ( 'joinRoom' , function (data) 
                                    {
                                        socket.leave ( 'no_room' ) ;
                                        socket.set ( 'room' , data ) ;
                                        socket.join ( data ) ;
                                        console.log ( "now in room: " + data ) ;
                                        socket.send ( ">>> joined " + data ) ;
                                        var connected="~: " ;
                                        var i ;
                                        for ( i = 0 ; i < io.sockets.clients(data).length ; ++ i )
                                            connected += io.sockets.clients(data)[i].id + " ; " ;
                                        socket.send ( connected ) ;
                                    } 
                    ) ;
        socket.on ( 'leaveRoom' , function ( ) 
                                    {
                                        socket.close();
                                        console.log ( "~~~~~~~~~~~~CLOSED SOCKET" ) ;
                                    }
                    );
        socket.on('disconnect', function() { console.log(socket.id + ' disconnected'); } ) ;
        
        
        socket.on ( 'message' , function ( data ) 
                                {
                                    console.log("Client data: " + data);
                                    
                                    // lookup room and broadcast to that room
                                    
                                    socket.get('room', function(err, room) {
                                        console.log ( "Client room:" + room ) ;
                                        socket.broadcast.to(room).emit( 'message' , data );
                                        }) ;
                                } );
    } ) ;


/*
io.of('/room2').on('connection', function (socket) {
    // echo the message
    socket.on ( 'room2' , function (data) {
                                                console.warn ( "message on room2:" + data ) ;
                                                io.of('/room2').send ( data ) ;
                                            });
        
    
    socket.on('message', 
        function (data) { 
                            console.log ( "room2 data: " + data ) ; 
                            io.of('/room2').emit( 'room2' , data);
                        } 
            ) ;
});

io.of('/room1').on('connection', function (socket) {
    // echo the message
    socket.on ( 'room1' , function (data) {
                                                console.warn ( "message on room1:" + data ) ;
                                                io.of('/room1').send ( data ) ;
                                            });
        
    
    socket.on('message', 
        function (data) { 
                            console.log ( "room1 data: " + data ) ; 
                            io.of('/room1').emit( 'room1' , data);
                        } 
            ) ;
});
*/
