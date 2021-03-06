var express = require('express');        
var app = express();                 
var bodyParser = require('body-parser');
var async = require('async'); 
var mysql = require('mysql');       
var port = process.env.PORT || 8080;        
var router = express.Router();      
var connection = mysql.createConnection({
  host     : 'sql9.freemysqlhosting.net',
  user     : 'sql9161597',
  password : 'YPk6CC3RBb' || process.env.PASS,
  database : 'sql9161597', 
  dateStrings: 'date'
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
                var bData = req.body; 
                var userData = {UID: bData.UID, name: bData.name, address: bData.address, email: bData.email, phone: bData.phone, age: bData.age, income: bData.income, password: bData.password}; 
                var query1 = "INSERT INTO Users SET ?"; 
                connection.query(query1, userData, function(err1, res1){
                    if (!err1){
                        var query2 = 'SELECT * FROM Users WHERE UID = "' + req.body.UID + '"'; 
                        connection.query(query2, function(err2, rows1, fields1){
                            if (!err2){
                                returnObj = rows1[0]; 
                                returnObj["vendor"] = bData.vendor; 
                                if (bData.vendor){
                                    var vendor = {vendorID: bData.UID}; 
                                    var query3 = 'INSERT INTO Vendors SET ?'; 
                                    connection.query(query3, vendor, function(err3, res2){
                                        if (!err3)
                                            res.json(returnObj); 
                                        else
                                            res.json({error: "error with insertion Vendors table"});
                                    }); 
                                }
                                else
                                    res.json(returnObj);
                            } 
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
    var query = 'SELECT I.itemID, I.price, I.description, I.url, I.name, I.location, I.vendorID, A.endTime, AVG(R.rating) as avgRating FROM Items I LEFT JOIN Ratings R ON R.itemID=I.itemID, AuctionItems A WHERE A.itemID=I.itemID AND I.itemID IN (' + itemIDs + ') GROUP BY I.itemID';
    connection.query(query, function(err, rows, fields){
        if (!err){
            var query1 = 'SELECT I.itemID, I.price, I.description, I.url, I.name, I.location, I.vendorID, S.quantity, AVG(R.rating) as avgRating FROM Items I LEFT JOIN Ratings R ON R.itemID=I.itemID, SaleItems S WHERE S.itemID=I.itemID AND I.itemID IN (' + itemIDs + ') GROUP BY I.itemID';  
            connection.query(query1, function(err1, rows1, fields1){
                if (!err1){
                    resultObj = {auctionedItems: rows, saleItems: rows1}; 
                    res.json(resultObj); 
                }
            }); 
        }
        else
            res.json({error: "error with items table query"}); 
    });
});
//router.post('/browsedItem', function(req, res){
//    var query = 'INSERT INTO 
//}); 

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
router.post('/addPayment', function(req, res){
    var query = 'INSERT INTO CreditCards set ?'; 
    connection.query(query, req.body, function(err, res1){
        if (!err){
            res.json(req.body); 
        }
        else
            res.json({error: "error inserting into CreditCard table"}); 
    }); 
}); 
router.post('/getPayments', function(req, res){
    var query = 'SELECT * FROM CreditCards WHERE UID="' + req.body.UID + '"';
    connection.query(query, function(err, rows, fields){
        if (!err)
            res.json(rows); 
        else
            res.json({error: "error selecting rows from CreditCards"}); 
    }); 
}); 
router.post('/getBids', function(req, res){
    var query = 'SELECT * FROM HighestBids WHERE UID = "' + req.body.UID + '"'; 
    connection.query(query, function(err, rows, fields){
        if (!err){
            var resultData = []; 
            var i = 0; 
            for (i = 0; i < rows.length; i++)
                resultData.push(rows[i].itemID); 
            res.json(resultData); 
        }
        else
            res.json({error: "error selecting rows from HighestBids"}); 
    }); 
}); 
router.post('/buy', function(req, res){
    var itemIDs = ""; 
    var i = 0; 
    for (i = 0; i < req.body.itemIDs.length; i++){
        if ( i < req.body.itemIDs.length - 1)
            itemIDs = itemIDs + req.body.itemIDs[i]["id"] + ',';
        else
            itemIDs = itemIDs + req.body.itemIDs[i]["id"]
    }    
    
    var query0 = 'SELECT * FROM Shipments WHERE creditCardNumber=' + req.body.cardNumber + ' AND shipDate IS NULL AND destination="' + req.body.destination + '"'; 
    connection.query(query0, function(err0, rows0, fields0){
        if (!err0){
            if (rows0.length > 0){
                var query = 'SELECT * FROM SaleItems WHERE itemID IN (' + itemIDs + ')'; 
                connection.query(query, function(err, rows, fields){
                    if (!err){
                        var inStock = 1; 
                        var i = 0; 
                        var totalSum = 0;
                        if (rows.length != req.body.itemIDs.length)
                            res.json({error:"at least one item you are purchasing does not exist in SaleItems table"});
                        else{
                                var query1 = 'SELECT * FROM CreditCards WHERE number = ' + req.body.cardNumber; 
                                connection.query(query1, function(err1, rows1, fields1){
                                    if (!err1){
                                        if (rows1.length > 0)
                                        {
                                            if (rows1[0].number == req.body.cardNumber && rows1[0].UID == req.body.UID && rows1[0].type == req.body.type && rows1[0].date == req.body.date && rows1[0].cv2 == req.body.cv2){
                                                var query2 = 'SELECT * FROM Items WHERE itemID IN (' + itemIDs + ')'; 
                                                connection.query(query2, function(err2, rows2, fields2){
                                                    if (!err2){
                                                        var totalSum = 0; 
                                                        for (i = 0; i < rows2.length; i++){
                                                            smallSum = 0; 
                                                            for(j = 0; j < req.body.itemIDs.length; j++){
                                                                if (rows2[i].itemID == req.body.itemIDs[j].id)
                                                                    smallSum = rows2[i].price*req.body.itemIDs[j].quantity; 
                                                            }
                                                            totalSum += smallSum; 
                                                        } 
                                                        var d = new Date(); 
                                                        var currDate = '' + d.getFullYear() + '-' + d.getDate() + '-' + d.getMonth(); 
                                                        var newShipment = {creditCardNumber: req.body.cardNumber, destination: req.body.destination, status: "created", totalCost: totalSum, purchaseDate: currDate};
                                                        var query3 = 'UPDATE Shipments SET totalCost = totalCost + ' + totalSum + ' WHERE shipID=' + rows0[0].shipID; 
                                                        connection.query(query3, function(err3, rows10, fields10){
                                                            if (!err3){
                                                                var i = 0; 
                                                                async.whilst(function () {
                                                                  return i < req.body.itemIDs.length;
                                                                },
                                                                function (next) {
                                                                    var query11 = 'SELECT * FROM PurchasedItems WHERE shipID=' + rows0[0].shipID + ' AND itemID=' + req.body.itemIDs[i]["id"]; 
                                                                    connection.query(query11, function(err11, rows11, fields11){
                                                                        if (!err11){
                                                                            if (rows11.length > 0){
                                                                                var query22 = 'UPDATE PurchasedItems SET quantity = quantity + ' + req.body.itemIDs[i]["quantity"] + ' WHERE shipID=' + rows0[0].shipID + ' AND itemID=' + req.body.itemIDs[i]["id"];
                                                                                connection.query(query22, function(err22, rows22, fields22){
                                                                                    if (!err22){
                                                                                        var query55 = 'SELECT * FROM SaleItems WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                        connection.query(query55, function(err55, rows55, fields55){
                                                                                            if (!err55){
                                                                                                if (rows55.length > 0){
                                                                                                    if (rows55[0].quantity - req.body.itemIDs[i]["quantity"] < 0){
                                                                                                        var query66 = 'UPDATE SaleItems SET quantity = 0 WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query66, function(err66, rows66, fields66){
                                                                                                            if (!err66){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err66);  
                                                                                                        });                                                                                                            
                                                                                                    
                                                                                                    }
                                                                                                    else{
                                                                                                        var query5 = 'UPDATE SaleItems SET quantity = quantity - ' + req.body.itemIDs[i]["quantity"] + ' WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query5, function(err5, rows3, fields3){
                                                                                                            if (!err5){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err5);  
                                                                                                        });                                                                                                     
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        });                                                                                        
                                                                                    }
                                                                                    else
                                                                                        next(err22); 
                                                                                
                                                                                }); 
                                                                            }
                                                                            else{
                                                                                var purchasedItem = {shipID: rows0[0].shipID, itemID: req.body.itemIDs[i]["id"], quantity: req.body.itemIDs[i]["quantity"], location: req.body.location};
                                                                                var query4 = 'INSERT INTO PurchasedItems SET ?'; 
                                                                                connection.query(query4, purchasedItem, function(err4, res4){
                                                                                    if (!err4){
                                                                                        var query55 = 'SELECT * FROM SaleItems WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                        console.log(query55); 
                                                                                        connection.query(query55, function(err55, rows55, fields55){
                                                                                            if (!err55){
                                                                                                if (rows55.length > 0){
                                                                                                    console.log(rows55[0].quantity); 
                                                                                                    console.log(req.body.itemIDs[i]["quantity"]); 
                                                                                                    if (rows55[0].quantity - req.body.itemIDs[i]["quantity"] < 0){
                                                                                                        var query66 = 'UPDATE SaleItems SET quantity = 0 WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query66, function(err66, rows66, fields66){
                                                                                                            if (!err66){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err66);  
                                                                                                        });                                                                                                            
                                                                                                    
                                                                                                    }
                                                                                                    else{
                                                                                                        var query5 = 'UPDATE SaleItems SET quantity = quantity - ' + req.body.itemIDs[i]["quantity"] + ' WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query5, function(err5, rows3, fields3){
                                                                                                            if (!err5){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err5);  
                                                                                                        });                                                                                                     
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        });                                                                                        
                                                                                    }
                                                                                    else
                                                                                        next(err4); 
                                                                                });                                                                                 
                                                                            }
                                                                        }
                                                                        else
                                                                            next(err11); 
                                                                    }); 
                                                                },
                                                                function (err) {
                                                                    if(err) 
                                                                        res.json({error: err}); 
                                                                    else{
                                                                        var i = 0;
                                                                        var orderBool = 0; 
                                                                        async.whilst(function () {
                                                                          return i < rows.length;
                                                                        },
                                                                        function (next) {
                                                                            if ((rows[i].quantity - req.body.itemIDs[i]["quantity"]) < 0){
                                                                                var orderQuantity = Math.abs(rows[i].quantity - req.body.itemIDs[i]["quantity"]);
                                                                                var query00 = 'SELECT * FROM Orders WHERE UID="' + req.body.UID + '" AND itemID=' + req.body.itemIDs[i]["id"]; 
                                                                                connection.query(query00, function(err00, rows00, fields00){
                                                                                    if (!err00){
                                                                                        if (rows00.length > 0){
                                                                                            var query10 = 'UPDATE Orders SET quantity = quantity + ' + orderQuantity + ' WHERE UID="' + req.body.UID + '" AND itemID=' + req.body.itemIDs[i]["id"];
                                                                                            connection.query(query10, function(err10, rows10, fields10){
                                                                                                if (!err10){
                                                                                                    i++;
                                                                                                    orderBool = 1; 
                                                                                                    next(); 
                                                                                                }
                                                                                                else
                                                                                                    next(err10); 
                                                                                            }); 
                                                                                        }
                                                                                        else{
                                                                                            var query12 = 'INSERT INTO Orders SET ?'; 
                                                                                            var newOrder = {UID: req.body.UID, itemID: req.body.itemIDs[i]["id"], quantity: orderQuantity};
                                                                                            connection.query(query12, newOrder, function(err12, res12){
                                                                                                if (!err12){
                                                                                                    i++;
                                                                                                    orderBool = 1; 
                                                                                                    next();  
                                                                                                }
                                                                                                else
                                                                                                    next(err12); 
                                                                                            }); 
                                                                                        }
                                                                                    }
                                                                                    else
                                                                                        next(err00); 
                                                                                }); 
                                                                            }
                                                                            else{
                                                                                i++;
                                                                                next(); 
                                                                            }
                                                                        },
                                                                        function (err) {
                                                                            if(err) {
                                                                                res.json({error: err}); 
                                                                            }
                                                                            else{
                                                                                if (orderBool == 1)
                                                                                    res.json({error: "Orders have been placed for out of stock items"}); 
                                                                                else{
                                                                                    console.log(orderBool); 
                                                                                    res.json({success: true});
                                                                                }
                                                                            }
                                                                                
                                                                        });                                                                    
                                                                    } 
                                                                });                                                 
                                                            }
                                                            else
                                                                res.json({error: "error when updating Shipments table"}); 
                                                        }); 
                                                    }
                                                    else
                                                        res.json({error: "error selecting items from Items table"}); 
                                                }); 

                                            }
                                            else
                                                res.json({error: "credit card info incorrect"}); 
                                        }
                                        else
                                            res.json({error: "credit card does not exist on file"}); 
                                    }
                                    else
                                        res.json({error: "error when querying CreditCards table"}); 
                                });
                            }
                    }
                    else
                        res.json({error: "error finding items in SaleItems table"}); 
                });                 
            }
            else{    
                var query = 'SELECT * FROM SaleItems WHERE itemID IN (' + itemIDs + ')'; 
                connection.query(query, function(err, rows, fields){
                    if (!err){
                        var inStock = 1; 
                        var i = 0; 
                        var totalSum = 0;
                        if (rows.length != req.body.itemIDs.length)
                            res.json({error:"at least one item you are purchasing does not exist in SaleItems table"});
                        else{
                                var query1 = 'SELECT * FROM CreditCards WHERE number = ' + req.body.cardNumber; 
                                connection.query(query1, function(err1, rows1, fields1){
                                    if (!err1){
                                        if (rows1.length > 0)
                                        {
                                            if (rows1[0].number == req.body.cardNumber && rows1[0].UID == req.body.UID && rows1[0].type == req.body.type && rows1[0].date == req.body.date && rows1[0].cv2 == req.body.cv2){
                                                var query2 = 'SELECT * FROM Items WHERE itemID IN (' + itemIDs + ')'; 
                                                connection.query(query2, function(err2, rows2, fields2){
                                                    if (!err2){
                                                        var totalSum = 0; 
                                                        for (i = 0; i < rows2.length; i++){
                                                            smallSum = 0; 
                                                            for(j = 0; j < req.body.itemIDs.length; j++){
                                                                if (rows2[i].itemID == req.body.itemIDs[j].id)
                                                                    smallSum = rows2[i].price*req.body.itemIDs[j].quantity; 
                                                            }
                                                            totalSum += smallSum; 
                                                        }
                                                        var d = new Date(); 
                                                        var currDate = '' + d.getFullYear() + '-' + d.getDate() + '-' + d.getMonth(); 
                                                        var newShipment = {creditCardNumber: req.body.cardNumber, destination: req.body.destination, status: "created", totalCost: totalSum, purchaseDate: currDate};
                                                        var query3 = 'INSERT INTO Shipments SET ?'; 
                                                        connection.query(query3, newShipment, function(err3, res3){
                                                            if (!err3){
                                                                var i = 0; 
                                                                async.whilst(function () {
                                                                  return i < req.body.itemIDs.length;
                                                                },
                                                                function (next) {
                                                                    var query11 = 'SELECT * FROM PurchasedItems WHERE shipID=' + res3.insertId + ' AND itemID=' + req.body.itemIDs[i]["id"]; 
                                                                    connection.query(query11, function(err11, rows11, fields11){
                                                                        if (!err11){
                                                                            if (rows11.length > 0){
                                                                                var query22 = 'UPDATE PurchasedItems SET quantity = quantity + ' + req.body.itemIDs[i]["quantity"] + ' WHERE shipID=' + res3.insertId + ' AND itemID=' + req.body.itemIDs[i]["id"];
                                                                                connection.query(query22, function(err22, rows22, fields22){
                                                                                    if (!err22){
                                                                                        var query55 = 'SELECT * FROM SaleItems WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                        console.log(query55); 
                                                                                        connection.query(query55, function(err55, rows55, fields55){
                                                                                            if (!err55){
                                                                                                if (rows55.length > 0){
                                                                                                    console.log(rows55[0].quantity); 
                                                                                                    console.log(req.body.itemIDs[i]["quantity"]); 
                                                                                                    if (rows55[0].quantity - req.body.itemIDs[i]["quantity"] < 0){
                                                                                                        var query66 = 'UPDATE SaleItems SET quantity = 0 WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query66, function(err66, rows66, fields66){
                                                                                                            if (!err66){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err66);  
                                                                                                        });                                                                                                            
                                                                                                    
                                                                                                    }
                                                                                                    else{
                                                                                                        var query5 = 'UPDATE SaleItems SET quantity = quantity - ' + req.body.itemIDs[i]["quantity"] + ' WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query5, function(err5, rows3, fields3){
                                                                                                            if (!err5){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err5);  
                                                                                                        });                                                                                                     
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        });                                                                                        
                                                                                    }
                                                                                    else
                                                                                        next(err22); 
                                                                                
                                                                                }); 
                                                                            }
                                                                            else{
                                                                                var purchasedItem = {shipID: res3.insertId, itemID: req.body.itemIDs[i]["id"], quantity: req.body.itemIDs[i]["quantity"], location: req.body.location};
                                                                                var query4 = 'INSERT INTO PurchasedItems SET ?'; 
                                                                                connection.query(query4, purchasedItem, function(err4, res4){
                                                                                    if (!err4){
                                                                                        var query55 = 'SELECT * FROM SaleItems WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                        connection.query(query55, function(err55, rows55, fields55){
                                                                                            if (!err55){
                                                                                                if (rows55.length > 0){
                                                                                                    if (rows55[0].quantity - req.body.itemIDs[i]["quantity"] < 0){
                                                                                                        var query66 = 'UPDATE SaleItems SET quantity = 0 WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query66, function(err66, rows66, fields66){
                                                                                                            if (!err66){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err66);  
                                                                                                        });                                                                                                            
                                                                                                    
                                                                                                    }
                                                                                                    else{
                                                                                                        var query5 = 'UPDATE SaleItems SET quantity = quantity - ' + req.body.itemIDs[i]["quantity"] + ' WHERE itemID = ' + req.body.itemIDs[i]["id"]; 
                                                                                                        connection.query(query5, function(err5, rows3, fields3){
                                                                                                            if (!err5){
                                                                                                                i++; 
                                                                                                                next(); 
                                                                                                            }
                                                                                                            else
                                                                                                                next(err5);  
                                                                                                        });                                                                                                     
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        });                                                                                        
                                                                                    }
                                                                                    else
                                                                                        next(err4); 
                                                                                });                                                                                 
                                                                            }
                                                                        }
                                                                        else
                                                                            next(err11); 
                                                                    }); 
                                                                },
                                                                function (err) {
                                                                    if(err) {
                                                                        res.json({error: err}); 
                                                                    }
                                                                    else{
                                                                        var i = 0;
                                                                        var orderBool2 = 0; 
                                                                        async.whilst(function () {
                                                                          return i < rows.length;
                                                                        },
                                                                        function (next) {
                                                                            if ((rows[i].quantity - req.body.itemIDs[i]["quantity"]) < 0){
                                                                                var orderQuantity = Math.abs(rows[i].quantity - req.body.itemIDs[i]["quantity"]);
                                                                                var query00 = 'SELECT * FROM Orders WHERE UID="' + req.body.UID + '" AND itemID=' + req.body.itemIDs[i]["id"]; 
                                                                                connection.query(query00, function(err00, rows00, fields00){
                                                                                    if (!err00){
                                                                                        if (rows00.length > 0){
                                                                                            var query10 = 'UPDATE Orders SET quantity = quantity + ' + orderQuantity + ' WHERE UID="' + req.body.UID + '" AND itemID=' + req.body.itemIDs[i]["id"];
                                                                                            connection.query(query10, function(err10, rows10, fields10){
                                                                                                if (!err10){
                                                                                                    i++;
                                                                                                    orderBool2 = 1; 
                                                                                                    next(); 
                                                                                                }
                                                                                                else
                                                                                                    next(err10); 
                                                                                            }); 
                                                                                        }
                                                                                        else{
                                                                                            var query12 = 'INSERT INTO Orders SET ?'; 
                                                                                            var newOrder = {UID: req.body.UID, itemID: req.body.itemIDs[i]["id"], quantity: orderQuantity};
                                                                                            connection.query(query12, newOrder, function(err12, res12){
                                                                                                if (!err12){
                                                                                                    i++;
                                                                                                    orderBool2 = 1; 
                                                                                                    next(); 
                                                                                                }
                                                                                                else
                                                                                                    next(err12); 
                                                                                            }); 
                                                                                        }
                                                                                    }
                                                                                    else
                                                                                        next(err00); 
                                                                                }); 
                                                                            }
                                                                            else{
                                                                                i++;
                                                                                next();
                                                                            }
                                                                        },
                                                                        function (err) {
                                                                            if(err) 
                                                                                res.json({error: err}); 
                                                                            else{
                                                                                if (orderBool2 == 1)
                                                                                    res.json({error: "Orders have been placed for out of stock items"}); 
                                                                                else
                                                                                    res.json({success: true});                         
                                                                            }
                                                                            
                                                                        });                                                                    
                                                                    } 
                                                                });                                                 
                                                            }
                                                            else
                                                                res.json({error: "error when inserting into Shipments"}); 
                                                        }); 
                                                    }
                                                    else
                                                        res.json({error: "error selecting items from Items table"}); 
                                                }); 

                                            }
                                            else
                                                res.json({error: "credit card info incorrect"}); 
                                        }
                                        else
                                            res.json({error: "credit card does not exist on file"}); 
                                    }
                                    else
                                        res.json({error: "error when querying CreditCards table"}); 
                                });
                            }
                    }
                    else
                        res.json({error: "error finding items in SaleItems table"}); 
                });             
            }
        }
        else
            res.json({error: "error querying Shipments table"}); 
    }); 

}); 
router.post('/browsedItem', function(req, res){
    var query = 'INSERT INTO BrowsingHistory SET ?'; 
    connection.query(query, req.body, function(err, res1){
        if (!err){
            res.json(req.body); 
        }
        else
            res.json({error: "error inserting into BrowsingHistory table"}); 
    }); 
}); 
router.post('/getBrowsed', function(req, res){
    var query = 'SELECT * FROM BrowsingHistory WHERE UID="' + req.body.UID + '"'; 
    connection.query(query, function(err, rows, fields){
        if (!err){
            res.json(rows); 
        }
        else
            res.json({error: "error querying BrowsingHistory table"}); 
    }); 
}); 
router.post('/bid', function(req, res){
    var query = 'SELECT * FROM Items WHERE itemID = ' + req.body.itemID; 
    connection.query(query, function(err, rows, fields){
        if (!err){
            if (rows.length > 0){
                if (rows[0].price >= req.body.bidAmount){
                    res.json({error: "error bid amount is lower than or equal to current item price"});
                }
                else{
                    var query1 = 'SELECT * FROM CreditCards WHERE UID="' + req.body.UID + '"';
                    connection.query(query1, function(err1, rows1, fields1){
                        if (!err1){
                            if (rows1.length > 0){
                                var query2 = 'DELETE FROM HighestBids WHERE itemID = ' + req.body.itemID; 
                                connection.query(query2, function(err3, rows2, fields2){
                                    if (!err3){
                                        var newBid = {itemID: req.body.itemID, UID: req.body.UID};
                                        var query3 = 'INSERT INTO HighestBids SET ?'; 
                                        connection.query(query3, newBid, function(err4, res1){
                                            if (!err4){
                                                var query4 = 'UPDATE Items SET price = ' + req.body.bidAmount + ' WHERE itemID = ' + req.body.itemID; 
                                                connection.query(query4, function(err5, rows3, fields3){
                                                    if (!err){
                                                        var resultData = {highestBidder: true, newPrice: req.body.bidAmount}
                                                        res.json(resultData); 
                                                    }
                                                    else
                                                        res.json({error: "error updating Items item prices to new price"}); 
                                                }); 
                                            }
                                            else
                                                res.json({error: "error inserting into HighestBids"}); 
                                        }); 
                                    }
                                    else
                                        res.json({error: "delete statement in HighestBids failed"}); 
                                }); 
                            }
                            else
                                res.json({error: "no credit cards on file"}); 
                        } 
                        else
                            res.json({error: "error selecting rows from CreditCards"}); 
                    });                 
                }
                
            }
            else
                res.json({error: "item doesn't exist"}); 
        }
    
    }); 
}); 
router.post('/getPurchasedItems', function(req, res){
    var query = 'SELECT S.shipID, P.itemID, P.quantity, I.description, I.vendorID, I.price, I.location, I.url, I.name FROM Shipments S, CreditCards C, PurchasedItems P, Items I WHERE S.creditCardNumber=C.number AND P.shipID=S.shipID AND C.UID="' + req.body.UID + '" AND I.itemID=P.itemID';
    connection.query(query, function(err, rows, fields){
        if (!err){
            if (rows.length > 0){
                var i = 0; 
                var j = 0; 
                var resultSet = {}; 
                for (i = 0; i < rows.length; i++){
                    var itemsArr = []; 
                    for(j=0; j < rows.length; j++){
                        if (rows[i].shipID == rows[j].shipID){
                            var item = {itemID: rows[j].itemID, quantity: rows[j].quantity, description: rows[j].description, vendorID: rows[j].vendorID, price: rows[j].price, location: rows[j].location, url: rows[j].url, name: rows[j].name};
                            itemsArr.push(item); 
                        }
                    }
                    resultSet[rows[i].shipID.toString()] = itemsArr; 
                }
                res.json(resultSet); 
            }
            else
                res.json({error: "this user has no shipments"}); 
        }
        else
            res.json({error: "error finding info across 3 tables"}); 
    }); 


}); 
router.post('/getRatings', function(req, res){
    var query = 'SELECT * FROM Ratings WHERE itemID = ' + req.body.itemID; 
    connection.query(query, function(err, rows, fields){
        if (!err)
            res.json(rows); 
        else
            res.json({error: "error querying Ratings table"}); 
        
    }); 
}); 
router.post('/addRating', function(req, res){
    var query = 'INSERT INTO Ratings SET ?'; 
    connection.query(query, req.body, function(err, res1){
        if (!err){
            var query1 = 'SELECT AVG(R.rating) as avgRating FROM Ratings R WHERE itemID=' + req.body.itemID; 
            connection.query(query1, function(err1, rows, fields){
                if (!err1){
                    var result = {newAvgRating: rows[0].avgRating}
                    res.json(result); 
                }
                else
                    res.json({error: "error getting new average rating for item"}); 
            }); 
        }
        else
            res.json({error: "error inserting into Ratings table"}); 
    }); 
}); 
router.post('/Item', function(req, res){
    var query = "INSERT INTO Items SET ?"; 
    var itemData = {"vendorID": req.body.vendorID, "price": req.body.price, "location": req.body.location, "description": req.body.description, "url": req.body.url, "name": req.body.name};
    connection.query(query, itemData, function(err, res1){
        insertID = res1.insertId;
        if (!err){
            var query1 = 'SELECT * FROM Items WHERE itemID = ' + insertID; 
            connection.query(query1, function(err1, rows, fields){
                if (!err1){
                    var auctionedItem = {"itemID": insertID, "endTime": req.body.endTime, "reservePrice": req.body.reservePrice};
                    var query2 = 'INSERT INTO AuctionItems SET ?';
                    connection.query(query2, auctionedItem, function(err2, res2){
                        if (!err2){
                            var query3 = 'SELECT * FROM CategoriesHierarchy WHERE cid="' + req.body.cid + '"';
                            connection.query(query3, function(err3, rows1, fields1){
                                if (!err){
                                    var query4 = 'INSERT INTO CategoryAssociation SET ?';
                                    var catAssoc1 = {"itemID": res1.insertId, "cid": req.body.cid};
                                    connection.query(query4, catAssoc1, function(err4, res2){
                                        if (!err4){
                                            if (rows1[0].up1 != null){
                                                var query5 = 'INSERT INTO CategoryAssociation SET ?';
                                                var catAssoc2 = {"itemID": res1.insertId, "cid": rows1[0].up1};
                                                connection.query(query5, catAssoc2, function(err5, res3){
                                                    if (!err5){
                                                        if (rows1[0].up2 != null){
                                                            var query6 = 'INSERT INTO CategoryAssociation SET ?';
                                                            var catAssoc3 = {"itemID": res1.insertId, "cid": rows1[0].up2};
                                                            connection.query(query6, catAssoc3, function(err6, res4){
                                                                if (!err6){
                                                                    res.json(rows[0]); 
                                                                }
                                                                else
                                                                    res.json({error: "error inserting into CategoryAssociation table (up2)"});
                                                            });
                                                        }
                                                        else
                                                            res.json(rows[0]);
                                                    }
                                                    else
                                                        res.json({error: "error inserting into CategoryAssociation table (up1)"});
                                                        
                                                }); 
                                            }
                                            else
                                                res.json(rows[0]);
                                        }
                                        else
                                            res.json({error: "error inserting into CategoryAssociation table (first cid)"});
                                    }); 
                                }
                                else
                                    res.json({error: "error selecting from CategoryHierarchy table"});
                            
                            });                             
                        }
                        else
                            res.json({error: "error with AuctionedTtems table"});
                    });                     
                }
                else
                    res.json({error: "error with Items table"}); 
            }); 
        }
        else{
            res.json({error: "error with Items table insertion"}); 
        }
    }); 
}); 

