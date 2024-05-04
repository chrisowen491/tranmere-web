var urlParams = new URLSearchParams(window.location.search);

function submitToAPI() {
  if ($('#scorer').val() == '') {
    alert('Please enter a scorer');
    return;
  }
  if ($('#date').val() == '') {
    alert('Please enter a date');
    return;
  }
  if ($('#minute').val() == '') {
    alert('Please enter a minute');
    return;
  }
  if ($('#opposition').val() == '') {
    alert('Please enter an opposition');
    return;
  }
  var data = {
    Scorer: $('#scorer').val(),
    Date: $('#date').val(),
    Opposition: $('#opposition').val(),
    Assist: $('#assist').val(),
    Minute: $('#minute').val(),
    GoalType: $('#goalType').val(),
    AssistType: $('#assistType').val()
  };

  $.ajax({
    type: 'POST',
    url: '/goal/' + urlParams.get('season') + '/' + urlParams.get('id'),
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

      $('#goal-success-alert').show();
    },
    error: function () {
      // show an error message
      $('#goal-fail-alert').show();
    }
  });
}

jQuery(function () {
  if (urlParams.get('season') && urlParams.get('id')) {
    $.ajax({
      type: 'GET',
      url: '/goal/' + urlParams.get('season') + '/' + urlParams.get('id'),
      crossDomain: 'true',
      success: function (data) {
        $('#scorer').val(data.Scorer);
        $('#date').val(data.Date);
        $('#opposition').val(data.Opposition);
        $('#assist').val(data.Assist);
        $('#minute').val(data.Minute);
        $('#goalType').val(data.GoalType);
        $('#assistType').val(data.AssistsType);
      }
    });
  }

  $('.update-goal-button').on('click', function () {
    submitToAPI();
  });
});
