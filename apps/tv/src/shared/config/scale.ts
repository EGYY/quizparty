import { Dimensions } from 'react-native';

/**
 * Reference design dimensions — matches tvOS Apple TV logical resolution.
 * All sizes in the codebase are authored against this canvas.
 */
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const { width: W, height: H } = Dimensions.get('window');

/** Scale a horizontal / general size value to the current screen. */
export const s = (n: number): number => Math.round((n * W) / DESIGN_WIDTH);

/** Scale a vertical size value to the current screen. */
export const sv = (n: number): number => Math.round((n * H) / DESIGN_HEIGHT);

/** Scale a font size (same axis as s, kept separate for clarity). */
export const sf = (n: number): number => Math.round((n * W) / DESIGN_WIDTH);
