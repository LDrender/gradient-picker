import { GradientDirection, GradientObject, GradientStop } from '../types'
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
}
