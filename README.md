### 日本語 version は[こちら](https://github.com/Minminzei/expo-authsession-authcodeflow/blob/main/README.ja.md)

# Example of Expo AuthSession

This repository is sample code for OAuth authorization flow([Authorization Code Flow with PKCE extension](https://tinyurl.com/2qm6xyh6)) By [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/).
This repository covers below topics.

1. Expo AuthSession on iOS and Web
1. Facebook OAuth
1. Twitter OAuth 2.0 ([Twitter OAuth2](https://developer.twitter.com/en/docs/basics/authentication/api-reference/token))
1. Twitter OAuth 1-0a ([Twitter 3-legged authorization](https://developer.twitter.com/en/docs/basics/authentication/overview/3-legged-oauth))

## Index

1. [Demo](#demo)
1. [Conclusion](#conclusion)
1. [Glossary and Key Concept](#glossary)
1. [Implicit Flow](#implicit-flow)
1. [Authorization Code Flow with PKCE extension](#authorization-code)
1. [Build Environmental](#build)

<a id="demo"></a>

## Demo

https://user-images.githubusercontent.com/3320542/192200595-5546ab5c-4875-446e-9bbd-d3c2d93dc242.mov

## Browser-based OAuth and Authorization Code Flow with PKCE extension

OAuth is all about enabling users to grant limited access to applications, and Browser-based OAuth Flows processes these flow by browser and redirect uri.
Historically, OAuth is always subject to privacy and security, so many practices have been considered by OSS.

<a id="conclusion"></a>

## Conclusion

1. Current best practice is `Authorization Code Flow with PKCE extension`(2022).
2. Process between Public Client and Authorization Server should be protected by `state parameters` against CSRF attack.
3. Redirect URI should be exact match between registered on Authorization Server and Public/ Confidential client.
4. Access tokens should not be exposed in the front channel. So `Implicit Flow` is not recommended.

<a id="glossary"></a>

## Glossary and Key Concept

### Three Players

| Player               | Descrioption                                                                                                                                                                                                                                           | Example              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Authorization Server | Authorization Server asks resource owner for authorization of access their resource to developer.                                                                                                                                                      | Facebook             |
| Public Client        | Public Client is User Interface which source code is readable. So Public Client must not have secret credential. Public Client request to Authorization Server for authorization of API access, and receive `Authorization Response` via Redirect Uri. | Web SPA/ Mobile Apps |
| Confidential Client  | Confidential Client is backend server registered on Authorization Server, and has such info as client-id, client secret, permitted redirect uri and so on. Confidential Client requests Authorization Server for `Access Token`.                       | Your backend server  |

### Two endpoints

| endpoints              | Descrioption                                                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization Endpoint | Authorization Server asks user for authorizing to access their resource by developer and then return user's answer(`Authorization Response`) such as `Authorization Code` to Puclic Client.                                                    |
| Token Endpoint         | Confidential Client requests Authorization Server to exchange `Authorization Code` for `Access Token` with registered credential info. After verify request, Authorization Server return `Access Token` to Confidential client by Redirect URI |

### Two well known Flows

| Pattern                                     | Descrioption                                                                                        | Recommended |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------- |
| Implicit Flow                               | Flow such as Puclic Client requests and recieves directly `Access Token` by Authorization Server.   | No          |
| Authorization Code Flow with PKCE extension | Used by both confidential and public clients to exchange an authorization code for an access token. | Yes         |

<a id="implicit-flow"></a>

## Implicit Flow

![Implicit Flow](https://user-images.githubusercontent.com/3320542/192437986-078370a7-87ec-45cd-97c9-05ff0c6d927b.jpg)

### security risk of Implicit Flow

- [Interception of the Redirect URI](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.1)
- [Access Token Leak in Browser History](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.2)
- [Manipulation of Scripts](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.3)
- [Access Token Leak to Third Party Scripts](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.4)

<a id="authorization-code"></a>

## Authorization Code Flow with PKCE extension

![Auth Code](https://user-images.githubusercontent.com/3320542/192439518-0b3692bb-ef2e-4962-aace-5e37d89c15b4.jpg)

### what is difference from `Implicit Flow`?

- `Authorization Code Flow with PKCE extension` has `Token Endpoint` which `Implicit Flow` dosen't have.
- `Front Channel(Public Client)` get `Authorization Code` which doesn't work by itself only.
- `Confidential client(your registered backend server)` exchanges `Authorization Code` for `Access Token` with Secret Key and PKCE. That is how your service dosen't expose access token in front cahnnel.

### use PKCE(Proof Key for Code Exchange)

1. PKCE is specification for verification that Both `Authorization Endpoint` and `Token Endpoint` are requested by same service.
2. `Public Client` generates random strings as `codeChallenge`, and make hash of it to `codeVerifier` by S256 algorithm.
3. `Public Client` requests `Authorization Endpoint` with `codeChallenge`. That is how `Authorization Server` recognizes Who requested.
4. `Confidential Client` requests `Token Endpoint` with `codeVerifier`. That is how `Authorization Server` recognizes same service requested.
5. That is how oauth is protected against introspection of Authorization Response.

## Reference

- [The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
- [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps)

<a id="build"></a>

## Build Development Environmental

### Register Confidential/ Public Client

1. signup expo and get account name<br />
   https://expo.dev/

2. twitter dev > User authentication settings<br />
   https://developer.twitter.com/<br />
   Register Redirect URIs `https://auth.expo.io/@{Expo Account Name}/expo-authsession-authcodeflow`, `https://localhost:19006/twitterOAuth2`, `https://localhost:19006/`
   ![Twitter](https://user-images.githubusercontent.com/3320542/192583059-109e69e7-9b8b-454c-a2fe-dcd49ec06418.png)

3. facebook dev > Facebook Login setting<br />
   https://developers.facebook.com/<br />
   Register Redirect URIs `https://auth.expo.io/@{Expo Account Name}/expo-authsession-authcodeflow`, `https://localhost:19006/`
   ![Facebook](https://user-images.githubusercontent.com/3320542/192582412-615e4dbf-11ca-4164-970f-b46f3d407e17.png)

### create .env and set credential info

```
cp .env.sample .env
### you get credential info at Authorization Server(Twitter/ Facebook), and write them in .env
```

### build local environmental

```
### clone source
git clone git@github.com:Minminzei/expo-authsession-authcodeflow.git
cd expo-authsession-authcodeflow
yarn

### docker
docker-compose up -d
docker-compose exec app bash
yarn server

### simulatar
yarn ios
yarn web
```
