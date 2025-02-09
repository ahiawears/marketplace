import { ColourList } from "./coloursList";


// Helper: Convert HEX to RGB
const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

// Helper: Convert RGB to Lab
const rgbToLab = ({ r, g, b }: { r: number; g: number; b: number }) => {
    // Normalize RGB values
    r /= 255;
    g /= 255;
    b /= 255;

    // Convert to XYZ space
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    // Convert to Lab space
    const xyz = [x / 0.95047, y / 1.00000, z / 1.08883].map((v) =>
        v > 0.008856 ? Math.cbrt(v) : (v * 903.3 + 16) / 116
    );

    return {
        l: 116 * xyz[1] - 16,
        a: 500 * (xyz[0] - xyz[1]),
        b: 200 * (xyz[1] - xyz[2]),
    };
};

//Calculate Delta-E
const deltaE = (lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }) => {
    return Math.sqrt(
        Math.pow(lab1.l - lab2.l, 2) +
        Math.pow(lab1.a - lab2.a, 2) +
        Math.pow(lab1.b - lab2.b, 2)
    );
};

export const findNearestColor = (hex: string): string => {
    const targetLab = rgbToLab(hexToRgb(hex));
    let nearestColorName = "Unknown Color";
    let smallestDeltaE = Infinity;

    for (const [key, name] of Object.entries(ColourList)) {
        const colorLab = rgbToLab(hexToRgb(key));
        const difference = deltaE(targetLab, colorLab);

        if (difference < smallestDeltaE) {
            smallestDeltaE = difference;
            nearestColorName = name;
        }
    }
    return nearestColorName;
};