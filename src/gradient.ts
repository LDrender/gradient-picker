import { createElement, createGradientElement, createGradientSelect } from "./utils"
import { StopHandlerManager } from './handlers'
import { GradientUtils, ColorUtils, GradientValidation } from './utils'
import { GradientParser } from "./parsers";
import { 
    GradientDirection,
    GradientDirectionType,
    GradientPickerProps,
    GradientStop,
    GradientType,
    GradientObject,
    ReturnType
} from './types/gradient'

export class GradientPicker {
    // Utilisation de ! pour indiquer que ces propriétés seront définitivement assignées
    private defaultElement!: HTMLElement
    private containerPicker!: HTMLElement
    private inputReturn!: HTMLInputElement
    private returnType!: ReturnType
    private optionsEl!: HTMLElement
    private previewEl!: HTMLElement
    private sliderEl!: HTMLElement
    private colorHandlersEl!: HTMLElement
    private handlerManager!: StopHandlerManager

    // Propriétés avec valeurs par défaut
    private preview: Boolean = false
    private direction: GradientDirection | number = 'right'
    private directionType: GradientDirectionType = "select"
    private directionInput: HTMLSelectElement | HTMLInputElement | null = null
    private type: GradientType = "linear"
    private typeInput: HTMLSelectElement | null = null
    private stops: GradientStop[] = []
    private isDragging = false
    private isEventAttached = false

    constructor({
        el,
        stops = [],
        directionType = "percent",
        returnType = "string",
        direction,
        type,
        preview = false
    }: GradientPickerProps) {
        // Vérification de l'existence de l'élément
        const element = document.querySelector(el)
        if (!element) {
            throw new Error(`Element with selector "${el}" not found`)
        }

        if (stops.length) {
            GradientValidation.validateStops(stops)
        }
        
        this.defaultElement = element as HTMLElement
        this.direction = direction || 'right'
        this.type = type || 'linear'
        this.returnType = returnType as ReturnType
        this.preview = preview
        
        // Initialisation dans l'ordre
        this.initializeElements()
        this.initializeHandlerManager()
        this.initDirection(directionType)
        this.initializeGradient(stops)
        this.setupEventListeners()
    }

    private initializeElements(): void {
        this.containerPicker = createGradientElement(this.defaultElement, 'gradient-picker')
        this.inputReturn = this.createInputReturn()

        if (this.preview) {
            this.previewEl = createGradientElement(this.containerPicker, 'gradient-picker__preview')
        }

        this.optionsEl = createGradientElement(this.containerPicker, 'gradient-picker__options')
        this.sliderEl = createGradientElement(this.containerPicker, 'gradient-picker__slider')
        this.colorHandlersEl = createGradientElement(this.containerPicker, 'gradient-picker__colors')
        this.typeInput = createGradientSelect(this.optionsEl, ["linear", "radial"], 'gradient-picker__select')
        
        this.defaultElement.replaceWith(this.containerPicker)
    }

    private createInputReturn(): HTMLInputElement {
        const input = createElement('input', {
            type: 'hidden',
            class: 'gradient-picker__return',
            name: 'gradientInput',
            id: this.defaultElement.id,
            value: ''
        })
        this.containerPicker.append(input)
        return input
    }

    private initializeHandlerManager(): void {
        this.handlerManager = new StopHandlerManager(
            this.stops,
            this.sliderEl,
            this.colorHandlersEl,
            () => this.updateElementBackground()
        )
    }

    public initDirection(directionType: GradientDirectionType = "select"): void {
        this.directionType = directionType
        this.directionInput?.remove()

        if (directionType === "select") {
            this.directionInput = createGradientSelect(
                this.optionsEl,
                ["top", "left", "center", "bottom", "right"],
                'gradient-picker__select'
            )
            this.direction = "right"
        } else {
            this.directionInput = createElement('input', {
                class: 'gradient-picker__input',
                type: 'number',
                value: '0',
                min: '0',
                max: '360'
            })
            this.optionsEl.append(this.directionInput)
            this.direction = 0
        }

        this.directionInput.addEventListener('input', () => {
            this.direction = this.directionInput?.value as GradientDirection
            this.updateElementBackground()
        })
    }

    private initializeGradient(stops: GradientStop[]): void {
        const defaultValue = this.defaultElement.getAttribute('value')
        if (defaultValue) {
            try {
                const gradient = JSON.parse(defaultValue)
                if (this.isValidGradient(gradient)) {
                    this.loadGradientFromObject(gradient)
                    return
                }
            } catch (e) {
                // Continue with normal initialization if JSON is invalid
            }
        }
        this.initDefaultStops(stops)
    }

    private initDefaultStops(stops: GradientStop[]): void {
        if (!stops.length) {
            this.addColorStop("#af68fe", 9.3)
            this.addColorStop("#65dfff", 75.1)
            return
        }
        stops.forEach(({color, offset}) => this.addColorStop(color, offset))
    }

    public importFromCSSString(gradientStr: string): void {
        const parsed = GradientParser.parseGradientString(gradientStr)
        if (parsed) {
            this.loadGradientFromObject(parsed)
        } else {
            throw new Error('Invalid gradient string format')
        }
    }

    public addColorStop(color: string, offset: number): void {
        const normalizedColor = ColorUtils.normalizeColor(color)
        const id = this.stops[this.stops.length-1]?.id + 1 || 0
        this.stops.push({ id, color: normalizedColor, offset })
        this.handlerManager.createHandler(id)
        this.updateElementBackground()
    }

