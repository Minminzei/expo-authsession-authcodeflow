import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import FacebookOAuth from "@components/FacebookOAuth";
import TwitterOAuth1 from "@components/TwitterOAuth1";
import TwitterOAuth2 from "@components/TwitterOAuth2";
import Dialog from "@components/Dialog";
import Divider from "@components/Divider";
import { UserData } from "@hooks/oauth";

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <View style={styles.container}>
      {!Constants.manifest?.extra?.twitterClientId && (
        <Text style={styles.error}>require "TWITTER_CLIENT_ID" in .env</Text>
      )}
      {!Constants.manifest?.extra?.facebookAppId && (
        <Text style={styles.error}>require "FACEBOOK_APP_ID" in .env</Text>
      )}

      <TwitterOAuth1
        onError={(message: string) => setError(message)}
        onSuccess={(user: UserData) => setUser(user)}
      />

      <Divider />

      <TwitterOAuth2
        onError={(message: string) => setError(message)}
        onSuccess={(user: UserData) => setUser(user)}
      />

      <Divider />

      <FacebookOAuth
        onError={(message: string) => setError(message)}
        onSuccess={(user: UserData) => setUser(user)}
      />
      {error && <Dialog message={error} onClose={() => setError(null)} />}
      {user && (
        <Dialog
          message={`Apps Connected with ${user.username}`}
          onClose={() => setUser(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "#FF432B",
    marginTop: 8,
  },
});
