### 日本語 version は[こちら](https://github.com/Minminzei/expo-authsession-authcodeflow/blob/main/README.ja.md)

# Example of Expo AuthSession

This repository is sample code for OAuth authorization flow([Authorization Code Flow with PKCE extension](https://tinyurl.com/2qm6xyh6)) By [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/).
This repository covers below topics.

1. Expo AuthSession on iOS and Web
1. Facebook OAuth
1. Twitter OAuth 2.0 ([Twitter OAuth2](https://developer.twitter.com/en/docs/basics/authentication/api-reference/token))
1. Twitter OAuth 1-0a ([Twitter 3-legged authorization](https://developer.twitter.com/en/docs/basics/authentication/overview/3-legged-oauth))

## Demo

https://user-images.githubusercontent.com/3320542/192200595-5546ab5c-4875-446e-9bbd-d3c2d93dc242.mov

## Browser-based OAuth and Authorization Code Flow with PKCE extension

OAuth is all about enabling users to grant limited access to applications, and Browser-based OAuth Flows processes these flow by browser and redirect uri.
Historically, OAuth is always subject to privacy and security, so many practices have been considered by OSS.

## Conclusion

1. Current best practice is `Authorization Code Flow with PKCE extension`(2022 year).
2. Process between Public Client and Authorization Server should be protected by `state parameters` against CSRF attack.
3. Redirect URI should be exact match between registered on Authorization Server and Public/ Confidential client.
4. Access tokens should not be exposed in the front channel. So `Implicit Flow` is not recommended.

## Glossary and Key Concept

### 3 Players

| Player               | Descrioption | Example              |
| -------------------- | ------------ | -------------------- |
| Authorization Server |              | Facebook             |
| Public Client        |              | Web SPA/ Mobile Apps |
| Confidential client  |              | Your backend server  |

### 2 endpoints

| endpoints              | Descrioption |
| ---------------------- | ------------ |
| Authorization Endpoint |              |
| Token Endpoint         |              |

### 2 Representive Flow

| Pattern                                     | Descrioption | Recommended |
| ------------------------------------------- | ------------ | ----------- |
| Implicit Flow                               |              | No          |
| Authorization Code Flow with PKCE extension |              | Yes         |

## Implicit Flow

[figure]

### security risk of Implicit Flow

- [Interception of the Redirect URI](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.1)
- [Access Token Leak in Browser History](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.2)
- [Manipulation of Scripts](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.3)
- [Access Token Leak to Third Party Scripts](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.4)

## Authorization Code Flow with PKCE extension

[figure]

### what is difference from `Implicit Flow`?

- `Authorization Code Flow with PKCE extension` has `Token Endpoint` which `Implicit Flow` dosen't have.
- `Front Channel(Public Client)` get `Authorization Code` which doesn't work by itself only.
- `Confidential client(your registered backend server)` exchanges `Authorization Code` to `Access Token` with Secret Key and PKCE. That is how your service dosen't expose access token in front cahnnel.

### use PKCE(Proof Key for Code Exchange)

1. PKCE is specification what verifies same app request `Authorization Endpoint` and `Token Endpoint`.
2. `Public Client` generates random strings as `codeChallenge`, and encrypt it to `codeVerifier` by S256 algorithm.
3. `Public Client` requests `Authorization Endpoint` with `codeChallenge`. That is how `Authorization Server` recognizes Who requested.
4. `Confidential Client` requests `Token Endpoint` with `codeVerifier`. That is how `Authorization Server` recognizes request of `Authorization Endpoint` and `Token Endpoint` by same app.
5. That is how oauth is protected against introspection of Authorization Response.

## Reference

- [The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
- [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps)
