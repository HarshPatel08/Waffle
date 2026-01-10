import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";

type Props = {
  cell?: number;        // size of each grid cell
  gap?: number;         // spacing between squares inside the cell
  radius?: number;      // square corner radius
  opacity?: number;     // waffle opacity
  bgColor?: string;     // base background color
  waffleColor?: string; // waffle square color
};

export function WaffleBackground({
  cell = 28,
  gap = 8,
  radius = 6,
  opacity = 0.12,
  bgColor = "#ebe7df",
  waffleColor = "#e6a560",
}: Props) {
  const pad = Math.max(0, gap / 2);
  const sq = Math.max(1, cell - gap);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Base color */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />

      {/* Waffle pattern */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="waffle" width={cell} height={cell} patternUnits="userSpaceOnUse">
            <Rect
              x={pad}
              y={pad}
              width={sq}
              height={sq}
              rx={radius}
              ry={radius}
              fill={waffleColor}
              opacity={opacity}
            />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#waffle)" />
      </Svg>
    </View>
  );
}