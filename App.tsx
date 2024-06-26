import * as Font from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import { Button, SafeAreaView, StyleSheet, View } from "react-native";

import Editor from "./Editor";
import EditorProvider from "./Provider";
import Tools from "./Tools";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});

const App: React.FC = () => {
  const [content, setContent] = useState("<p>Hello world!</p>");
  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    Font.loadAsync({
      sfsymbols: require("./assets/SFSymbolsFallback.ttf"),
    });
  }, []);

  const getContent = async () => {
    if (editorRef.current) {
      const content = await editorRef.current.getContent();
      console.log(content);
    }
  };

  return (
    <EditorProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Button title="Get Content" onPress={getContent} />
          <Editor
            ref={editorRef}
            placeholder="Start writing…"
            value={content}
          />
          <Tools />
        </View>
      </SafeAreaView>
    </EditorProvider>
  );
};

export default App;
