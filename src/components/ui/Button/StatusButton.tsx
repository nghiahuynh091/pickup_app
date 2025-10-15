import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { StatusType } from "../../../types";
import Button from "./Button";
import { ButtonProps } from "./Button.types";

import { useStatusButton } from "@/src/hooks/useStatusButton";

interface StatusButtonProps extends Omit<ButtonProps, "onPress" | "loading"> {
  statusType: StatusType;
  label: string;
  toUserId?: string;
  sessionId?: string;
  messageText?: string;
  backgroundColor?: string;
  textColor?: string;
  onStatusCreated?: (documentId: string) => void;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  statusType,
  label, // ✅ Add label to destructuring
  toUserId,
  sessionId,
  messageText,
  onStatusCreated,
  backgroundColor = "#007AFF", // ✅ Default blue color
  textColor = "white",
  style, // ✅ Get style prop to merge with backgroundColor
  ...buttonProps
}) => {
  const { onPress, loading } = useStatusButton({
    statusType,
    toUserId,
    sessionId,
    messageText,
    onStatusCreated,
  });

  // ✅ Simple and clean style handling with proper typing
  const customStyle = [
    backgroundColor && { backgroundColor },
    style,
  ].filter(Boolean) as ViewStyle[];

  return (
    <Button
      {...buttonProps}
      label={label}
      loading={loading}
      onPress={onPress}
      style={customStyle}
    />
  );
};

// Predefined status buttons for common use cases
export const StatusButtons = {
  Arriving: (props: Omit<StatusButtonProps, "statusType" | "label">) => (
    <StatusButton
      statusType="arriving"
      label="Arriving"
      backgroundColor="#4CAF50"
      {...props}
    />
  ),

  FiveMinLeft: (props: Omit<StatusButtonProps, "statusType" | "label">) => (
    <StatusButton
      statusType="5-min-left"
      label="5-min-left"
      backgroundColor="#FF9800"
      {...props}
    />
  ),

  // Away: (props: Omit<StatusButtonProps, 'statusType' | 'label'>) => (
  //   <StatusButton
  //     statusType="away"
  //     label="Away"
  //     backgroundColor="#FFC107"
  //     {...props}
  //   />
  // ),

  Arrived: (props: Omit<StatusButtonProps, "statusType" | "label">) => (
    <StatusButton
      statusType="arrived"
      label="Arrived"
      backgroundColor="#F44336"
      {...props}
    />
  ),

  // HelpNeeded: (props: Omit<StatusButtonProps, 'statusType' | 'label'>) => (
  //   <StatusButton
  //     statusType="help_needed"
  //     label="Need Help"
  //     backgroundColor="#9C27B0"
  //     {...props}
  //   />
  // ),
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
