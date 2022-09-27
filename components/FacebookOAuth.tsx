import React, { useEffect, useState } from "react";
import { Button, Platform } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import { generateRandom } from "expo-auth-session/src/PKCE";
import { facebookAccessToken, UserData } from "@hooks/oauth";

WebBrowser.maybeCompleteAuthSession();

export default function FacebookOAuth({
  onError,
  onSuccess,
}: {
  onError: (message: string) => void;
  onSuccess: (user: UserData) => void;
}) {
  const [csrfState] = useState<string>(generateRandom(8));
  const redirectUri = makeRedirectUri({
    useProxy: Platform.select({ web: false, default: true }),
    path: Platform.select({ web: "/", default: undefined }),
  });
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Constants.manifest?.extra?.facebookAppId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true,
      state: csrfState,
      scopes: ["instagram_basic"],
    },
    {
      authorizationEndpoint: "https://www.facebook.com/v14.0/dialog/oauth",
      tokenEndpoint: "https://graph.facebook.com/v14.0/oauth/access_token",
    }
  );

  async function getUser(tokenCode: string, codeVerifier: string) {
    try {
      const user = await facebookAccessToken({
        tokenCode,
        codeVerifier,
        redirectUri,
      });
      onSuccess(user);
    } catch (e: any) {
      onError(e.message);
    }
  }

  useEffect(() => {
    try {
      if (response?.type === "success" && request?.codeVerifier) {
        const { code, state } = response.params;
        if (state === csrfState) {
          getUser(code, request.codeVerifier);
        }
      }
    } catch (e: any) {
      onError(e.message);
    }
  }, [response]);

  return (
    <Button
      title="Facebook Connect"
      onPress={() => {
        promptAsync({
          useProxy: Platform.select({ web: false, default: true }),
        });
      }}
      color="#3b5998"
      disabled={!Constants.manifest?.extra?.facebookAppId}
    />
  );
}
