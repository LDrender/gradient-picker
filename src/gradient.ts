import { createElement, createGradientElement, createGradientSelect } from "./utils"

// Main class for the gradient picker
export class GradientPicker {
    defaultElement: HTMLElement // Default HTML element
    containerPicker: HTMLElement // Main container for the picker
    inputReturn: HTMLInputElement // Input element to return data
    returnType: "string" | "object" | "stops-list" // Type of return value

    optionsEl: HTMLElement // Element for options
    direction: GradientDirection | Number = 'right' // Gradient direction
    directionType: Props['directionType'] = "select" // Type of direction input
    directionInput: HTMLSelectElement | HTMLInputElement | null = null // Input for direction
    previewEl: HTMLElement // Preview element
    colorHandlersEl: HTMLElement // Element for color handlers
    type: GradientType = "linear" // Gradient type (linear or radial)
    typeInput: HTMLSelectElement | null // Selector for gradient type
    stops: GradientStop[] = [] // List of color stops
    isDragging = false // Dragging state

    // Constructor for the class
    constructor({el, stops = [], directionType = "percent", returnType = "string", direction, type }: Props) {
        this.defaultElement = document.querySelector(el) as HTMLElement
        this.direction = direction || 'right'
        this.type = type || 'linear'
        this.returnType = returnType
        this.containerPicker = createGradientElement(this.defaultElement, 'gradient-picker')
        this.inputReturn = this.initInputReturn()

        this.optionsEl = createGradientElement(this.containerPicker, 'gradient-picker__options')
        this.previewEl = createGradientElement(this.containerPicker, 'gradient-picker__preview')
        this.colorHandlersEl = createGradientElement(this.containerPicker, 'gradient-picker__colors')
        this.typeInput = createGradientSelect(this.optionsEl, ["linear", "radial"], 'gradient-picker__select')
        
        this.init()
        this.initDirection(directionType)
        
        // Vérifier si la valeur de defaultElement est un JSON valide
        const defaultValue = this.defaultElement.getAttribute('value')
        if (defaultValue) {
            try {
                const gradient = JSON.parse(defaultValue)
                if (this.isValidGradient(gradient)) {
                    this.initFromGradient(gradient)
                } else {
                    this.initStops(stops)
                }
            } catch (e) {
                // Si ce n'est pas un JSON valide, continuer avec l'initialisation normale
                this.initStops(stops)
            }
        } else {
            this.initStops(stops)
        }

        this.listener()
    }

    /**
     * Validate if the object is a valid gradient object
     * 
     * @param gradient any
     * @return boolean
     */
    private isValidGradient(gradient: any): gradient is ReturnType<typeof this.getGradient> {
        return gradient && typeof gradient === 'object' && 'type' in gradient && 'direction' in gradient && 'stops' in gradient
    }

    /**
     * Initialize from gradient object
     * 
     * @param gradient ReturnType<typeof this.getGradient>
     */
    private initFromGradient(gradient: ReturnType<typeof this.getGradient>) {
        this.type = gradient.type
        this.direction = gradient.direction
        this.stops = []
        gradient.stops.forEach(({ color, offset }) => {
            // If offset it's on 0-1 range, convert it to 0-100 (Warning: offset is possibly eg. 0)
            const newOffset = !this.isFloat(offset) || offset > 1 ? offset : offset * 100
            this.addColorStop(color, newOffset)
        })
        this.updateElementBackground()
    }

    /**
     * Check if a number is a float
     * 
     * @param n number
     * @return boolean
     */
    private isFloat(n: number) {
        return n === +n && n !== (n | 0)
    }
 
    /**
     * Initialize the gradient picker
     */
    private init() {
        // Replace the default element with the gradient picker container
        this.defaultElement.replaceWith(this.containerPicker)
    }

    /**
     * Initialize the input return element
     * 
     * @return HTMLInputElement
     */
    private initInputReturn() {
        const input = createElement('input', { type: 'hidden', class:'gradient-picker__return', name: 'gradientInput', id: this.defaultElement.id, value: ''}) 
        this.containerPicker.append(input)
        return input
    }

