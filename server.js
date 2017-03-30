var express = require('express');        
var app = express();                 
var bodyParser = require('body-parser');
var mysql = require('mysql');       
var port = process.env.PORT || 8080;        
var router = express.Router();      
var connection = mysql.createConnection({
  host     : 'sql9.freemysqlhosting.net',
  user     : 'sql9161597',
  password : 'YPk6CC3RBb',
  database : 'sql9161597'
});
connection.connect(function(err){
    if(!err) {
        console.log("Connected to DB");    
        var server = app.listen(port, function(){
        var enableCORS = function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

            // intercept OPTIONS method
            if ('OPTIONS' == req.method) {
              res.send(200);
            }
            else {
              next();
            }
        };


            // enable CORS!
            app.use(enableCORS);        
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());         
            app.use('/api', router); 
        });        
    } else {
        console.log("Error connecting database");    
    }
});

router.get('/', function(req, res) {
    res.json({ message: 'WebApp api' });   
});
app.use('/api', router);

