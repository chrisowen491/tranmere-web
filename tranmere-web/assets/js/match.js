function submitToAPI() {

   var programme = $("#programme").val();
   var attendance = $("#attendance").val();
   var youtube = $("#youtube").val();
   var data = {
      programme : programme,
      attendance : attendance,
      youtube : youtube
    };

   $.ajax({
     type: "POST",
     dataType: "json",
     crossDomain: "true",
     contentType: "application/json; charset=utf-8",
     data: JSON.stringify(data),
     headers: {
        "Authorization": window.auth.getSession().getAccessToken().getJwtToken()
     },
     success: function () {
        alert('success')
     },
     error: function () {
        alert('fail')
     }});
 }