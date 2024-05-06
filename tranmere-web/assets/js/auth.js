import AmazonCognitoIdentity from 'amazon-cognito-auth-js';

jQuery(function () {
  var authData = {
    ClientId: '3civek6bpngorkivrntf5ai4ro',
    AppWebDomain: 'auth.tranmere-web.com',
    TokenScopesArray: ['TranmereWeb/matches.read'],
    RedirectUriSignIn: 'https://www.tranmere-web.com/',
    RedirectUriSignOut: 'https://www.tranmere-web.com/',
    UserPoolId: 'eu-west-1_GAF4md6wn'
  };
  var auth = new AmazonCognitoIdentity.CognitoAuth(authData);
  window.auth = auth;
  auth.userhandler = {
    onSuccess: function () {
      $('#loginout').html('Sign Out');
      auth.setState('signedIn');
      $('.edit').show();
    },
    onFailure: function (err) {
      alert('Error!' + err);
    }
  };
  if (
    auth.storage[
      'CognitoIdentityServiceProvider.3civek6bpngorkivrntf5ai4ro.LastAuthUser'
    ]
  ) {
    $('.edit').show();
    auth.getSession();
  }
  $(document).on('click', '#loginout', function () {
    if ($('#loginout').html() === 'Sign Out') {
      auth.signOut();
      $('#loginout').html('Sign In');
    } else {
      auth.getSession();
    }
  });
  auth.parseCognitoWebResponse(window.location.href);
});
