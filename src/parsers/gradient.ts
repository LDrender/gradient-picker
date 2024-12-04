import { GradientDirection, GradientObject, GradientStop, GradientDirectionType } from '../types'
import { ColorUtils } from '../utils/color'

export class GradientParser {
    static parseGradientString(gradientStr: string): GradientObject | null {
        // Parse linear gradient
        const linearMatch = gradientStr.match(/^linear-gradient\((.*)\)$/)
        if (linearMatch) {
            return this.parseLinearGradient(linearMatch[1])
        }

        // Parse radial gradient
        const radialMatch = gradientStr.match(/^radial-gradient\((.*)\)$/)
        if (radialMatch) {
            return this.parseRadialGradient(radialMatch[1])
        }

        return null
    }

    private static parseLinearGradient(content: string): GradientObject {
        const parts = content.split(',').map(part => part.trim())
        let direction: GradientDirection | number = 'right'
        let stops: Omit<GradientStop, 'id'>[] = []

        // Parse direction
        if (parts[0].startsWith('to ')) {
            direction = parts[0].replace('to ', '') as GradientDirection
            parts.shift()
        } else if (parts[0].endsWith('deg')) {
            direction = parseInt(parts[0])
            parts.shift()
        }

        // Parse color stops
        stops = parts.map(stop => {
            const [color, offset] = stop.split(/\s+/)
            return {
                color: ColorUtils.normalizeColor(color),
                offset: parseFloat(offset)
            }
        })

        return {
            type: 'linear',
            direction,
            stops
        }
    }

    private static parseRadialGradient(content: string): GradientObject {
        const parts = content.split(',').map(part => part.trim())
        let direction: GradientDirection = 'center'
        let stops: Omit<GradientStop, 'id'>[] = []

        // Parse the first part for position
        if (parts[0].includes('at ')) {
            // Format: "circle at center bottom" or "circle at left center" etc.
            const positionMatch = parts[0].match(/at\s+((?:center|top|bottom|left|right)(?:\s+(?:center|top|bottom|left|right))?)/i)
            if (positionMatch) {
                const position = positionMatch[1].toLowerCase()
                
                // Map compound positions to our GradientDirection type
                const positionMap: Record<string, GradientDirection> = {
                    'center center': 'center',
                    'center top': 'top',
                    'center bottom': 'bottom',
                    'left center': 'left',
                    'center right': 'right',
                    // Single positions
                    'center': 'center',
                    'top': 'top',
                    'bottom': 'bottom',
                    'left': 'left',
                    'right': 'right'
                }

                direction = positionMap[position] || 'center'
                parts.shift() // Remove position part
            }
        }

        // Process color stops
        // Start at index 0 if first part was processed for position
        // or at index 1 if first part contained position
        stops = parts.map(stop => {
            // Handle different stop formats
            // Format: "color stop%" or "color stop%"
            const matches = stop.match(/((?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([^)]+\)|[a-z]+))\s*([0-9.]+)?%?/i)
            
            if (matches) {
                const [, color, offset = '0'] = matches
                return {
                    color: ColorUtils.normalizeColor(color),
                    offset: parseFloat(offset)
                }
            }
            
            // If format is not recognized, use default values
            return {
                color: '#000000',
                offset: 0
            }
        })

        // Ensure there are at least two stops
        if (stops.length < 2) {
            stops = [
                { color: '#ffffff', offset: 0 },
                { color: '#000000', offset: 100 }
            ]
        }

        return {
            type: 'radial',
            direction,
            stops
        }
    }

    static parseDirection(direction: GradientDirection | number, targetType: GradientDirectionType): GradientDirection | number {
        if (targetType === 'select' && typeof direction === 'number') {
            return GradientParser.convertDegreeToDirection(direction);
        }
        if (targetType === 'percent' && typeof direction === 'string') {
            return GradientParser.convertDirectionToDegree(direction);
        }
        return direction;
    }

    private static convertDegreeToDirection(degree: number): GradientDirection {
        const normalizedDegree = ((degree % 360) + 360) % 360;
        
        if (normalizedDegree >= 337.5 || normalizedDegree < 22.5) return 'right';
        if (normalizedDegree >= 22.5 && normalizedDegree < 67.5) return 'bottom right';
        if (normalizedDegree >= 67.5 && normalizedDegree < 112.5) return 'bottom';
        if (normalizedDegree >= 112.5 && normalizedDegree < 157.5) return 'bottom left';
        if (normalizedDegree >= 157.5 && normalizedDegree < 202.5) return 'left';
        if (normalizedDegree >= 202.5 && normalizedDegree < 247.5) return 'top left';
        if (normalizedDegree >= 247.5 && normalizedDegree < 292.5) return 'top';
        return 'top right';
    }

    private static convertDirectionToDegree(direction: GradientDirection): number {
        const directionMap: Record<GradientDirection, number> = {
            'right': 0,
            'bottom right': 45,
            'bottom': 90,
            'bottom left': 135,
            'left': 180,
            'top left': 225,
            'top': 270,
            'top right': 315,
            'center': 0,
            'center left': 180,
            'center right': 0,
            'center top': 270,
            'center bottom': 90
        };
        
        return directionMap[direction] || 0;
    }
}
