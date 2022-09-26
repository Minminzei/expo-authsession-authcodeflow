import React from "react";
import { View, StyleSheet } from "react-native";

export default function Divider() {
  return <View style={styles.content} />;
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
    width: "100%",
    height: 1,
    marginBottom: 8,
  },
});
