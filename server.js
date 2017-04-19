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
    var query = 'SELECT * FROM Users WHERE UID="' + req.body.uid + '" AND PASSWORD="' + req.body.password + '"'; 
    connection.query(query, function(err, rows, fields) {
      if (!err){
          if (rows.length > 0){
              var query1 = 'SELECT * FROM Vendors WHERE vendorID="' + req.body.uid + '"';
              connection.query(query1, function(err1, rows1, fields1){
                  if (!err1){
                      if (rows1.length > 0){
                          rows[0]["vendor"] = true; 
                          res.json(rows[0]); 
                      }
                      else{
                          rows[0]["vendor"] = false; 
                          res.json(rows[0]); 
                      }
                  }
                  else
                      res.json({ error: "error with vendor table" });
              });              
          }
          else
              res.json({error: "incorrect login"});
      }
      else
          res.json({ error: "error with users table" });
      });

});
router.post('/User', function(req, res){
    var query = 'SELECT * FROM Users WHERE UID = "' + req.body.UID + '"'; 
    connection.query(query, function(err, rows, fields){
        if (!err){
            if (rows.length > 0)
                res.json({error: "user already exists"});             
            else{
                var query1 = "INSERT INTO Users SET ?"; 
                connection.query(query1, req.body, function(err1, res1){
                    if (!err1){
                        var query2 = 'SELECT * FROM Users WHERE UID = "' + req.body.UID + '"'; 
                        connection.query(query2, function(err2, rows1, fields1){
                            if (!err2)
                                res.json(rows1[0]); 
                            else
                                res.json({error: "error with users table"}); 
                        }); 
                    }
                    else{
                        res.json({error: "error with users table insertion"}); 
                    }
                });                 
            }
        }
        else
            res.json({error: "error with select statement on users table"}); 
    
    
    
    }); 
});  
router.post('/Categories', function(req, res){
    var query = 'SELECT * FROM CategoryAssociation WHERE cid="' + req.body.cid + '"';
    connection.query(query, function(err, rows, fields){
        if (!err){
            var itemArr = [];
            var i = 0; 
            for (i = 0; i < rows.length; i++){
                itemArr.push(rows[i].itemID);
            }
            res.json(itemArr);
        }
        else
            res.json({error: "error with table query"});
    });
});
router.post('/Items', function(req, res){
    var i = 0;
    var itemIDs = "";
    for (i = 0; i < req.body.itemIDs.length; i++){
        if ( i < req.body.itemIDs.length - 1)
            itemIDs = itemIDs + req.body.itemIDs[i] + ',';
        else
            itemIDs = itemIDs + req.body.itemIDs[i]
    }
    var query = 'SELECT * FROM Items WHERE itemID IN (' + itemIDs + ')';
    connection.query(query, function(err, rows, fields){
        if (!err)
            res.json(rows); 
        else
            res.json({error: "error with items table query"}); 
    });
});
router.get('/Items', function(req, res){
    var query = "SELECT * FROM AuctionItems"; 
    connection.query(query, function(err, rows, fields){
        if (!err){
            var i = 0;
            var auctionItems = [];
            var saleItems = [];
            for (i=0; i < rows.length; i++)
                auctionItems.push(rows[i].itemID);
            var query1 = "SELECT * FROM SaleItems";
            connection.query(query1, function(err1, rows1, fields){
                if (!err1){
                    var i = 0; 
                    for(i=0; i < rows1.length; i++)
                        saleItems.push(rows1[i].itemID); 
                    result = {"auctionItems": auctionItems, "saleItems": saleItems};
                    res.json(result); 
                }
                else
                    res.json({error: "error with selecting * from SaleItems"}); 
            }); 
        }
        else
            res.json({error: "error with selecting * from AuctionItems table"});
    }); 
}); 
router.post('/Item', function(req, res){
    var query = "INSERT INTO Items SET ?"; 
    var itemData = {"vendorID": req.body.vendorID, "price": req.body.price, "location": req.body.location, "description": req.body.description, "url": req.body.url};
    connection.query(query, itemData, function(err, res1){
        if (!err){
            var query1 = 'SELECT * FROM Items WHERE itemID = ' + res1.insertId; 
            connection.query(query1, function(err1, rows, fields){
                if (!err){
                    var auctionedItem = {"itemID": res1.insertID, "endTime": req.body.endTime, "reservePrice": req.body.reservePrice};
                    var query2 = 'INSERT INTO AuctionedItems SET ?';
                    connection.query(query2, auctionedItem, function(err2, res2){
                        if (!err2){
                            var query3 = 'SELECT * FROM CategoriesHierarchy WHERE cid="' + req.body.cid + '"';
                            connection.query(query3, function(err3, rows1, fields1){
                                if (!err){
                                    if (rows1[0].up1 != null){
                                        
                                    }
                                }
                            
                            }); 
                            
                            res.json(rows[0]); 
                            
                        }
                        else
                            res.json({error: "error with auctioneditems table"});
                        
                    
                    });                     
                }
                else
                    res.json({error: "error with items table"}); 
            }); 
        }
        else{
            throw err;
            res.json({error: "error with items table insertion"}); 
        }
    }); 
}); 
