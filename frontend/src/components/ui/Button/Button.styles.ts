import { StyleSheet } from 'react-native';

export const buttonStyles = StyleSheet.create({
  // Base container styles
  container: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  
  // Base text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Icon styles
  icon: {
    marginRight: 8,
  },
  
  // State styles
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  // Variant styles
  primary: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Text variant styles
  textPrimary: {
    color: '#FFFFFF',
  },
  
  textSecondary: {
    color: '#000000',
  },
  
  textOutline: {
    color: '#007AFF',
  },
  
  textGhost: {
    color: '#007AFF',
  },
  
  // Size styles
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Text size styles
  textSmall: {
    fontSize: 14,
  },
  
  textMedium: {
    fontSize: 16,
  },
  
  textLarge: {
    fontSize: 18,
  },
});