import { Asset } from "expo-asset";
import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

import EditorContext from "./Context";

const editorHtml = require("./assets-src/editor.html");
const editorUri = Asset.fromModule(editorHtml).uri;

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

interface EditorProps {
  contentCss?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  value?: string;
}

const Editor = forwardRef<WebView, EditorProps>((props, ref) => {
  const context = React.useContext(EditorContext);

  console.log("----------- value :", value);

  useEffect(() => {
    if (props.value !== context.state.value) {
      context.onUpdateContent(props.value);
    }
  }, [props.value]);

  useImperativeHandle(ref, () => ({
    getContent: async () => {
      return await context.getContent();
    },
  }));

  const getInitScript = () => {
    const config = {
      content: props.value,
      content_style: props.contentCss,
      placeholder: props.placeholder || null,
    };

    return `
      // Initialize the editor.
      const initConfig = ${JSON.stringify(config)};
      window.init(initConfig);

      // Ensure string evaluates to true.
      true;
    `;
  };

  return (
    <WebView
      ref={context.setWebViewRef}
      hideKeyboardAccessoryView={true}
      injectedJavaScript={getInitScript()}
      // keyboardDisplayRequiresUserAction={false}
      originWhitelist={["*"]}
      scrollEnabled={false}
      source={{ uri: editorUri }}
      style={StyleSheet.flatten([styles.webView, props.style])}
      onMessage={context.onMessage}
    />
  );
});

Editor.defaultProps = {
  contentCss: "body { font-family: sans-serif; }",
  style: null,
};

export default Editor;
