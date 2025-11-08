import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  onPress?: () => void;
  icon?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}