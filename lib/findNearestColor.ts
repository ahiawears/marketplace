import { ColourList } from "./coloursList";

interface Color {
    hex: string;
    name: string;
  }
  
  interface RGB {
    r: number;
    g: number;
    b: number;
  }
  
  interface Lab {
    l: number;
    a: number;
    b: number;
  }
  
  // Helper: Convert HEX to RGB
  const hexToRgb = (hex: string): RGB => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  };
  
  // Helper: Convert RGB to XYZ
  const rgbToXyz = ({ r, g, b }: RGB): [number, number, number] => {
    // Normalize RGB values
    let [nr, ng, nb] = [r, g, b].map(v => {
      v /= 255;
      return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    });
  
    // Convert to XYZ
    const x = nr * 0.4124564 + ng * 0.3575761 + nb * 0.1804375;
    const y = nr * 0.2126729 + ng * 0.7151522 + nb * 0.0721750;
    const z = nr * 0.0193339 + ng * 0.1191920 + nb * 0.9503041;
  
    return [x, y, z];
  };
  
  // Helper: Convert XYZ to Lab
  const xyzToLab = (xyz: [number, number, number]): Lab => {
    // D65 standard illuminant
    const [x, y, z] = xyz.map((v, i) => 
      v / [0.95047, 1.0, 1.08883][i]
    );
  
    const [fx, fy, fz] = xyz.map(v => 
      v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + (16 / 116)
    );
  
    return {
      l: (116 * fy) - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz)
    };
  };
  
  // Convert RGB to Lab in one step
  const rgbToLab = (rgb: RGB): Lab => {
    return xyzToLab(rgbToXyz(rgb));
  };
  
  // Calculate Delta-E (CIE76 formula)
  const deltaE = (lab1: Lab, lab2: Lab): number => {
    return Math.sqrt(
      Math.pow(lab1.l - lab2.l, 2) +
      Math.pow(lab1.a - lab2.a, 2) +
      Math.pow(lab1.b - lab2.b, 2)
    );
  };
  
  // Find nearest color name from ColourList
  export const findNearestColor = (inputHex: string): string => {
    // Normalize input hex (uppercase, add # if missing)
    const normalizedHex = inputHex.startsWith('#') 
      ? inputHex.toUpperCase() 
      : `#${inputHex.toUpperCase()}`;
  
    // First check if the hex exists exactly in ColourList
    const exactMatch = ColourList.find(color => color.hex === normalizedHex);
    if (exactMatch) {
      return exactMatch.name;
    }
  
    // Convert input hex to Lab
    let targetLab: Lab;
    try {
      targetLab = rgbToLab(hexToRgb(normalizedHex));
    } catch (e) {
      console.error("Invalid hex color:", inputHex);
      return "Unknown Color";
    }
  
    // Find the closest color
    let nearestColor: Color | null = null;
    let smallestDeltaE = Infinity;
  
    for (const color of ColourList) {
      try {
        const colorLab = rgbToLab(hexToRgb(color.hex));
        const difference = deltaE(targetLab, colorLab);
  
        if (difference < smallestDeltaE) {
          smallestDeltaE = difference;
          nearestColor = color;
        }
      } catch (e) {
        console.error("Error processing color:", color.hex, e);
      }
    }
  
    return nearestColor?.name || "Unknown Color";
  };