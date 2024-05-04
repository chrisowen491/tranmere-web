function submitToAPI() {
  var Namere = /[A-Za-z]{1}[A-Za-z]/;
  if (!Namere.test($('#linkname').val())) {
    alert('Name can not less than 2 char');
    return;
  }
  if ($('#link').val() == '') {
    alert('Please enter a link');
    return;
  }
  if ($('#linkdescription').val() == '') {
    alert('Please enter a description');
    return;
  }

  var linkname = $('#linkname').val();
  var link = $('#link').val();
  var description = $('#linkdescription').val();
  var data = {
    name: linkname,
    description: description,
    link: link
  };

  $.ajax({
    type: 'POST',
    url: '/links',
    dataType: 'json',
    crossDomain: 'true',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data),
    headers: {
      Authorization: window.auth
        .getCachedSession()
        .getAccessToken()
        .getJwtToken()
    },
    success: function () {
      // clear form and show a success message
      $('#link-success-alert').show();
    },
    error: function () {
      // show an error message
      $('#link-fail-alert').show();
    }
  });
}

jQuery(function () {
  $('.add-link-button').on('click', function () {
    submitToAPI();
  });
});
