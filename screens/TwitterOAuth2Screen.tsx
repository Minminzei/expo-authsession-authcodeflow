import React, { useState } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { RootStackScreenProps } from "../types";
import * as qs from "query-string";
import Constants from "expo-constants";
import { twitterOAuth2AccessToken } from "@hooks/oauth";
import { makeRedirectUri } from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "@hooks/oauth";
import Dialog from "@components/Dialog";

export default function TwitterOAuth2Screen({
  route,
}: RootStackScreenProps<"TwitterOAuth2">) {
  const [user, setUser] = useState<UserData | null>(null);

  async function getUser(tokenCode: string) {
    const redirectUri = makeRedirectUri({
      useProxy: false,
      path: "twitterOAuth2",
    });
    const codeVerifier = await AsyncStorage.getItem(
      Constants.manifest?.extra?.codeVerifierForTwitterOAuth2
    );

    if (codeVerifier) {
      await AsyncStorage.removeItem(
        Constants.manifest?.extra?.codeVerifierForTwitterOAuth2
      );
      const user = await twitterOAuth2AccessToken({
        tokenCode,
        codeVerifier,
        redirectUri,
      });
      setUser(user);
    }
  }

  const { path } = route;
  const data = qs.parse(path || "");
  let code: string | null = null;
  Object.keys(data).forEach((index) => {
    if (/code/.test(index)) {
      code = `${data[index]}`;
    }
  });
  if (code) {
    getUser(code);
  }
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      {user && (
        <Dialog
          message={`Apps Connected with ${user.username}`}
          onClose={() => window.close()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