    /**
     * Initialize the color stops
     * 
     * @param stops GradientStop[]
     */
    public initStops(stops: GradientStop[]) {
        if (!stops.length) {
            this.addColorStop("#af68fe", 9.3) 
            this.addColorStop("#65dfff", 75.1)
            return
        }

        stops.forEach(({color, offset}) => this.addColorStop(color, offset))
    }

    /**
     * Initialize the direction input
     * 
     * @param directionType GradientDirectionType
     */
    public initDirection(directionType: GradientDirectionType = "select") {
        this.directionType = directionType
        switch (directionType) {
            case "select":
                this.directionInput = createGradientSelect(this.optionsEl, ["top", "left", "center", "bottom", "right"], 'gradient-picker__select')
                this.direction = "right"
                break
            case "percent":
                this.directionInput = createElement('input', { class: 'gradient-picker__input', type: 'number', value: '0', min: '0', max: '360' })
                this.optionsEl.append(this.directionInput)
                this.direction = 0
                break
        }
    }

    /**
     * Add color to the gradient
     * 
     * @param color The color string (HEX/RGB/any supported css color format)
     * @param offset The position of the stop (0-100)
     */
    public addColorStop(color: string, offset: number) {
        const id = this.stops[this.stops.length-1]?.id + 1 || 0
        this.stops.push({ id, color, offset })
        this.createStopHandler(id)
        this.updateElementBackground()
    }

    /**
     * Get the gradient string
     * 
     * @param type GradientType
     * @param direction GradientDirection | Number
     * @param directionType GradientDirectionType
     * @return string
     */
    public getGradientString(type: GradientType = this.type, direction: GradientDirection | Number = this.direction, directionType: Props['directionType'] = this.directionType) {
        const round = (num: number) => Math.round(num * 100) / 100
        const colorConcat = [...this.stops]
                                .sort((a,b) => a.offset - b.offset)
                                .map(stop => ` ${stop.color} ${round(stop.offset)}%`).join(',')
        const directionValue = this.getDirectionValue(type, direction, directionType)

        if(type === 'radial') {
            return `radial-gradient(circle ${directionValue}, ${colorConcat})`
        }
        
        return `linear-gradient(${directionValue},${colorConcat})`
    }

    /**
     * Get the gradient object
     * 
     * @param type GradientType
     * @param direction GradientDirection | Number
     * @return object
     */
    public getGradient(type: GradientType = this.type, direction: GradientDirection | Number = this.direction) {
        // Sort the stops by offset
        const colorStops = [...this.stops].sort((a,b) => a.offset - b.offset)

        const gradient = {
            type,
            direction: direction,
            stops: colorStops.map(({color, offset}) => ({ color, offset }))
        }

        return gradient
    }

    /**
     * Get the stops list
     * 
     * @return GradientStop[]
     */
    public getStops() {
        const colorStops = [...this.stops].sort((a,b) => a.offset - b.offset)
        return colorStops.map(({color, offset}) => ({ color, offset }))
    }

    /**
     * Update the background of the preview element
     */
    private updateElementBackground() {
        this.previewEl.style.backgroundImage = this.getGradientString('linear', 'right', 'select')
        const event = new Event('change')

        switch (this.returnType) {
            case "string":
                this.inputReturn!.setAttribute('value', this.getGradientString())
                this.inputReturn!.dispatchEvent(event)                
                break
            case "object":
                this.inputReturn!.setAttribute('value', JSON.stringify(this.getGradient()))
                this.inputReturn!.dispatchEvent(event)
                break
            case "stops-list":
                this.inputReturn!.setAttribute('value', JSON.stringify(this.getStops()))
                this.inputReturn!.dispatchEvent(event)
                break
        }
    }

