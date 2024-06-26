function submitToAPI() {
  var Namere = /[A-Za-z]{1}[A-Za-z]/;
  if (!Namere.test($('#name').val())) {
    alert('Name can not less than 2 char');
    return;
  }
  if ($('#season').val() == '') {
    alert('Please enter a season');
    return;
  }
  if ($('#from').val() == '') {
    alert('Please enter a from club');
    return;
  }
  if ($('#to').val() == '') {
    alert('Please enter a to club');
    return;
  }
  if ($('#value').val() == '') {
    alert('Please enter a value for the transfer');
    return;
  }
  if ($('#cost').val() == '') {
    alert('Please enter a cost for the transfer');
    return;
  }

  var name = $('#name').val();
  var season = $('#season').val();
  var from = $('#from').val();
  var to = $('#to').val();
  var value = $('#value').val();
  var cost = $('#cost').val();
  var data = {
    name: name,
    season: season,
    from: from,
    to: to,
    value: value,
    cost: cost
  };

  $.ajax({
    type: 'POST',
    url: '/transfers',
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

      $('#success-alert').show();
    },
    error: function () {
      // show an error message
      $('#fail-alert').show();
    }
  });
}

jQuery(function () {
  $('.add-transfer-button').on('click', function () {
    submitToAPI();
  });
});
