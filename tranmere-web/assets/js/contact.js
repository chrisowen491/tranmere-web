function submitToAPI() {

  var Namere = /[A-Za-z]{1}[A-Za-z]/;
  if (!Namere.test($("#name").val())) {
                alert ("Name can not less than 2 char");
      return;
  }
  if ($("#email").val()=="") {
      alert ("Please enter your email id");
      return;
  }

  var reeamil = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
  if (!reeamil.test($("#email").val())) {
      alert ("Please enter valid email address");
      return;
  }

  var name = $("#name").val();
  var email = $("#email").val();
  var desc = $("#message").val();
  var data = {
    name : name,
    email : email,
    desc : desc
  };

  $.ajax({
    type: "POST",
    url : "/contact-us",
    dataType: "json",
    crossDomain: "true",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),

    success: function () {
      // clear form and show a success message
      $("#contact-form").hide();
      $("#success-alert").show();
    },
    error: function () {
      // show an error message
      $("#fail-alert").show();
    }});
 }