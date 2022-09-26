# Example of Expo AuthSession

このリポジトリでは Expo の[AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)を使った[Authorization Code Flow with PKCE extension](https://tinyurl.com/2qm6xyh6)を実装したサンプルコードです。このリポジトリでは次のトピックスを扱います。

1. iOS/ Web での Expo AuthSession の実装
1. Facebook 認証
1. [Twitter OAuth2](https://developer.twitter.com/ja/docs/basics/authentication/api-reference/token)による認証
1. [Twitter 3-legged authorization](https://developer.twitter.com/ja/docs/basics/authentication/overview/3-legged-oauth)による認証(OAuth 1.0)

## Demo

https://user-images.githubusercontent.com/3320542/192200595-5546ab5c-4875-446e-9bbd-d3c2d93dc242.mov

## OAuth 2.0 for Browser-Based Apps

OAuth とはユーザーにリソースへの限定的なアクセスを許可するための仕組みのことで、Browser-based OAuth Flows ではこの処理をブラウザとたリダイレクト URI で行う。
OAuth ではプライバシーとセキュリティ保護をテーマに色々なプラクティスが考案されてきた。ここでは代表的な OAuth Flow である`Implicit Flow`と`Authorization Code Flow with PKCE extension`を前提に現在のベストプラクティスを説明する。

## 結論

1. 現在のベストプラクティスは`Authorization Code Flow with PKCE extension`
2. Public Client と認可サーバーとのやり取りには`state parameter`を使って CSRF 対策をしよう
3. リダイレクト URI は認可サーバーに登録されたものと厳密に一致させよう。Ex. 末尾に/があるかないかも含めてチェック！
4. フロントチャンネルでアクセストークンをやり取りしない！Implicit Flow は非推奨。 認可サーバーとのアクセストークンのやり取りは登録済みの Confidential client で行う！
5. 秘密鍵はフロントに出さない！

## キー概念

#### 3 つの主体

| 主体                | 概要                                                                                                                                                                              | 例                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 認可サーバー        | 自社のリソースへのアクセスを許可して API の口となるサーバー                                                                                                                       | Facebook               |
| Public Client       | ソースコードが公開されているユーザーのインターフェースとなるクライアント。秘密鍵を持つことは許されない。認可サーバーからの認可レスポンスを登録されたリダイレクト URI で受け取る。 | Web SPA/ Mobile アプリ |
| Confidential client | 認可サーバーに登録されたバックエンドサーバー。クライアント ID、秘密鍵、リダイレクト URI など登録された情報で認可サーバーと通信する                                                | バックエンド           |

#### 2 つのエンドポイント

| endpoints              | 概要                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization Endpoint | 認可サーバーが提供する認可 URL。操作しているユーザーにログイン認証 -> 権限の許可を求めるのがよくある流れ。ユーザーによる認可が完了したら Public Client に認可レスポンスを返す |
| Token Endpoint         | 認可コードをアクセストークンに交換するためのエンドポイント。Confidential client が認可サーバーとやり取りする                                                                  |

#### 2 つの代表的なデザインパターン

| Flow                                        | 概要                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implicit Flow                               | Authorization Endpoint からの認可レスポンスで Public Client が直接アクセストークンを受け取る。認可レスポンス横取り攻撃のため現在では非推奨となっている。                                                                                                |
| Authorization Code Flow with PKCE extension | 現在のベストプラクティス。Authorization Endpoint からの認可レスポンスで Public Client は短命の認可トークンを受け取り、それを Confidential client にわたす。Confidential client は認可サーバーの Token Endpoint に対してアクセストークンを発行してもらう |

図

#### 攻撃リスク

リダイレクト URI にアクセストークンを含むため、リダイレクト URI を横取りされたり、ブラウザ履歴から漏洩したり様々なリスクに晒されているため現在ではフロントチャンネルでアクセストークンを直接やり取りする Flow は非推奨となっている。

## Authorization Code Flow with PKCE extension

図

#### Implicit Flow との違い

- Implicit Flow にはない Token Endpoint が Flow に追加されている点。
- フロントチャンネルでは短命かつそれ自体ではリソースにアクセスできない認可コードを受け取る。
- 認可コードとアクセストークンの交換は、登録されたバックエンドサーバー(Confidential client)が秘密鍵と一緒に行い、フロントチャンネルでアクセストークンを露出させない。

#### PKCE による同一者証明(Proof Key for Code Exchange:ピクシー)

- `Authorization Endpoint`と`Token Endpoint`への実行が同一者によって行われたことを証明するための仕組み
- `codeChallenge`というランダムの文字列を生成して、Sha2 で`codeVerifier`に暗号化する。
- `Public Client`が`Authorization Endpoint`を叩くときに`codeChallenge`を URL に付与して、認可サーバーに実行者を認識してもらう。
- `Confidential client`が`Token Endpoint`を叩くときに`codeVerifier`を付与して、認可サーバーに`Authorization Endpoint`と同じ実行者がアクセストークンを要求していることを認識してもらう。
- 認可コードの横取り攻撃対策となっている。

#### 参考 URL

- OAuth 2.0 全フローの図解と動画
  https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f
- OAuth 2.0 for Browser-Based Apps
  https://datatracker.ietf.org/doc/html/draft-parecki-oauth-browser-based-apps
