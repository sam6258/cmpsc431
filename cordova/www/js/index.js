$(document).ready(function() {
    var currentUser = null;
    var displayedAuctionItems = null;
    var displayedSaleItems = null;
    var currentlyDisplayedItems = null;
    var currentlyDisplayedItemsJSON = null;
    var shoppingCart = [];
    var biddingOn = null;
    var showAuctionItems = true;
    var showSaleItems = true;

    var formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                });
    var cards = [];


    initializeDisplayItems();

    $(".vendor-element").hide();
    $("#login-submit").click(function() {
        uid = $("#login-uid").val();
        var pass = $("#login-pass").val();
        var userObj = {
            "uid": uid,
            "password": pass
        };
        $.ajax({
            url: "https://himalaya431.herokuapp.com/app/Users",
            type: "POST",
            data: JSON.stringify(userObj),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
            crossDomain: true,
            success: function(data){
                currentUser = data;
                if (currentUser.error) {
                    alert("Login Error. Please try again.");
                    uid = null;
                }
                else {
                    populateCreditCardSelects();
                    $(".login-buttons").hide();
                    $(".uid").html(currentUser.UID);
                    if (currentUser.vendor) {
                        $(".vendor-element").show();
                    }
                    $("#login .close").click();
                }
            },
            error: function(error) {
                console.log("ERROR: ");
                console.log(error);
                uid = null;
            }
        });
    });

    $("#signup-submit").click(function() {
        uid = $("#signup-uid").val();
        var pass = $("#signup-pass").val();
        var name = $("#signup-name").val();
        var address = $("#signup-address").val();
        var email = $("#signup-email").val();
        var phone = $("#signup-phone").val();
        var age = $("#signup-age").val();
        var gender = $("#signup-gender").val();
        var income = $("#signup-income").val();
        var wantsVendor = ($("#signup-vendor-check").is(':checked') ? true : false);

        if (uid.length == 0) {
            alert("User Id field empty");
        }
        else if (name.length == 0) {
            alert("Name field empty");
        }
        else if (address.length == 0) {
            alert("Address field empty");
        }
        else if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email) == false) {
            alert("Email incorrectly formatted");
        }
        else if (phone.length == 0) {
            alert("Phone number field empty");
        }
        else if (isNaN(parseInt(age)) || parseInt(age) <= 18 || parseInt(age) >= 150) {
            alert("Please enter a valid age");
        }
        else if (/^[a-zA-z]$/.test(gender) == false) {
            alert("Enter a single character for gender");
        }
        else if (/^[0-9]+(\.[0-9]+)?$/.test(income) == false) {
            alert("Please enter a valid salary");
        }
        else if(pass.length == 0) {
            alert("Password field empty");
        }
        else {
            var userObj = {
                "UID": uid,
                "name": name,
                "address": address,
                "email": email,
                "phone": phone,
                "age": age,
                "gender": gender,
                "income": income,
                "password": pass,
                "vendor": wantsVendor
            };
            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/User",
                type: "POST",
                data: JSON.stringify(userObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    currentUser = data;
                    if (currentUser.error) {
                        alert("Sign up error: " + currentUser.error);
                        uid = null;
                    }
                    else {
                        $(".login-buttons").hide();
                        $(".uid").html(currentUser.UID);
                        if (currentUser.vendor) {
                            $(".vendor-element").show();
                        }
                        $("#signup .close").click();
                    }
                },
                error: function(error) {
                    console.log("ERROR: ");
                    console.log(error);
                    uid = null;
                }
            });
        }

    });

    $("#vendor-add-submit").click(function() {
        var price = $("#vendor-add-price").val();
        var location = $("#vendor-add-location").val();
        var description = $("#vendor-add-description").val();
        var url = $("#vendor-add-url").val();
        var reserve = $("#vendor-add-reserve").val();
        var endTime = $("#vendor-add-end-time").val();
        var cat = $("#vendor-add-cat-select").find(":selected").text();
        var name = $("#vendor-add-name").val();

        if (name.length == 0) {
            alert("Name field is empty");
        }
        else if (price.length == 0) {
            alert("Price field is empty");
        }
        else if (/^\d+(\.\d\d)?$/.test(price) == false) {
            alert ("Format price as x.xx");
        }
        else if (location.length == 0) {
            alert("Location field is empty");
        }
        else if (description.length == 0) {
            alert("Description field is empty");
        }
        else if (url.length == 0) {
            alert("Url field is empty");
        }
        else if (/^\d+(\.\d\d)?$/.test(reserve) == false) {
            alert("Format reserve price as x.xx");
        }
        else if (endTime.length == 0) {
            alert("End time is empty");
        }
        else {
            var postItemObj = {
                "vendorID": uid,
                "price": price,
                "location": location,
                "description": description,
                "url": url,
                "cid": cat,
                "endTime": endTime,
                "reservePrice": reserve,
                "name": name
            }

            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/Item",
                type: "POST",
                data: JSON.stringify(postItemObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    if (data.error) {
                        alert("Item couldn't be added: " + data.error);
                    }
                    else {
                        $("#vendor-add-modal input").each(function() {
                            $(this).val("");
                        })
                        $("#vendor-add-modal .close").click();
                        alert("Item Added");
                    }
                },
                error: function(error) {
                    alert("Item couldn't be added.");
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
            
        }
    });

    $("#add-pay-submit").click(function() {
        var cardNum = $("#add-pay-cardnum").val();
        var date = $("#add-pay-expire").val();
        var cv2 = $("#add-pay-cv2").val();
        var type = $("#add-pay-select").find(":selected").text();

        if (currentUser == null) {
            alert("You must be signed in to add a payment method.");
        }
        else {
            var postObj = {
                "number": parseInt(cardNum),
                "UID": currentUser.UID,
                "type": type,
                "date": date,
                "cv2": parseInt(cv2)
            };
            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/addPayment",
                type: "POST",
                data: JSON.stringify(postObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    if (data.error) {
                        $("#payment-methods-modal .close").click();

                        showSnackBar("Payment method couldn't be added.");
                    }
                    else {
                        populateCreditCardSelects();
                        $("#payment-methods-modal input").each(function() {
                            $(this).val("");
                        })
                        $("#payment-methods-modal .close").click();
                        
                        showSnackBar("Payment method has been added to your account.");
                    }
                },
                error: function(error) {
                    $("#payment-methods-modal .close").click();
                    showSnackBar("Payment method couldn't be added.");
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
        }
    });

    $(".item-category").click(function(e) {
        e.stopPropagation();
        var category = $(this).attr('category');
        var catObj = {
            "cid": category
        }

        $.ajax({
            url: "https://himalaya431.herokuapp.com/app/Categories",
            type: "POST",
            data: JSON.stringify(catObj),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
            crossDomain: true,
            success: function(data){
                if (!data.error) {
                    currentlyDisplayedItems = data;
                    var itemsObj = {
                        "itemIDs": currentlyDisplayedItems
                    };
                    $.ajax({
                        url: "https://himalaya431.herokuapp.com/app/Items",
                        type: "POST",
                        data: JSON.stringify(itemsObj),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Content-Type', 'application/json');
                        },
                        crossDomain: true,
                        success: function(data){
                            if (!data.error) {
                                currentlyDisplayedItemsJSON = data;
                                resetDisplayItems();
                            }
                        },
                        error: function(error) {
                            console.log("ERROR: ");
                            console.log(error);
                        }
                    });
                }
            },
            error: function(error) {
                console.log("ERROR: ");
                console.log(error);
            }
        });
    });


    function initializeDisplayItems() {
        $.ajax({
            url: "https://himalaya431.herokuapp.com/app/Items",
            type: "GET",
            crossDomain: true,
            success: function(data){
                if (!data.error) {
                    displayedAuctionItems = data.auctionItems;
                    displayedSaleItems = data.saleItems;
                    var itemsObj = {
                        "itemIDs": displayedAuctionItems.concat(displayedSaleItems)
                    };
                    $.ajax({
                        url: "https://himalaya431.herokuapp.com/app/Items",
                        type: "POST",
                        data: JSON.stringify(itemsObj),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Content-Type', 'application/json');
                        },
                        crossDomain: true,
                        success: function(data){
                            if (!data.error) {
                                currentlyDisplayedItemsJSON = data;
                                resetDisplayItems();
                            }
                        },
                        error: function(error) {
                            console.log("ERROR: ");
                            console.log(error);
                        }
                    });
                }
            },
            error: function(error) {
                console.log("ERROR: ");
                console.log(error);
            }
        });
    }

    function resetDisplayItems() {
        $("#sale-items .row").remove();
        var auctionItems = currentlyDisplayedItemsJSON.auctionedItems;
        var saleItems = currentlyDisplayedItemsJSON.saleItems;
        var count = 0;
        for (var i = 0; i < auctionItems.length || i < saleItems.length; i++) {
            console.log(i);
            if (count % 3 == 0) {
                var newRow = '<div class="row"></div>';
                $("#sale-items").append(newRow);
            }
            var appendTo = $("#sale-items .row").last();
            if (i >= auctionItems.length && showSaleItems) {
                appendTo.append(getSaleItemHTML(saleItems[i]));
                                    console.log("376")

                count++;
            }
            else if (i >= saleItems.length && showAuctionItems) {
                appendTo.append(getAuctionItemHTML(auctionItems[i]));
                count++;
            }
            else {
                if (showAuctionItems && auctionItems[i] != null) {
                    appendTo.append(getAuctionItemHTML(auctionItems[i]));
                    count++;
                    if (count % 3 == 0 && showSaleItems) {
                        var newRow = '<div class="row"></div>';
                        $("#sale-items").append(newRow);
                    }
                }
                if (showSaleItems && saleItems[i] != null) {
                    appendTo = $("#sale-items .row").last();
                    if (saleItems[i] == null) {
                        console.log("here");
                    }
                    appendTo.append(getSaleItemHTML(saleItems[i]));
                    count++;
                }
            }
        }

        function getSaleItemHTML(itemObj) {
            var newItem =  '<div item-id="' + itemObj.itemID +'" quantity="' + itemObj.quantity + '" price="' + itemObj.price + '" name="' + itemObj.name + '" description="' + itemObj.description + '" class="span3">' + 
                                '<div class="thumbnail">' + 
                                    '<img src="' + itemObj.url + '" alt=""/>' +
                                    '<div class="caption">' +
                                        '<h5>' + itemObj.name + '</h5>' +
                                        '<p>' + itemObj.description + '</p>' + 
                                        '<h4 style="text-align:center"><a class="btn">In Stock: <span class="quantity">' + itemObj.quantity + '</span></a> <a class="btn cart-btn">Add to <i class="icon-shopping-cart"></i></a> <a class="btn btn-primary buy-btn price-btn">' + formatter.format(itemObj.price) + '</a></h4>' + 
                                    '</div>' + 
                                '</div>' +
                            '</div>';
            return newItem;
        }

        function getAuctionItemHTML(itemObj) {
            var newItem =  '<div item-id="' + itemObj.itemID +'" reserve-price="' + itemObj.reservePrice + '" price="' + itemObj.price + '" name="' + itemObj.name + '" description="' + itemObj.description + '" class="span3">' + 
                                '<div class="thumbnail">' + 
                                    '<img src="' + itemObj.url + '" alt=""/>' +
                                    '<div class="caption">' +
                                        '<h5>' + itemObj.name + '</h5>' +
                                        '<p>' + itemObj.description + '</p>' + 
                                        '<h4 style="text-align:center"><a class="btn">Auction End: ' + convertTimeStamp(itemObj.endTime) + '</a> <a class="btn bid-btn">Bid on Item</a> <a class="btn btn-primary bid-btn price-btn">' + formatter.format(itemObj.price) + '</a></h4>' + 
                                    '</div>' + 
                                '</div>' +
                            '</div>';
                            convertTimeStamp(itemObj.endTime);
            return newItem;
        }

        function convertTimeStamp(stamp) {
            var t = stamp.split(/[- T : \.]/);
            var d = new Date(stamp);

            return (d.getMonth() + 1) + "/" + d.getDay() + "/" + (d.getFullYear() + "").slice(2, 4) + " " + getDateString (d);
            function getDateString (date) {
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0'+minutes : minutes;
                var strTime = hours + ':' + minutes + ampm;
                return strTime;
             }
        }
/*
        for (var i = 0; i < auctionItems.length; i++)
        {
            if (i % 3 == 0) {
                var newRow = '<div class="row"></div>';
                $("#sale-items").append(newRow);

            }
            
            var appendTo = $("#sale-items .row").last();
            var newItem = '';
            console.log("here");
            if (displayedAuctionItems.indexOf(items[i].itemID) == 0) {
                newItem +=      '<div item-id="' + items[i].itemID +'" price="' + items[i].price + ' name="' + items[i].name + '" description="' + items[i].description + '" class="span3">' + 
                                '<div class="thumbnail">' + 
                                    '<img style="max-width: 250px" src="' + items[i].url + '" alt=""/>' +
                                    '<div class="caption">' +
                                        '<h5>' + items[i].name + '</h5>' +
                                        '<p>' + items[i].description + '</p>' + 
                                        '<h4 style="text-align:center"><a class="btn"> <i class="icon-zoom-in"></i></a> <a class="btn bid-btn">Bid on Item</a> <a class="btn btn-primary price-btn">' + formatter.format(items[i].price) + '</a></h4>' + 
                                    '</div>' + 
                                '</div>' +
                            '</div>';
            }
            else if (displayedSaleItems.indexOf(items[i].itemID) == 0) {
                newItem +=      '<div item-id="' + items[i].itemID +'" price="' + items[i].price + ' name="' + items[i].name + '" description="' + items[i].description + '" class="span3">' + 
                                '<div class="thumbnail">' + 
                                    '<img style="max-width: 250px" src="' + items[i].url + '" alt=""/>' +
                                    '<div class="caption">' +
                                        '<h5>' + items[i].name + '</h5>' +
                                        '<p>' + items[i].description + '</p>' + 
                                        '<h4 style="text-align:center"><a class="btn"> <i class="icon-zoom-in"></i></a> <a class="btn cart-btn">Add to <i class="icon-shopping-cart"></i></a> <a class="btn btn-primary price-btn">' + formatter.format(items[i].price) + '</a></h4>' + 
                                    '</div>' + 
                                '</div>' +
                            '</div>';
            }

            
            appendTo.append(newItem);*/
      //  }

        $(".bid-btn").click(function() {
            var parent = $(this).closest(".span3");
            biddingOn = parent;
            $("#bid-modal-item-name").html(parent.attr('name'));
            $("#bid-modal-item-description").html(parent.attr('description'));
            $("#bid-modal-amount").val((parseFloat(parent.attr('price')) + 1).toFixed(2));
            if (currentUser == null) {
                showSnackBar("You must be logged in to bid on items.");
            }
            else {
                $("#bid-modal-show").click();
            }
        });

        $(".buy-btn").click(function() {
            var parent = $(this).closest(".span3");
            buyingItem = parent;
            $("#buy-modal-item-name").html(parent.attr('name'));
            $("#buy-modal-item-description").html(parent.attr('description'));
            $("#buy-modal-item-price").html(formatter.format(parent.attr('price')));
            if (currentUser == null) {
                showSnackBar("You must be logged in to buy items.");
            }
            else {
                populateCreditCardSelects();
                $("#buy-modal-show").click();
            }
        });

        $(".cart-btn").click(function() {
            var parent = $(this).closest(".span3");
            shoppingCart.push({
                "id": parent.attr('item-id'),
                "cost": parent.attr('price')
            });
            $(".cart-count").each(function() {
                $(this).html(shoppingCart.length);
            });
            var sum = 0;
            for (var i = 0; i < shoppingCart.length; i++)
            {   
                sum += parseFloat(shoppingCart[i].cost);
            }   
            $(".cart-cost").each(function() {
                $(this).html(formatter.format(sum));
            });

            showSnackBar("Item has been added to your cart.");
        });
    }

    $(".bid-modal-close").click(function() {
        if ($(this).hasClass("btn-success")) {
            //needs post request
            var amount = parseFloat($("#bid-modal-amount").val());
            var itemID = parseInt(biddingOn.attr('item-id'));
            var postObj = {
                "UID": currentUser.UID,
                "bidAmount": amount,
                "itemID": itemID
            }
            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/bid",
                type: "POST",
                data: JSON.stringify(postObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    if (data.error) {
                        $("#bid-modal .close").click();

                        showSnackBar(data.error);
                    }
                    else {
                        if (data.highestBidder == true) {
                            showSnackBar("You bid $" + $("#bid-modal-amount").val() + " on " + biddingOn.attr('name'));
                            biddingOn.attr('price', data.newPrice + "");
                            biddingOn.find(".price-btn").html(formatter.format(data.newPrice));
                            $("#bid-modal input").each(function() {
                                $(this).val("");
                            })
                            $("#bid-modal .close").click();
                            biddingOn = null;
                        }
                        else {
                            showSnackBar("Your bid was not high enough.");
                        }
                    }
                },
                error: function(error) {
                    $("#bid-modal .close").click();
                    showSnackBar("Error bidding on item.");
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
        }
        else {
            biddingOn = null;
        }
    });

    $(".buy-modal-close").click(function() {
        if ($(this).hasClass("btn-success")) {
            var amount = parseFloat($("#buy-modal-amount").val());
            var itemIDs = [];
            var card = cards[parseInt($("#buy-modal-select").find(":selected").attr('card-index'))];
            var cv2 = parseInt($("#buy-modal-cv2").val());
            itemIDs.push(parseInt(buyingItem.attr('item-id')));
            var postObj = {
                "UID": currentUser.UID,
                "itemIDs": itemIDs,
                "cardNumber": card.number,
                "date": card.date,
                "type": card.type,
                "cv2": cv2,
                "destination": "123 Cherry Lane"
            }

            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/buy",
                type: "POST",
                data: JSON.stringify(postObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    if (data.error) {
                        showSnackBar(data.error);
                    }
                    else {
                        showSnackBar("You bought " + buyingItem.attr('name') + " for " + formatter.format(parseFloat(buyingItem.attr('price'))));
                        var tmpQuantity = parseInt(buyingItem.attr('quantity'));
                        buyingItem.attr('quantity', tmpQuantity - 1);
                        buyingItem.find(".quantity").html(tmpQuantity - 1);
                        $("#buy-modal input").each(function() {
                            $(this).val("");
                        })
                        $("#buy-modal .close").click();
                        buyingItem = null;
                    }
                },
                error: function(error) {
                    $("#buy-modal .close").click();
                    showSnackBar("Error bidding on item.");
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
        }
        else {
            buyingItem = null;
        }
    });

    function showSnackBar(text) {
        var x = $("#snackbar")
        x.html(text);
        // Add the "show" class to DIV
        x.addClass("show");

        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.removeClass("show"); }, 3000);
    }

    $("#srchFld").keyup(function(event){
        if(event.keyCode == 13){
            $("#search-submit").click();
        }
    });

    $("#search-submit").click(function() {
        var tokens = $("#srchFld").val();
        var cat = $("#search-select").find(":selected").text();
        tokens = tokens.toLowerCase();
        tokens = tokens.split(/\s+/);

        if (cat == "All") {
            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/Items",
                type: "GET",
                crossDomain: true,
                success: function(data){
                    if (!data.error) {
                        var itemsObj = {
                            "itemIDs": data.auctionItems.concat(data.saleItems)
                        };
                        $.ajax({
                            url: "https://himalaya431.herokuapp.com/app/Items",
                            type: "POST",
                            data: JSON.stringify(itemsObj),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Content-Type', 'application/json');
                            },
                            crossDomain: true,
                            success: function(data){
                                if (!data.error) {
                                    var matches = getSearchMatches(data, tokens);
                                    var itemsObj = {
                                        "itemIDs": matches
                                    };
                                    $.ajax({
                                        url: "https://himalaya431.herokuapp.com/app/Items",
                                        type: "POST",
                                        data: JSON.stringify(itemsObj),
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('Content-Type', 'application/json');
                                        },
                                        crossDomain: true,
                                        success: function(data){
                                            if (!data.error) {
                                                currentlyDisplayedItemsJSON = data;
                                                resetDisplayItems();
                                                scrollToID("#mainBody", 1000);
                                            }
                                        },
                                        error: function(error) {
                                            console.log("ERROR: ");
                                            console.log(error);
                                        }
                                    });
                                }
                            },
                            error: function(error) {
                                console.log("ERROR: ");
                                console.log(error);
                            }
                        });
                    }
                },
                error: function(error) {
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
        }
        else {
            var catObj = {
                "cid": cat
            }

            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/Categories",
                type: "POST",
                data: JSON.stringify(catObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    if (!data.error) {
                        var itemsObj = {
                            "itemIDs": data
                        };
                        $.ajax({
                            url: "https://himalaya431.herokuapp.com/app/Items",
                            type: "POST",
                            data: JSON.stringify(itemsObj),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Content-Type', 'application/json');
                            },
                            crossDomain: true,
                            success: function(data){
                                if (!data.error) {
                                    var matches = getSearchMatches(data, tokens);
                                    var itemsObj = {
                                        "itemIDs": matches
                                    };
                                    $.ajax({
                                        url: "https://himalaya431.herokuapp.com/app/Items",
                                        type: "POST",
                                        data: JSON.stringify(itemsObj),
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('Content-Type', 'application/json');
                                        },
                                        crossDomain: true,
                                        success: function(data){
                                            if (!data.error) {
                                                currentlyDisplayedItemsJSON = data;
                                                resetDisplayItems();
                                                scrollToID("#mainBody", 1000);
                                            }
                                        },
                                        error: function(error) {
                                            console.log("ERROR: ");
                                            console.log(error);
                                        }
                                    });
                                }
                            },
                            error: function(error) {
                                console.log("ERROR: ");
                                console.log(error);
                            }
                        });
                    }
                },
                error: function(error) {
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
        }
    });

    function getSearchMatches(data, tokens) {
        var items = data.saleItems.concat(data.auctionedItems);
        var matches = [];
        for (var i = 0; i < items.length; i++) {
            var name = items[i].name;
            var desc = items[i].description;
            var potentialMatch = true;
            for (var j = 0; j < tokens.length; j++) {
                var token = tokens[j];
                if (!( (name != null && name.toLowerCase().search(token) >= 0) || (desc != null && desc.toLowerCase().search(token) >= 0) )) {
                    potentialMatch = false;
                }
            }
            if (potentialMatch) {
                matches.push(items[i].itemID);
            }
        }
        if (matches.length == 0) {
            showSnackBar("No items matching your search");
        }

        return matches;
    }

    function scrollToID(id, time) {
        $('html, body').animate({
            scrollTop: $(id).offset().top
        }, time);
    }
    $("#show-auction-check").click();

    $("#show-auction-check").click(function() {
        if ($(this).is(":checked")) {
            showAuctionItems = true;
        }
        else {
            showAuctionItems = false;
        }
        resetDisplayItems();
    });

    $("#show-sale-check").click();

    $("#show-sale-check").click(function() {
        if ($(this).is(":checked")) {
            showSaleItems = true;
        }
        else {
            showSaleItems = false;
        }
        resetDisplayItems();
    });

    function populateCreditCardSelects() {
        $(".credit-card-select").each(function() {
            $(this).html("");
        });
        $.ajax({
            url: "https:/himalaya431.herokuapp.com/app/getPayments",
            type: "POST",
            data: JSON.stringify({"UID": currentUser.UID}),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
            crossDomain: true,
            success: function(data){
                if (data.error) {
                    showSnackBar(data.error);
                }
                else {
                    cards = data;
                    var selectHTML = '';
                    for (var i = 0; i < cards.length; i++) {
                        selectHTML += '<option card-index="' + i + '">' + cards[i].type + ' - ' + (cards[i].number % 10000) + '</option>';
                    }
                    $(".credit-card-select").each(function() {
                        $(this).html(selectHTML);
                    });
                }
            },
            error: function(error) {
                showSnackBar("Error retrieving payment methods.");
                console.log("ERROR: ");
                console.log(error);
            }
        });
    }

    function getCartItemHTML(itemObj) {
        var quantity = 0;
        for (var i = 0; i < shoppingCart.length; i++) {
            if (shoppingCart[i].id == itemObj.itemID) {
                quantity++;
            }
        }
        var html =  '<div class="thumbnail">' + 
                        '<img class="mycart-img" src="' + itemObj.url + '"></img>' + 
                        '<div class="caption">' +
                            '<h4>' + itemObj.name + '</h4>' +
                            '<div class="left-with-indent">' +
                                '<h5 style="display: inline">Description:<br><br></h5><span style="padding-left: 30px">' + itemObj.description + '<br></span><br>' +
                                '<h5 style="display: inline">Quantity:&nbsp;</h5>' +
                                '<input autocomplete="off" class="mycart-quantity" item-id="' + itemObj.itemID + '" type="number" min="0" value="' + quantity + '"></input><span>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        return html;
    }

    $(".render-cart").click(function() {
        var ids = [];
        for (var i = 0; i < shoppingCart.length; i++) {
            ids.push(shoppingCart[i].id);
        }
        var itemsObj = {
            "itemIDs": ids
        };
        console.log(ids);
        $.ajax({
            url: "https://himalaya431.herokuapp.com/app/Items",
            type: "POST",
            data: JSON.stringify(itemsObj),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
            crossDomain: true,
            success: function(data){
                if (!data.error) {
                    console.log(data);
                    $("#mycart-thumbnails").html("");
                    for (var i = 0; i < data.saleItems.length; i++) {
                        $("#mycart-thumbnails").append(getCartItemHTML(data.saleItems[i]));
                    }
                }
            },
            error: function(error) {
                console.log("ERROR: ");
                console.log(error);
            }
        });
    });

    $(".mycart-modal-close").click(function() {
        if ($(this).hasClass("btn-success")) {
            
        }
    });

    $("#mycart-modal-submit").click(function() {
        var ids = [];

        if (currentUser == null) {
            $("#mycart-modal .close").click();
            showSnackBar("Please login before making a purchase.");
            return;
        }


        $(".mycart-quantity").each(function() {
            for (var i = 0; i < $(this).val(); i++) {
                ids.push(parseInt($(this).attr('item-id')));
            }
        });

            var card = cards[parseInt($("#mycart-modal-select").find(":selected").attr('card-index'))];
            var cv2 = parseInt($("#mycart-modal-cv2").val());
            var postObj = {
                "UID": currentUser.UID,
                "itemIDs": ids,
                "cardNumber": card.number,
                "date": card.date,
                "type": card.type,
                "cv2": cv2,
                "destination": "123 Cherry Lane"
            }

            $.ajax({
                url: "https://himalaya431.herokuapp.com/app/buy",
                type: "POST",
                data: JSON.stringify(postObj),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                crossDomain: true,
                success: function(data){
                    if (data.error) {
                        console.log(data.error.code);
                        showSnackBar("Error purchasing items: " + data.error);
                    }
                    else {
                        showSnackBar("Your purchase was successful.");
                        initializeDisplayItems();
                        $("#mycart-modal input").each(function() {
                            $(this).val("");
                        })
                        $("#mycart-modal .close").click();
                    }
                },
                error: function(error) {
                    $("#mycart-modal .close").click();
                    showSnackBar("Error purchasing items.");
                    console.log("ERROR: ");
                    console.log(error);
                }
            });
        console.log(ids);
    });
});