    /**
     * Create stop handler element
     * 
     * @param stopIndex number
     */
    private createStopHandler(stopIndex: number) {
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        const colorStop = this.stops[stopsKeys]
        const stopPositionCeil = Math.ceil(colorStop.offset).toString()

        // Handler bar
        const handler = createElement('div', { class: 'gradient-picker__preview-handler', 'data-index': stopIndex.toString() }, { '--handler-position': `${stopPositionCeil}%`, '--handler-color': colorStop.color })
        
        // Handler Options
        const handlerButtons = createElement('div', { class: 'gradient-picker__colors-variation', 'data-index': stopIndex.toString() }, { '--color-order': stopPositionCeil })

        // Option remover
        const handlerRemover = createElement('div', { class: 'gradient-picker__colors-remover' })

        // Option color picker
        const inputColorWrapper = createElement('div', { class: 'gradient-picker__colors-picker' })
        const inputColorPicker = createElement('input', { type: 'color', class: 'gradient-picker__colors-picker-input', 'data-index-color': stopIndex.toString(), value: colorStop.color }, { '--color-value': colorStop.color })
        const inputColorText = createElement('input', { type: 'text', class: 'gradient-picker__colors-picker-input', 'data-index-color': stopIndex.toString(), value: colorStop.color }, { '--color-value': colorStop.color })
        inputColorWrapper.append(inputColorPicker)
        inputColorWrapper.append(inputColorText)

        // Option position
        const positionWrapper = createElement('div', { class: 'gradient-picker__colors-position' })
        const positionInput = createElement('input', {
            type: 'number',
            class: 'gradient-picker__colors-position-input',
            'data-index-position': stopIndex.toString(),
            value: stopPositionCeil
        })
        positionWrapper.append(positionInput)
        
        inputColorPicker.addEventListener('input', e => this.onColorChange(e as InputEvent, stopIndex))
        inputColorText.addEventListener('input', e => this.onColorChange(e as InputEvent, stopIndex))
        handler.addEventListener('mousedown', e => this.onHandlerMouseDown(e))
        handler.addEventListener('touchstart', e => this.onHandlerMouseDown(e))
        handler.addEventListener('mouseup', e => this.onHandlerMouseUp(e))
        handler.addEventListener('touchend', e => this.onHandlerMouseUp(e))
        this.previewEl.addEventListener('mousemove', e => this.onHandlerMouseMove(e))
        this.previewEl.addEventListener('touchmove', e => this.onHandlerMouseMove(e))
        handlerRemover.addEventListener('click', () => {
            this.stops.splice(stopIndex, 1)
            handler.remove()
            handlerButtons.remove()
            this.updateElementBackground()
        })
        positionInput.addEventListener('input', e => this.onPositionChange(e as InputEvent, stopIndex))

        handlerButtons.append(inputColorWrapper, positionWrapper, handlerRemover)
        this.previewEl.append(handler)
        this.colorHandlersEl.append(handlerButtons)
    }

    /**
     * Handle color change event
     * 
     * @param event InputEvent
     * @param index number
     */
    private onColorChange(event: InputEvent, index: number) {
        this.changeColor(index, (event.target as HTMLInputElement).value)
        this.updateElementBackground()
    }

    /**
     * Handle mouse down event on handler
     * 
     * @param event MouseEvent
     */
    private onHandlerMouseDown(event: MouseEvent|TouchEvent) {
        let handlerEl = event.target as HTMLElement
        handlerEl.classList.add('active')
        this.isDragging = true
    }

    /**
     * Handle position change event
     * 
     * @param event InputEvent
     * @param index number
     */
    onPositionChange(event: InputEvent, index: number) {
        const newPosition = parseInt((event.target as HTMLInputElement).value)
        this.changePosition(index, newPosition)
        this.updateElementBackground()
    }

    /**
     * Handle mouse move event on preview element
     * 
     * @param event MouseEvent
     */
    private onHandlerMouseMove(event: MouseEvent|TouchEvent) {
        if(!this.isDragging) return

        let handlerEl = document.querySelector('.gradient-picker__preview-handler.active')
        if(!handlerEl?.classList.contains('active')) return 
        const stopIndex = ~~(handlerEl.getAttribute('data-index') || 0)

        let newStopPosition = null as number | null;

        if(event instanceof MouseEvent) {
            newStopPosition = this.getPercentage(event.clientX)
        } else {
            newStopPosition = this.getPercentage(event.touches[0].clientX)
        }

        if(newStopPosition < 0.5 || newStopPosition > 99.5) return

        this.changePosition(stopIndex, newStopPosition)
        this.updateElementBackground()
    }

