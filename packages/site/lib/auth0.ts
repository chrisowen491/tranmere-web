import {
  Auth0Client,
  filterDefaultIdTokenClaims,
} from "@auth0/nextjs-auth0/server";

const usernameClaim = "https://www.tranmere-web.com/username";

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session) => ({
    ...session,
    user: {
      ...filterDefaultIdTokenClaims(session.user),
      ...(typeof session.user[usernameClaim] === "string"
        ? { [usernameClaim]: session.user[usernameClaim] }
        : {}),
      ...(typeof session.user.username === "string"
        ? { username: session.user.username }
        : {}),
      ...(typeof session.user.preferred_username === "string"
        ? { preferred_username: session.user.preferred_username }
        : {}),
    },
  }),
});
