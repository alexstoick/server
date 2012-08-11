var app = require('http').createServer(handler);
var io = require('socket.io').listen(app) ;
var fs = require('fs') ;

app.listen(process.env.PORT || 8001);

function handler (req, res) 
{
    fs.readFile('index.html',
    function (err, data) 
    {
        if (err) 
        {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
    
        res.writeHead(200, {'Content-Type': 'text/html', "Content-Length": data.length});
        res.end(data);
    } );
}


io.of('/room2').on('connection', function (socket) {
    // echo the message
    socket.on ( 'room2' , function (data) {
                                                console.warn ( "message on room2:" + data ) ;
                                                io.sockets.emit ( 'room2' , data ) ;
                                            });
        
    
    socket.on('message', 
        function (data) { 
                            console.log ( "room2 data: " + data ) ; 
                        } 
            ) ;
});

io.of('/room1').on('connection', function (socket) {
    // echo the message
    socket.on ( 'room1' , function (data) {
                                                console.warn ( "message on room1:" + data ) ;
                                                socket.broadcast.emit ( 'room1' , data ) ;
                                            });
        
    
    socket.on('message', 
        function (data) { 
                            console.log ( "room1 data: " + data ) ; 
                        } 
            ) ;
});


/*
io.sockets.on('connection', function (socket) {
    // echo the message
    socket.on ( 'room1' , function (data) {
                                                console.warn ( "message on room1:" + data ) ;
                                                io.sockets.emit ( 'room1' , data ) ;
                                            });
                                            
    socket.on ( 'room2' , function (data) {
                                                console.warn ( "message on room2:" + data ) ;
                                                io.sockets.emit ( 'room2' , data ) ;
                                            });
        
    
    socket.on('message', 
        function (data) { 
                            console.log ( data ) ; 
                        } 
            ) ;
});
*/
