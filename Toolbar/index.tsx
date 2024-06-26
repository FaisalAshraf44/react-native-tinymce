import React from "react";
import { StyleSheet, View } from "react-native";

import FormatButton from "./FormatButton";
import LinkButton from "./LinkButton";
import UndoRedoButtons from "./UndoRedoButtons";
import { EditorChildrenProps } from "../types";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});

const Toolbar: React.FC<EditorChildrenProps> = (props) => {
  return (
    <View style={styles.container}>
      <UndoRedoButtons {...props} />
      <FormatButton {...props} />
      <LinkButton {...props} />
    </View>
  );
};

export default Toolbar;
