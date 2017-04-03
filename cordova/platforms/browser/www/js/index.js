
$( document ).ready(function() {
    console.log( "ready!" );
});

/*
$(document).ready(function() {
    console.log("here");
    
    $("#login-submit").submit(function() {
        var uid = $("#login-uid").val();
        var pass = $("#login-pass").val();
        console.log("uid: " + uid + " pass: " + pass);
        $.ajax({
            url: "https://himalaya431.herokuapp.com/app/Users/" + uid + "/" + pass,
            type: "GET",
            processData : false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            },
            success: function(data){
                data = JSON.parse(data);
                if (data.length > 0) {
                    alert("You have logged in successfully");
                }
                else {
                    alert("Incorrect login. Please try again.");
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
});*/