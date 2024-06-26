import React, { useState, useEffect, useRef, useContext } from "react";
import { Keyboard } from "react-native";
import EditorContext, { defaultValue, ContextValue } from "./Context";
import { EditorEvent, EditorState } from "./types";
import { WebViewMessageEvent } from "react-native-webview";

/**
 * Time to debounce a keyboard show event.
 *
 * Experimentally tested on an iPhone 11 Pro, most events take 10-25ms to
 * execute, while some outliers occur around 50ms, with occasional events a
 * bit higher when lag occurs.
 *
 * 100ms should be plenty to cover all events including outliers.
 */
const KEYBOARD_DEBOUNCE = 100;

const Provider = ({ children }) => {
  const [state, setState] = useState<EditorState>(defaultValue.state);
  const webref = useRef(null);
  const resolveContent = useRef<(content: string) => void>(null);
  const keyboardTimer = useRef<number | null>(null);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      "keyboardWillShow",
      onKeyboardShow
    );
    const keyboardHideListener = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardHide
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const getContent = async (): Promise<string> => {
    return new Promise((resolve) => {
      resolveContent.current = resolve;

      webref.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage( JSON.stringify( {
          type: 'getContent',
          payload: {
            html: tinymce.activeEditor.getContent(),
          },
        } ) );
      `);
    });
  };

  const setWebViewRef = (ref) => {
    webref.current = ref;
  };

  const onKeyboardShow = (e) => {
    keyboardTimer.current = window.setTimeout(() => {
      keyboardTimer.current = null;
      onDebouncedKeyboardShow(e);
    }, KEYBOARD_DEBOUNCE);
  };

  const onKeyboardHide = () => {
    if (keyboardTimer.current) {
      window.clearTimeout(keyboardTimer.current);
    }
  };

  const onDebouncedKeyboardShow = (e) => {
    if (state.showingFormat) {
      setState((prevState) => ({
        ...prevState,
        showingFormat: false,
      }));
    }
  };

  const onMessage = (event: WebViewMessageEvent) => {
    const data: EditorEvent = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case "updateStatus":
        setState((prevState) => ({
          ...prevState,
          textStatus: data.payload,
        }));
        break;

      case "getContent":
        if (!resolveContent.current) {
          return;
        }

        resolveContent.current(data.payload.html);
        break;

      default:
        return;
    }
  };

  const onShowFormat = () => {
    if (!webref.current) {
      return;
    }

    // Hide the keyboard.
    webref.current.injectJavaScript("document.activeElement.blur()");

    // Show the formatting tools.
    setState((prevState) => ({
      ...prevState,
      showingFormat: true,
      showingLink: false,
    }));
  };

  const onDismissToolbar = () => {
    setState((prevState) => ({
      ...prevState,
      showingFormat: false,
      showingLink: false,
    }));

    webref.current.injectJavaScript(`
      // Refocus the editor.
      tinymce.activeEditor.focus();
    `);
  };

  const onCommand = (commandId: string, showUI?: boolean, value?: string) => {
    const args = [commandId, showUI, value];
    console.log("--------- onCommand Function value:", args);
    // tinymce.activeEditor.execCommand("FontSize", false, "24px");
    webref.current.injectJavaScript(
      `tinymce.activeEditor.execCommand("FontSize", false, "4px")`
    );

    // webref.current.injectJavaScript(`
    //   // Execute the command directly in TinyMCE.
    //   tinymce.activeEditor.execCommand(
    //     ${JSON.stringify(commandId)},
    //     ${JSON.stringify(showUI)},
    //     ${JSON.stringify(value)}
    //   );

    //   // Hide the keyboard again.
    //   document.activeElement.blur();
    // `);
  };

  // protected onCommand = (commandId: string, showUI?: boolean, value?: string) => {
  //   const args = [commandId, showUI, value];
  //   console.log("--------- onCommand Function value:", args);
  //   this.webref.injectJavaScript(`
  //     // Execute the command directly in TinyMCE.
  //     tinymce.activeEditor.execCommand(
  //       ${JSON.stringify(commandId)},
  //       ${JSON.stringify(showUI)},
  //       ${JSON.stringify(value)}
  //     );

  //     // Hide the keyboard again.
  //     document.activeElement.blur();
  //   `);
  // };

  const onFormat = (format) => {
    onCommand("mceToggleFormat", false, format);
  };

  const onUpdateContent = (content: string) => {
    if (!webref.current) {
      return;
    }

    webref.current.injectJavaScript(`
      tinymce.activeEditor.setContent( ${JSON.stringify(content)} );
    `);
  };

  const onShowLink = () => {
    if (!webref.current) {
      return;
    }

    // Preserve selection.
    webref.current.injectJavaScript("document.activeElement.blur()");

    setState((prevState) => ({
      ...prevState,
      showingFormat: false,
      showingLink: true,
    }));
  };

  const value: ContextValue = {
    state,
    getContent,
    setWebViewRef,
    onCommand,
    onDismissToolbar,
    onFormat,
    onMessage,
    onShowFormat,
    onShowLink,
    onUpdateContent,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export default Provider;