    /**
     * Handle mouse up event on handler
     * 
     * @param event MouseEvent
     */
    private onHandlerMouseUp(event: MouseEvent|TouchEvent) {
        let handlerEl = event.target as HTMLElement
        handlerEl.classList.remove('active')
        this.isDragging = false
    }

    /**
     * Change the color of a stop
     * 
     * @param stopIndex number
     * @param color string
     */
    private changeColor(stopIndex: number, color: string) {
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        this.stops[stopsKeys].color = color
        this.colorHandlersEl.querySelectorAll(`input[data-index-color='${stopIndex}']`).forEach((el) => (el as HTMLInputElement).value = color)
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--handler-color', color))
    }

    /**
     * Change the position of a stop
     * 
     * @param stopIndex number
     * @param offset number
     */
    private changePosition(stopIndex: number, offset: number) {
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        const stopPositionCeil = Math.ceil(offset)
        this.stops[stopsKeys].offset = stopPositionCeil
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--handler-position', offset+'%'))
        this.colorHandlersEl.querySelectorAll(`div.gradient-picker__colors-variation[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--color-order', stopPositionCeil.toString()))
        this.colorHandlersEl.querySelectorAll(`input.gradient-picker__colors-position-input[data-index-position='${stopIndex}']`).forEach((el) => (el as HTMLInputElement).value = stopPositionCeil.toString())
    }

    /**
     * Get the percentage position based on mouse X coordinate
     * 
     * @param mouseX number
     * @return number
     */
    private getPercentage(mouseX: number) {
        const rect = this.previewEl.getBoundingClientRect()
        const clickPosition = mouseX - rect.x
        const elementWidth = getComputedStyle(this.previewEl).width.slice(0, -2)
        const newStopPosition = clickPosition / ~~elementWidth * 100

        return newStopPosition
    }

    /**
     * Get the direction value for the gradient
     * 
     * @param type GradientType
     * @param direction GradientDirection | Number
     * @param directionType GradientDirectionType
     * @return string
     */
    private getDirectionValue(type: GradientType, direction: GradientDirection | Number, directionType: Props['directionType']) {
        let directionValue = null
        if(directionType === "select") {
            
            if(type === 'radial') {
                const radialPositions: Record<GradientDirection, string> = {
                    "bottom": "at center bottom",
                    "center": "",
                    "left": "at left center",
                    "right": "at center right",
                    "top": "at center top",
                }
                directionValue = radialPositions[direction as GradientDirection]
            } 
            else {
                directionValue = `to ${direction}`
            }

        } else {
            
            if(type === 'radial') {
                const radialPositions = direction as number
                if(radialPositions >= 360) directionValue = "at center top"
                if(radialPositions >= 270) directionValue = "at center left"
                if(radialPositions >= 180) directionValue = "at center bottom"
                if(radialPositions >= 90) directionValue = "at center right"
                if(radialPositions >= 0) directionValue = "at center top"
            }
            else {
                directionValue = `${direction}deg`
            }

        }

        return directionValue
    }

    /**
     * Add event listeners
     */
    private listener() {
        this.previewEl.addEventListener('click', e => {
            if((e.target as HTMLElement).classList.contains('gradient-picker__preview-handler') || this.isDragging) return
            if(!this.previewEl.contains(e.target as HTMLElement)) return

            const newStopPosition = this.getPercentage(e.clientX)

            this.addColorStop("#333333", newStopPosition)
        })

        this.directionInput?.addEventListener('input', () => {
            this.direction = this.directionInput?.value as GradientDirection
            this.updateElementBackground()
        })
        this.typeInput?.addEventListener('input', () => {
            this.type = this.typeInput?.value as GradientType
            this.updateElementBackground()
        })
    }
}

interface Props {
    el: string
    stops?: GradientStop[]
    directionType?: GradientDirectionType,
    returnType?: "string" | "object",
    direction?: GradientDirection | Number
    type?: GradientType
}

type GradientDirectionType = "select" | "percent"
type GradientDirection = "top" | "left" | "center" | "bottom" | "right"
type GradientType = "linear" | "radial"
type GradientStop = {
    id: number
    color: string 
    offset: number
}