# Auth0 administrator permissions

Tranmere-Web authorizes archive administrators with the Auth0 role
`Archive administrator`. An email address is not an authorization credential.

## Auth0 configuration

1. Create an `Archive administrator` role under **User Management → Roles**.
2. Assign the role only to trusted administrators.
3. Add the following Post Login Action to the Login flow. This copies the roles
   Auth0 calculated for the login into the ID token used by the site session.

```js
exports.onExecutePostLogin = async (event, api) => {
  const claim = 'https://www.tranmere-web.com/roles';
  const roles = event.authorization?.roles || [];
  api.idToken.setCustomClaim(claim, roles);
};
```

The Action must run for the primary application login. After changing a role
assignment, the user must sign out and sign in again to refresh the claim in
their session.

`AUTH0_ADMIN_EMAIL` remains the destination for site contact messages; it no
longer grants access to administrator pages or APIs.
