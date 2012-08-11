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

io.sockets.on('connection', function (socket) {
    // echo the message
    socket.on ( 'custom' , function (data) {
                                                console.warn ( "+++++" + data ) ;
                                                io.sockets.emit ( 'custom' , data ) ;
                                            });
    socket.on('message', function (data) { 
                                            console.info(data); 
                                            socket.send("[ECHO] "+data); 
                                        });
});