    private isValidGradient(gradient: any): gradient is GradientObject {
        return gradient 
            && typeof gradient === 'object' 
            && 'type' in gradient 
            && 'direction' in gradient 
            && 'stops' in gradient
    }

    private loadGradientFromObject(gradient: GradientObject): void {
        this.type = gradient.type
        this.direction = gradient.direction
        this.stops = []
        
        gradient.stops.forEach(({ color, offset }) => {
            const newOffset = !GradientUtils.isFloat(offset) || offset > 1 
                ? offset 
                : offset * 100
            this.addColorStop(color, newOffset)
        })
        
        this.updateElementBackground()
    }

    private setupEventListeners(): void {
        if (this.isEventAttached) return
        this.isEventAttached = true

        this.setupSliderListeners()
        this.setupInputListeners()
    }

    private setupSliderListeners(): void {
        this.sliderEl.addEventListener('mousemove', this.handleMouseMove)
        this.sliderEl.addEventListener('touchmove', this.handleMouseMove)
        this.sliderEl.addEventListener('click', this.handleSliderClick)

        this.sliderEl.addEventListener('mousedown', this.handleMouseDown)
        this.sliderEl.addEventListener('mouseup', this.handleMouseUp)
        this.sliderEl.addEventListener('touchstart', this.handleMouseDown)
        this.sliderEl.addEventListener('touchend', this.handleMouseUp)

        document.addEventListener('mouseup', this.handleMouseUp)
    }

    private setupInputListeners(): void {
        this.typeInput?.addEventListener('input', () => {
            this.type = this.typeInput?.value as GradientType
            this.updateElementBackground()
        })
    }

    private handleMouseDown = (event: MouseEvent | TouchEvent): void => {
        const target = event.target as HTMLElement
        if (target.classList.contains('gradient-picker__slider-handler')) {
            this.isDragging = true
            target.classList.add('active')
        }
    }

    private handleMouseUp = (event: MouseEvent | TouchEvent): void => {
        this.isDragging = false
        const target = event.target as HTMLElement;
        const activeHandler = target.querySelector('.gradient-picker__slider-handler.active')
        if (activeHandler) {
            activeHandler.classList.remove('active')
        }
    }

    private handleMouseMove = (event: MouseEvent | TouchEvent): void => {
        if (!this.isDragging) return

        console.log('dragging')

        const activeHandler = this.sliderEl.querySelector('.gradient-picker__slider-handler.active')
        if (!activeHandler || !(activeHandler instanceof HTMLElement)) return
    
        const stopIndex = parseInt(activeHandler.getAttribute('data-index') || '0', 10)
        let clientX: number

        // Gestion différente selon le type d'événement
        if (event instanceof MouseEvent) {
            clientX = event.clientX
        } else {
            event.preventDefault() // Empêcher le défilement sur mobile
            clientX = event.touches[0].clientX
        }

        const newPosition = GradientUtils.getPercentage(clientX, this.sliderEl)

        if (newPosition < -1 || newPosition > 100) return

        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        if (stopsKeys !== -1) {
            const newOffset = Math.ceil(newPosition)
            this.stops[stopsKeys].offset = newOffset
            
            // Mise à jour visuelle du handler
            activeHandler.style.setProperty('--handler-position', `${newOffset}%`)
            
            // Mise à jour de l'input de position
            const positionInput = this.colorHandlersEl.querySelector(
                `input[data-index-position='${stopIndex}']`
            ) as HTMLInputElement
            if (positionInput) {
                positionInput.value = newOffset.toString()
            }

            this.updateElementBackground()
        }
    }

    // Modification de la méthode handleSliderClick pour éviter les conflits
    private handleSliderClick = (event: MouseEvent): void => {
        const target = event.target as HTMLElement
        if (target.classList.contains('gradient-picker__slider-handler')) return
        if (this.isDragging) return
        if (!this.sliderEl.contains(target)) return

        const newPosition = GradientUtils.getPercentage(event.clientX, this.sliderEl)
        this.addColorStop("#333333", newPosition)
    }

    public getGradient(): GradientObject {
        const colorStops = [...this.stops]
            .sort((a, b) => a.offset - b.offset)
            .map(({color, offset}) => ({ color, offset }))

        return {
            type: this.type,
            direction: this.direction,
            stops: colorStops
        }
    }

    public getStops(): Omit<GradientStop, 'id'>[] {
        return [...this.stops]
            .sort((a, b) => a.offset - b.offset)
            .map(({color, offset}) => ({ color, offset }))
    }

    private updateElementBackground(): void {
        const gradientString = GradientUtils.getGradientString(
            this.stops,
            "linear",
            "right",
            "select"
        )
    
        this.sliderEl.style.backgroundImage = gradientString
        
        if (this.preview && this.previewEl) {
            this.previewEl.style.backgroundImage = GradientUtils.getGradientString(
                this.stops,
                this.type,
                this.direction,
                this.directionType
            )
        }
        
        this.updateReturnValue()
    }

    private updateReturnValue(): void {
        let value: string = ''
        switch (this.returnType) {
            case "string":
                value = GradientUtils.getGradientString(
                    this.stops,
                    this.type,
                    this.direction,
                    this.directionType
                )
                break
            case "object":
                value = JSON.stringify(this.getGradient())
                break
            case "stops-list":
                value = JSON.stringify(this.getStops())
                break
        }

        this.inputReturn.value = value
        this.inputReturn.dispatchEvent(new Event('change'))
    }
}