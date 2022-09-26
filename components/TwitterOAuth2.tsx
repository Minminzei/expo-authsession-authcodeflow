import React, { useEffect, useState } from "react";
import { Button, Platform, ActivityIndicator } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import { UserData, twitterOAuth2AccessToken } from "@hooks/oauth";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

export default function TwitterOAuth2({
  onError,
  onSuccess,
}: {
  onError: (message: string) => void;
  onSuccess: (user: UserData) => void;
}) {
  const [loaded, setLoaded] = useState<boolean>(
    Platform.select({ web: false, default: true })
  );
  const redirectUri = makeRedirectUri({
    useProxy: Platform.select({ web: false, default: true }),
    // As soon as app open WebBrowser to process Twitter OAuth2 on web, WebBrowser return { response.type: "dismiss" } and fail to process.
    // So we use TwitterOAuth2Screen as workaround  for processing OAuth in spite of unusual OAuth in spite of unusual and not good way.
    // That is why we recommend to use TwitterOAuth1.tsx not TwitterOAuth2.tsx as Auth Code Flow of Twitter on production "WEB".
    path: Platform.select({ web: "twitterOAuth2", default: undefined }),
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Constants.manifest?.extra?.twitterClientId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true,
      scopes: ["tweet.read", "users.read"],
    },
    {
      authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
      tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
    }
  );

  async function getUser(tokenCode: string, codeVerifier: string) {
    try {
      const user = await twitterOAuth2AccessToken({
        tokenCode,
        codeVerifier,
        redirectUri,
      });
      onSuccess(user);
    } catch (e: any) {
      onError(e.message);
    }
  }

  async function loadForWeb() {
    await AsyncStorage.setItem(
      Constants.manifest?.extra?.codeVerifierForTwitterOAuth2,
      request?.codeVerifier || ""
    );
    setLoaded(true);
  }

  useEffect(() => {
    if (Platform.OS === "web" && !loaded && request) {
      loadForWeb();
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === "success" && request?.codeVerifier) {
      const { code } = response.params;
      getUser(code, request.codeVerifier);
    }
  }, [response]);

  return (
    <>
      {loaded ? (
        <Button
          title="Twitter Connect with OAuth2"
          onPress={() => {
            promptAsync({
              useProxy: Platform.select({ web: false, default: true }),
            });
          }}
          color="#3b5998"
        />
      ) : (
        <ActivityIndicator />
      )}
    </>
  );
}
