# Wort Hafen

A place to catalogue the German words I have learnt

## Developer info

### Running locally

You can run the project locally with

```shell
yarn dev
```

### API

An OpenAPI document for the API can be found at http://localhost:3000/api/openapi.json.

You can see these as a Swagger UI page at http://localhost:3000/api-doc.

#### Auth

Many of the API endpoints require authentication. This can be achieved either by logging into the app, and then calling the APIs, or by using the client credentials flow.

In order to call the APIs when not logged in, you need an access token.
The flow to get this is as follows:

1. Log into the app as normal (E.g. login with Google)
2. Visit http://localhost:3000/api-doc and call the `/client-credentials` endpoint

   1. This will return a payload like:
      ```json
      {
        "clientId": "myUserId",
        "clientSecret": "some secret value"
      }
      ```

3. These credentials can now be used to retreive an access token with the API http://localhost:3000/api/token (or via the same Swagger UI page)
4. You can now make a request to an endpoint that required authentication, setting the `Authorization` header to be `"Bearer: <access_token>"`, and the request will be performed on behalf of the user that the access token was granted for.
