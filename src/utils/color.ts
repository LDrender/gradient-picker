import { HSLColor, RGBColor, ColorTypes } from '../types';

export class ColorUtils {
    private static colorCache: Map<string, string> = new Map()
    private static ColorTypes = ColorTypes

    static rgbToHex({ r, g, b }: RGBColor): string {
        const toHex = (n: number) => {
            const hex = Math.max(0, Math.min(255, n)).toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    static parseRGB(color: string): RGBColor | null {
        const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/)
        if (!match) return null
        
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
            a: match[4] ? parseFloat(match[4]) : undefined
        }
    }

    static parseHSL(color: string): HSLColor | null {
        const match = color.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/)
        if (!match) return null
        
        return {
            h: parseInt(match[1], 10),
            s: parseInt(match[2], 10),
            l: parseInt(match[3], 10),
            a: match[4] ? parseFloat(match[4]) : undefined
        }
    }

    static hslToRGB({ h, s, l }: HSLColor): RGBColor {
        s /= 100
        l /= 100
        const k = (n: number) => (n + h / 30) % 12
        const a = s * Math.min(l, 1 - l)
        const f = (n: number) =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
        
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        }
    }

    static normalizeColor(color: string): string {
        if (this.colorCache.has(color)) {
            return this.colorCache.get(color)!
        }

        // Utiliser la logique de normalisation existante
        const normalized = (() => {
            if (color.startsWith('#')) return color
            
            const rgbColor = this.parseRGB(color)
            if (rgbColor) return this.rgbToHex(rgbColor)
            
            const hslColor = this.parseHSL(color)
            if (hslColor) {
                const rgbFromHsl = this.hslToRGB(hslColor)
                return this.rgbToHex(rgbFromHsl)
            }
            
            const namedColor = this.ColorTypes.getNamedColorHex(color)
            if (namedColor) return namedColor
            
            return color
        })()

        this.colorCache.set(color, normalized)
        return normalized
    }
}