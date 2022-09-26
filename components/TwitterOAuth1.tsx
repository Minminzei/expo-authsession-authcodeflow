import React from "react";
import { Button, Platform } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, startAsync } from "expo-auth-session";
import {
  UserData,
  twitterRequestToken,
  twitterOAuth1AccessToken,
} from "@hooks/oauth";
import * as qs from "query-string";
import * as _ from "lodash";

WebBrowser.maybeCompleteAuthSession();

export default function TwitterOAuth1({
  onError,
  onSuccess,
}: {
  onError: (message: string) => void;
  onSuccess: (user: UserData) => void;
}) {
  const redirectUri = makeRedirectUri({
    useProxy: Platform.select({ web: false, default: true }),
  });

  // I don't know why, but startAsync dosen't work on Web. So we use WebBrowser for Twitter OAuth.
  async function linkTwitterForWeb(): Promise<void> {
    try {
      // Step1. POST oauth/request_token
      const requestToken = await twitterRequestToken(redirectUri);

      // Step2. GET oauth/authorize
      const authResponse = await WebBrowser.openAuthSessionAsync(
        `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`
      );

      if (authResponse.type !== "success") {
        return;
      }

      const path = _.last(authResponse.url.split("?"));
      if (path) {
        const { oauth_token, oauth_verifier } = qs.parse(path);
        if (!oauth_token || !oauth_verifier) {
          return;
        }
        // Step3. POST oauth/access_token
        const user = await twitterOAuth1AccessToken({
          tokenCode: oauth_token as string,
          codeVerifier: oauth_verifier as string,
          redirectUri,
        });
        onSuccess(user);
      }
      WebBrowser.dismissAuthSession();
    } catch (e: any) {
      onError(e.message);
    }
  }

  async function linkTwitterForMobile(): Promise<void> {
    try {
      // Step1. POST oauth/request_token
      const requestToken = await twitterRequestToken(redirectUri);

      // Step2. GET oauth/authorize
      const authResponse = await startAsync({
        authUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`,
      });

      if (authResponse.type !== "success") {
        return;
      }

      // Step3. POST oauth/access_token
      const user = await twitterOAuth1AccessToken({
        tokenCode: authResponse.params.oauth_token,
        codeVerifier: authResponse.params.oauth_verifier,
        redirectUri,
      });
      onSuccess(user);
    } catch (e: any) {
      onError(e.message);
    }
  }

  return (
    <Button
      title="Twitter Connect with OAuth1"
      onPress={() => {
        if (Platform.OS === "web") {
          linkTwitterForWeb();
        } else {
          linkTwitterForMobile();
        }
      }}
      color="#00acee"
      disabled={!Constants.manifest?.extra?.twitterClientId}
    />
  );
}
