var express = require('express');        
var app = express();                 
var bodyParser = require('body-parser');
var mysql = require('mysql');       
var port = process.env.PORT || 8080;        
var router = express.Router();      
var connection = mysql.createConnection({
  host     : 'sql9.freemysqlhosting.net',
  user     : 'sql9161597',
  password : 'YPk6CC3RBb' || process.env.PASS,
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
            app.use('/app', router); 
        });        
    } else {
        console.log("Error connecting database");    
    }
});

router.get('/', function(req, res) {
    res.json({ message: 'WebApp api' });   
});
router.post('/Users', function(req, res) {
    query = 'SELECT * FROM Users WHERE UID="' + req.body.uid + '" AND PASSWORD="' + req.body.password + '"'; 
    connection.query(query, function(err, rows, fields) {
      if (!err){
          query1 = 'SELECT * FROM Vendors WHERE vendorID="' + req.body.uid + '"';
          connection.query(query1, function(err1, rows1, fields1){
              if (!err1){
                  if (rows1.length > 0){
                      rows[0]["vendor"] = true; 
                      res.json(rows); 
                  }
                  else{
                      rows[0]["vendor"] = false; 
                      res.json(rows[0]); 
                  }
              }
              else
                  res.json({ error: err1 });
          });
      }
      else
          res.json({ error: err });
      });

});
