# app-staffing-api

Backend for https://github.com/bitovi/app-staffing/

## Run Application

```sh
docker compose up --build
```

## Connect to the Docker app's shell

```sh
docker compose exec api bash
```

## Testing

The migrations need to run before you'll be able to debug the tests. Run `npm test` and all of your dreams will come true.

## Setting up Google Auth

https://developers.google.com/identity/sign-in/web/sign-in

Create authorization credentials
Any application that uses OAuth 2.0 to access Google APIs must have authorization credentials that identify the application to Google's OAuth 2.0 server. The following steps explain how to create credentials for your project. Your applications can then use the credentials to access APIs that you have enabled for that project.

1. Go to the Credentials page.
2. Click Create credentials > OAuth client ID.
3. From the dropdown, select the Web application application type.
4. Name your OAuth 2.0 client

5. Under the Authorized JavaScript origins put in the development (localhost) URL you plan to use

- http://localhost:3000, or http://localhost:8080, or similar

6. Click Create

7. You will get presented with a Client Id and Client Secret

- Record them somewhere, you will need at least the Client Id for the frontend and backend configuration

8. You will need to insert your Client ID into the backend service, somehow.

- Environment? Hardcode? Future developers can figure it out!
- This value is needed for the OAuth2Client creation and the verifyIdToken method

9. You will need to insert your Client Id into the frontend service, somehow.

- Environment? Hardcode? Future developers can figure it out!
- This value must be set in the index.html in a meta tag, per the Google Auth API Docs: <meta name="google-signin-client_id" content="CLIENT_ID">
- You can read this value in your JS code to only have it configured in one place

Serverside Code Example:

```js
const { OAuth2Client } = require("google-auth-library");
fastify.register(require("fastify-auth"));

const GoogleAuthClientId = "CLIENT_ID";

fastify.decorate("asyncValidateGoogleAuth", async function (request, reply) {
  const { authorization } = request.headers;

  if (!authorization) {
    throw createError(401);
  }

  if (!request.state) {
    request.state = {};
  }

  const tokenId = authorization.replace("Bearer ", "");
  const client = new OAuth2Client(GoogleAuthClientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GoogleAuthClientId,
    });
    const payload = ticket.getPayload();
    request.state.user = payload;
  } catch (err) {
    console.error(err);
    throw createError(401);
  }
});

fastify.after(() => {
  fastify.addHook(
    "preHandler",
    fastify.auth([fastify.asyncValidateGoogleAuth])
  );
});
```

Clientside React Hook for Google Auth:

```js
import { useEffect, useState } from "react";

const useGoogleAuth = (gapi) => {
  if (!gapi) {
    gapi = window.gapi;
  }

  const [GoogleAuth, setGoogleAuth] = useState(null);
  const [GoogleUser, setGoogleUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const googleSigninElements = document.getElementsByName(
      "google-signin-client_id"
    );
    if (googleSigninElements.length !== 1) {
      throw new Error("Invalid Client Id Setup");
    }

    const client_id = googleSigninElements[0].content;

    gapi.load("auth2", () => {
      gapi.auth2
        .init({ client_id: client_id })
        .then((ga) => {
          setGoogleAuth(ga);
        })
        .catch((err) => {
          setError(err);
        });
    });
  });

  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      setGoogleUser(null);
    });
  }

  function signIn() {
    GoogleAuth.signIn({ prompt: "none" })
      .then((GoogleUser) => {
        setGoogleUser(GoogleUser);
      })
      .catch((err) => {
        setError(err);
      });
  }

  const authResponse = GoogleUser ? GoogleUser.getAuthResponse() : GoogleUser;

  return {
    signIn,
    signOut,
    authResponse,
    token: authResponse?.id_token,
    error,
  };
};

export default useGoogleAuth;
```
