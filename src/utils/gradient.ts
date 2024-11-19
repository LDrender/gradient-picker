import { GradientDirection, GradientStop, GradientType, ColorTypes } from '../types'

export class GradientValidation {
    static validateStops(stops: GradientStop[]): void {
        // Vérifie les offsets
        if (stops.some(stop => stop.offset < 0 || stop.offset > 100)) {
            throw new Error('Stop offsets must be between 0 and 100')
        }

        // Vérifie le format des couleurs
        stops.forEach(stop => {
            if (!GradientValidation.isValidColor(stop.color)) {
                throw new Error(`Invalid color format: ${stop.color}`)
            }
        })
    }

    static isValidColor(color: string): boolean {
        // Hex colors
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) return true
        // RGB/RGBA colors
        if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/.test(color)) return true
        // HSL/HSLA colors
        if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/.test(color)) return true
        // Named colors
        return ColorTypes.isNamedColor(color)
    }
}

export class GradientUtils {
    static getGradientString(
        stops: GradientStop[],
        type: GradientType,
        direction: GradientDirection | number,
        directionType: "select" | "percent"
    ): string {

        GradientValidation.validateStops(stops)

        const round = (num: number) => Math.round(num * 100) / 100
        const colorConcat = [...stops]
            .sort((a, b) => a.offset - b.offset)
            .map(stop => ` ${stop.color} ${round(stop.offset)}%`)
            .join(',')
        
        const directionValue = this.getDirectionValue(type, direction, directionType)

        return type === 'radial'
            ? `radial-gradient(circle ${directionValue}, ${colorConcat})`
            : `linear-gradient(${directionValue},${colorConcat})`
    }

    static getDirectionValue(
        type: GradientType,
        direction: GradientDirection | number,
        directionType: "select" | "percent"
    ): string {
        if (directionType === "select") {
            return this.getSelectDirectionValue(type, direction as GradientDirection)
        }
        return this.getPercentDirectionValue(type, direction as number)
    }

    private static getSelectDirectionValue(type: GradientType, direction: GradientDirection): string {
        if (type === 'radial') {
            const radialPositions: Record<GradientDirection, string> = {
                "bottom": "at center bottom",
                "center": "at center",
                "left": "at left center",
                "right": "at center right",
                "top": "at center top",
            }
            return radialPositions[direction]
        }
        return `to ${direction}`
    }

    private static getPercentDirectionValue(type: GradientType, direction: number): string {
        if (type === 'radial') {
            if (direction >= 360) return "at center top"
            if (direction >= 270) return "at center left"
            if (direction >= 180) return "at center bottom"
            if (direction >= 90) return "at center right"
            if (direction == 0) return "at center"
            return "at center top"
        }
        return `${direction}deg`
    }

    static isFloat(n: number): boolean {
        return n === +n && n !== (n | 0)
    }

    static getPercentage(mouseX: number, element: HTMLElement): number {
        const rect = element.getBoundingClientRect()
        const clickPosition = mouseX - rect.x
        const elementWidth = parseInt(getComputedStyle(element).width)
        return (clickPosition / elementWidth) * 100
    }
}
