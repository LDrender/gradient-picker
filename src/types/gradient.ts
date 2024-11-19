export type GradientDirectionType = "select" | "percent"
export type GradientDirection = "top" | "left" | "center" | "bottom" | "right"
export type GradientType = "linear" | "radial"
export type ReturnType = "string" | "object" | "stops-list"

export interface GradientStop {
    id: number
    color: string 
    offset: number
}

export interface GradientPickerProps {
    el: string
    stops?: GradientStop[]
    direction?: GradientDirection | number
    directionType?: GradientDirectionType
    directionRadial?: boolean
    directionRadialType?: GradientDirectionType
    returnType?: "string" | "object"
    type?: GradientType
    preview?: boolean
}

export interface GradientObject {
    type: GradientType
    direction: GradientDirection | number
    stops: Omit<GradientStop, 'id'>[]
}