import icons from "@rmccue/sfsymbols";
import React from "react";
import Button from "./Button";
import { EditorChildrenProps } from "../types";

const FormatButton: React.FC<EditorChildrenProps> = (props) => {
  return (
    <Button
      fallback="↩"
      icon={icons.link}
      label="Link"
      onPress={props.onShowLink}
    />
  );
};

export default FormatButton;
