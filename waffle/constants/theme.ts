/**
 * Waffle App Theme Colors
 */

import { Platform } from 'react-native';

// Waffle Brand Colors
export const WaffleColors = {
  parchment: '#f7f0ea',
  carbonBlack: '#242424',
  dustGrey: '#e4dfda',
  yellow: '#ffb039',
  charcoal: '#5a5a5a',
  white: '#ffffff',
};

export const Colors = {
  light: {
    text: WaffleColors.carbonBlack,
    background: WaffleColors.white,
    tint: WaffleColors.yellow,
    icon: WaffleColors.charcoal,
    tabIconDefault: WaffleColors.charcoal,
    tabIconSelected: WaffleColors.yellow,
    card: WaffleColors.parchment,
    border: WaffleColors.carbonBlack,
    subtitle: WaffleColors.charcoal,
  },
  dark: {
    text: WaffleColors.parchment,
    background: WaffleColors.carbonBlack,
    tint: WaffleColors.yellow,
    icon: WaffleColors.dustGrey,
    tabIconDefault: WaffleColors.dustGrey,
    tabIconSelected: WaffleColors.yellow,
    card: WaffleColors.charcoal,
    border: WaffleColors.dustGrey,
    subtitle: WaffleColors.dustGrey,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
