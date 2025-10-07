import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { buttonStyles } from "./Button.styles";
import { ButtonProps } from "./Button.types";

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onPress,
  icon,
  style,
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (disabled || loading) return;

    if (onPress) {
      onPress();
    } else {
      // Default toast action for demo
      Toast.show({
        type: "success",
        text1: "Button Pressed",
        text2: `${label} button was pressed`,
        position: "bottom",
      });
    }
  };

  const getContainerStyle = () => [
    buttonStyles.container,
    buttonStyles[variant],
    buttonStyles[size],
    disabled && buttonStyles.disabled,
    isPressed && buttonStyles.pressed,
    style,
  ];

  const getTextStyle = () => {
    const textVariantKey = `text${
      variant.charAt(0).toUpperCase() + variant.slice(1)
    }` as keyof typeof buttonStyles;
    const textSizeKey = `text${
      size.charAt(0).toUpperCase() + size.slice(1)
    }` as keyof typeof buttonStyles;

    return [
      buttonStyles.text,
      buttonStyles[textVariantKey],
      buttonStyles[textSizeKey],
    ];
  };

  return (
    <Pressable
      style={getContainerStyle()}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#FFFFFF" : "#007AFF"}
        />
      ) : (
        <>
          {icon && <View style={buttonStyles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{label}</Text>
        </>
      )}
    </Pressable>
  );
};

export default Button;
