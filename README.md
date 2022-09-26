### 日本語 version は[こちら](https://github.com/Minminzei/expo-authsession-authcodeflow/README.ja.md)

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

OAuth is all about enabling users to grant limited access to applications, and Browser-based OAuth Flows process these flow by browser and redirect uri.
OAuth is always subject to privacy and security, and current best practice is `Authorization Code Flow with PKCE extension`.

## Conclusion

1. Current best practice is `Authorization Code Flow with PKCE extension`.
2. process between Public Client and Authorization Server should be protected by `state parameters` against CSRF attack.
3. Redirect URI should be exact match between registered on Authorization Server and Public/ Confidential client.
4. Access tokens should be not exposed in in the front channel. So `Implicit Flow` is not recommended.

## Glossary and Key Concept

### 3 Players

| Player               | Descrioption | Example              |
| -------------------- | ------------ | -------------------- |
| Authorization Server |              | Facebook             |
| Public Client        |              | Web SPA/ Mobile Apps |
| Confidential client  |              | Your backend server  |

### 2 endpoints

| endpoints                                   | Descrioption |
| ------------------------------------------- | ------------ |
| Authorization Endpoint                      |              |
| Authorization Code Flow with PKCE extension |              |

### 2 design patterns

| Pattern        | Descrioption | Recommended |
| -------------- | ------------ | ----------- |
| Implicit Flow  |              | No          |
| Token Endpoint |              | Yes         |

## Implicit Flow

[figure]

### security risk

## Authorization Code Flow with PKCE extension

[figure]

### what is difference from `Implicit Flow`?

### use PKCE

## Reference

- The OAuth 2.0 Authorization Framework
  https://www.rfc-editor.org/rfc/rfc6749
- Proof Key for Code Exchange by OAuth Public Clients
  https://datatracker.ietf.org/doc/html/rfc7636
- OAuth 2.0 for Browser-Based Apps
  https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps
