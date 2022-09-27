# Example of Expo AuthSession

このリポジトリは Expo の[AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)を使った[Authorization Code Flow with PKCE extension](https://tinyurl.com/2qm6xyh6)を実装したサンプルコードです。このリポジトリでは次のトピックスを扱います。

1. iOS/ Web での Expo AuthSession の実装
1. Facebook 認証
1. [Twitter OAuth2](https://developer.twitter.com/ja/docs/basics/authentication/api-reference/token)による認証
1. [Twitter 3-legged authorization](https://developer.twitter.com/ja/docs/basics/authentication/overview/3-legged-oauth)による認証(Twitter OAuth 1-0a)

## 目次

1. [Demo](#demo)
1. [結論](#conclusion)
1. [キー概念](#glossary)
1. [Implicit Flow](#implicit-flow)
1. [Authorization Code Flow with PKCE extension](#authorization-code)
1. [環境構築](#build)

<a id="demo"></a>

## Demo

https://user-images.githubusercontent.com/3320542/192200595-5546ab5c-4875-446e-9bbd-d3c2d93dc242.mov

## OAuth 2.0 for Browser-Based Apps

OAuth とはユーザーにリソースへの限定的なアクセスを許可するための仕組みのことで、Browser-based OAuth Flows ではこの処理をブラウザとリダイレクト URI を使って行います。
OAuth ではプライバシーとセキュリティ保護をテーマに色々なプラクティスが考案されてきました。ここでは代表的な OAuth Flow である`Implicit Flow`と`Authorization Code Flow with PKCE extension`を題材に現在のベストプラクティスを説明します。

<a id="conclusion"></a>

## 結論

1. 現在のベストプラクティスは`Authorization Code Flow with PKCE extension`
2. Public Client と認可サーバーとのやり取りには`state parameter`を使って CSRF 対策をしよう
3. リダイレクト URI は認可サーバーに登録されたものと厳密に一致させよう。Ex. 末尾に/があるかないかも含めてチェック！
4. フロントチャンネルでアクセストークンをやり取りしない！なので Implicit Flow は非推奨。 認可サーバーとのアクセストークンのやり取りは登録済みの Confidential client で行う！
5. 秘密鍵はフロントに出さない！

<a id="glossary"></a>

## キー概念

#### 3 つの主体

| 主体                 | 概要                                                                                                                                                                                   | 例                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Authorization Server | ユーザーに developer によるリソースへのアクセスを許可するかを確認し、アクセストークンを発行する。認可サーバーに登録された Public/ Confidential Client 以外からのリクエストを拒否する。 | Facebook               |
| Public Client        | ソースコードが公開されているユーザーのインターフェースとなるクライアント。秘密鍵を持つことは許されない。認可サーバーからの認可レスポンスを登録されたリダイレクト URI で受け取る。      | Web SPA/ Mobile アプリ |
| Confidential Client  | 認可サーバーに登録されたバックエンドサーバー。クライアント ID、秘密鍵、リダイレクト URI など登録された情報で認可サーバーにアクセストークンを要求する。                                 | バックエンド           |

#### 2 つのエンドポイント

| endpoints              | 概要                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization Endpoint | 認可サーバーが提供するユーザーの認可を求めるためのエンドポイント。操作しているユーザーにログイン認証 -> 権限の認可を求めるのがよくある流れ。ユーザーによる認可が完了したら Public Client に認可レスポンスをリダイレクトする。 |
| Token Endpoint         | 認可レスポンスで受け取った認可コードをアクセストークンに交換するためのエンドポイント。Confidential client が認可サーバーとやり取りする。認可コード単体では何の効果もない。                                                    |

#### 2 つの代表的な Flow

| Flow                                        | 概要                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Implicit Flow                               | Authorization Endpoint からの認可レスポンスで Public Client が直接アクセストークンを受け取る。認可レスポンス横取り攻撃のため現在では非推奨となっている。                                                                                                                                                                                   |
| Authorization Code Flow with PKCE extension | 現在のベストプラクティス。Authorization Endpoint からの認可レスポンスで Public Client は短命の認可コードを受け取り、それを Confidential client にわたす。Confidential client は認可サーバーの Token Endpoint に対して認可コードを使ってアクセストークンを発行してもらう。この際、登録情報や秘密鍵、PKCE を使ってセキュアな発行要求をする。 |

<a id="implicit-flow"></a>

## Implicit Flow

![Implicit Flow](https://user-images.githubusercontent.com/3320542/192438739-b9409a67-66bb-4dd8-86a3-e17eb954d4e7.jpg)

#### Implicit Flow の攻撃リスク

フロントチャンネルでやり取りされるリダイレクト URI にアクセストークンを含むため、リダイレクト URI を横取りされたり、ブラウザ履歴から漏洩したりと様々なリスクに晒されています。そのため現在ではフロントチャンネルでアクセストークンを直接やり取りする Inplicit Flow は非推奨となっています。

- [Interception of the Redirect URI](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.1)
- [Access Token Leak in Browser History](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.2)
- [Manipulation of Scripts](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.3)
- [Access Token Leak to Third Party Scripts](https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps#section-9.8.4)

<a id="authorization-code"></a>

## Authorization Code Flow with PKCE extension

![Auth Code](https://user-images.githubusercontent.com/3320542/192438730-6838d106-8031-4a8d-bc0b-216f8be8cae6.jpg)

#### Implicit Flow との違い

- Implicit Flow にはない Token Endpoint が Flow に追加されている。
- フロントチャンネルでは短命かつそれ自体ではリソースにアクセスできない認可コードを受け取る。
- 認可コードとアクセストークンの交換は、登録されたバックエンドサーバー(Confidential client)が秘密鍵などと一緒に行い、フロントチャンネルでアクセストークンを露出させない。

#### PKCE による同一者証明(Proof Key for Code Exchange:ピクシー)

1. `Authorization Endpoint`と`Token Endpoint`への実行が同一者によって行われたことを証明するための仕組み。
2. `codeChallenge`というランダムの文字列を`Public Client`で生成して、Sha-2 アルゴリズム で`codeVerifier`にハッシュ化する。[注]`Confidential Client`で発行すべきとの意見もあります。
3. `Public Client`が`Authorization Endpoint`を叩くときに`codeChallenge`を URL に付与して、認可サーバーに実行者を認識してもらう。
4. `Confidential Client`が`Token Endpoint`を叩くときに`codeVerifier`を付与して、認可サーバーに`Authorization Endpoint`と同じ実行者がアクセストークンを要求していることを認識してもらう。
5. これにより認可コードの横取り攻撃対策となっている。

## 参考 URL

- OAuth 2.0 全フローの図解と動画
  https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f
- OAuth 2.0 for Browser-Based Apps
  https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps

<a id="build"></a>

## 環境構築

### Authorization Server に Confidential/ Public Client を登録する

1. expo にサインアップして、アカウント名を取得<br />
   https://expo.dev/

2. twitter dev > User authentication settings<br />
   https://developer.twitter.com/<br />
   リダイレクト URI を登録 `https://auth.expo.io/@{Expo Account Name}/expo-authsession-authcodeflow`, `https://localhost:19006/twitterOAuth2`, `https://localhost:19006/`
   ![Twitter](https://user-images.githubusercontent.com/3320542/192583059-109e69e7-9b8b-454c-a2fe-dcd49ec06418.png)

3. facebook dev > Facebook Login setting<br />
   https://developers.facebook.com/<br />
   リダイレクト URI を登録 `https://auth.expo.io/@{Expo Account Name}/expo-authsession-authcodeflow`, `https://localhost:19006/`
   ![Facebook](https://user-images.githubusercontent.com/3320542/192582412-615e4dbf-11ca-4164-970f-b46f3d407e17.png)

### .env に credential 情報を記載

```
cp .env.sample .env
### you get credential info at Authorization Server(Twitter/ Facebook), and write them in .env
```

### ローカル環境構築

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
