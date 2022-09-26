import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Button,
} from "react-native";

type Props = {
  message: string;
  onClose: () => void;
};

export default function Dialog({ message, onClose }: Props): JSX.Element {
  return (
    <Modal animationType="none" visible onRequestClose={onClose} transparent>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.message}>
            <Text style={styles.title}>{message}</Text>

            <View style={styles.button}>
              <Button title="Close" onPress={onClose} />
            </View>
          </View>
        </View>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backgroundLayer} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  backgroundLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: -1,
    backgroundColor: "#00000060",
  },
  wrapper: {
    padding: 24,
    backgroundColor: "transparent",
  },
  message: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    maxWidth: 345,
    minWidth: "90%",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
  },
  button: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
