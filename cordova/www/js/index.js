$(document).ready(function() {
    $("#login-submit").click(function() {
        var uid = $("#login-uid").val();
        var pass = $("#login-pass").val();
        console.log("uid: " + uid + " pass: " + pass);
        $.ajax({
            url: "https://himalaya431.herokuapp.com/app/Users/" + uid + "/" + pass,
            type: "GET",
            processData : false,
            success: function(data){
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
        return false;
    });
});