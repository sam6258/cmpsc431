$(document).ready(function() {
    var currentUser = null;
    var currentlyDisplayedItems = null;
    var currentlyDisplayedItemsJSON = null;
    var shoppingCart = [];
    initializeDisplayItems();
    $(".vendor-element").hide();
    $("#login-submit").click(function() {
        uid = $("#login-uid").val();
        var pass = $("#login-pass").val();
        var userObj = {
            "uid": uid,
            "password": pass
        };
        console.log("uid: " + uid + " pass: " + pass);
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
        var userObj = {
            "uid": uid,
            "password": pass
        };
        console.log("uid: " + uid + " pass: " + pass);
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
                    alert("Sign up error. Please try again.");
                    uid = null;
                }
                else {
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

    $("#vendor-add-submit").click(function() {
        var price = $("#vendor-add-price").val();
        var location = $("#vendor-add-location").val();
        var description = $("#vendor-add-description").val();
        var url = $("#vendor-add-url").val();

        if (price.length == 0) {
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
        else {
            var postItemObj = {
                "vendorID": uid,
                "price": price,
                "location": location,
                "description": description,
                "url": url
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
                    console.log(data);
                    if (data.error) {
                        alert("Item couldn't be added.");
                    }
                    else {
                        $("#vendor-add-price").val("");
                        $("#vendor-add-location").val("");
                        $("#vendor-add-description").val("");
                        $("#vendor-add-url").val("");
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
                console.log(data);
                if (!data.error) {
                    currentlyDisplayedItems = data;
                    var itemsObj = {
                        "itemIDs": currentlyDisplayedItems
                    }
                    console.log(itemsObj);
                    $.ajax({
                        url: "https://himalaya431.herokuapp.com/app/Items",
                        type: "POST",
                        data: JSON.stringify(itemsObj),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Content-Type', 'application/json');
                        },
                        crossDomain: true,
                        success: function(data){
                            console.log("Setting within success");
                            console.log(data);
                            if (!data.error) {
                                currentlyDisplayedItemsJSON = data;
                                console.log(data);
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
                console.log(data);
                if (!data.error) {
                    console.log(data);
                    currentlyDisplayedItems = data;
                    var itemsObj = {
                        "itemIDs": currentlyDisplayedItems
                    }
                    $.ajax({
                        url: "https://himalaya431.herokuapp.com/app/Items",
                        type: "POST",
                        data: JSON.stringify(itemsObj),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Content-Type', 'application/json');
                        },
                        crossDomain: true,
                        success: function(data){
                            console.log(data);
                            if (!data.error) {
                                currentlyDisplayedItemsJSON = data;
                                console.log(data);
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
        var items = currentlyDisplayedItemsJSON;
        console.log("resetting");
        console.log(items);

        for (var i = 0; i < items.length; i++)
        {
            if (i % 3 == 0) {
                var newRow = '<div class="row"></div>';
                $("#sale-items").append(newRow);

            }
            
            var appendTo = $("#sale-items .row").last();
            var newItem =   '<div item-id="' + items[i].itemID +'" price="' + items[i].price + ' name="' + items[i].name + '" description="' + items[i].description + '" class="span3">' + 
                                '<div class="thumbnail">' + 
                                    '<img style="max-width: 250px" src="' + items[i].url + '" alt=""/>' +
                                    '<div class="caption">' +
                                        '<h5>' + items[i].name + '</h5>' +
                                        '<p>' + items[i].description + '</p>' + 
                                        '<h4 style="text-align:center"><a class="btn"> <i class="icon-zoom-in"></i></a> <a class="btn cart-btn">Add to <i class="icon-shopping-cart"></i></a> <a class="btn btn-primary price-btn">$' + items[i].price + '</a></h4>' + 
                                    '</div>' + 
                                '</div>' +
                            '</div>';
            appendTo.append(newItem);
        }

        $(".cart-btn").click(function() {
            console.log($(this));
            var parent = $(this).closest(".span3");
            var priceBtn = 
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
                console.log(shoppingCart[i].cost);
                sum += parseFloat(shoppingCart[i].cost);
            }   
            $(".cart-cost").each(function() {
                var formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                });
                $(this).html(formatter.format(sum));
            });

            var x = document.getElementById("snackbar")

            // Add the "show" class to DIV
            x.className = "show";

            // After 3 seconds, remove the show class from DIV
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        });
    }
});