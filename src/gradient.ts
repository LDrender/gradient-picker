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
    private directionTypeDefault: GradientDirectionType = "select"
    private directionInput: HTMLSelectElement | HTMLInputElement | null = null
    private directionRadial: boolean = true
    private type: GradientType = "linear"
    private typeInput: HTMLSelectElement | null = null
    private stops: GradientStop[] = []
    private isDragging = false
    private isEventAttached = false

    private rafId?: number
    private debounceTimeout: number | null = null
    private readonly DEBOUNCE_DELAY = 16
    private currentPointer: number | null = null

    constructor({
        el,
        stops = [],
        direction = 90,
        directionType = "percent",
        directionRadial = true,
        returnType = "string",
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
        this.type = type || 'linear'
        this.returnType = returnType as ReturnType
        this.preview = preview
        this.directionRadial = directionRadial
        
        // Initialisation dans l'ordre
        this.initializeElements()
        this.initializeHandlerManager()
        this.initDirection(directionType, direction)
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
        this.typeInput.value = this.type
        
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
            () => this.updateGradient()
        )
    }

    public initDirection(directionType: GradientDirectionType = "select", direction: GradientDirection | number): void {
        this.directionType = directionType
        this.directionTypeDefault = directionType
        this.directionInput?.remove()

        if (directionType === "select") {
            this.directionInput = createGradientSelect(
                this.optionsEl,
                ["top", "left", "center", "bottom", "right"],
                'gradient-picker__select'
            )
            this.directionInput.value = typeof direction === 'string' ? direction : 'right'
            this.direction = this.directionInput.value as GradientDirection
        } else {
            this.directionInput = createElement('input', {
                class: 'gradient-picker__input',
                type: 'number',
                value: '0',
                min: '0',
                max: '360'
            })
            this.optionsEl.append(this.directionInput)
            this.directionInput.value = typeof direction === 'number' ? direction.toString() : '0'
            this.direction = parseInt(this.directionInput.value, 10)
        }

        this.directionInput.addEventListener('input', () => {
            this.direction = this.directionInput?.value as GradientDirection
            this.updateGradient()
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
                if (defaultValue.includes('gradient(')) {
                    try {
                        const normalizedGradient = defaultValue
                        .trim()
                        .replace(/\s+/g, ' ')  // Normaliser les espaces
                        .replace(/(,\s+)/g, ',')  // Normaliser les virgules
                    
                        const gradientObject = GradientParser.parseGradientString(normalizedGradient)
                        if (gradientObject) {
                            this.loadGradientFromObject(gradientObject)
                            return
                        }
                    } catch (cssError) {
                        // Si les deux méthodes échouent, continuer avec l'initialisation par défaut
                        console.warn('Invalid gradient format:', cssError)
                    }
                }
            }
        }

        if(this.stops.length <= 1) {
            this.initDefaultStops(stops)
        }
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
        this.updateGradient()
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
        this.direction = this.direction = GradientParser.parseDirection(gradient.direction, this.directionType);
        
        gradient.stops.forEach(({ color, offset }) => {
            const newOffset = !GradientUtils.isFloat(offset) || offset > 1 
                ? offset 
                : offset * 100
            this.addColorStop(color, newOffset)
        })
        
        if (this.typeInput) {
            this.typeInput.value = this.type;
        }
    
        if (this.directionInput) {
            this.directionInput.value = this.direction.toString();
        }
        
        this.updateGradient()
    }

    private setupEventListeners(): void {
        if (this.isEventAttached) return
        this.isEventAttached = true

        this.setupSliderListeners()
        this.setupInputListeners()
    }

    private setupSliderListeners(): void {
        // Remplacer les anciens événements mouse/touch par pointer events
        this.sliderEl.addEventListener('pointerdown', this.handlePointerDown)
        this.sliderEl.addEventListener('pointermove', this.handlePointerMove)
        this.sliderEl.addEventListener('pointerup', this.handlePointerUp)
        this.sliderEl.addEventListener('pointercancel', this.handlePointerUp)
        
        // Pour une meilleure performance tactile
        this.sliderEl.style.touchAction = 'none'
    }

    private handlePointerDown = (event: PointerEvent): void => {
        const target = event.target as HTMLElement
        if (target.classList.contains('gradient-picker__slider-handler')) {
            this.currentPointer = event.pointerId
            target.setPointerCapture(event.pointerId)
            target.classList.add('active')
            this.isDragging = true
        }
    }

    private handlePointerMove = (event: PointerEvent): void => {
        if (!this.isDragging || this.currentPointer !== event.pointerId) return
        
        if (this.rafId) {
            cancelAnimationFrame(this.rafId)
        }

        this.rafId = requestAnimationFrame(() => {
            const activeHandler = this.sliderEl.querySelector('.gradient-picker__slider-handler.active')
            if (!activeHandler || !(activeHandler instanceof HTMLElement)) return
            
            const newPosition = GradientUtils.getPercentage(event.clientX, this.sliderEl)
            if (newPosition < -1 || newPosition > 100) return

            const stopIndex = parseInt(activeHandler.getAttribute('data-index') || '0', 10)
            this.updateHandlerPosition(stopIndex, newPosition)
        })
    }

    private handlePointerUp = (event: PointerEvent): void => {
        if (this.currentPointer !== event.pointerId) return
        
        this.isDragging = false
        this.currentPointer = null
        
        const activeHandler = this.sliderEl.querySelector('.gradient-picker__slider-handler.active')
        if (activeHandler) {
            activeHandler.classList.remove('active')
            if (activeHandler instanceof HTMLElement) {
                activeHandler.releasePointerCapture(event.pointerId)
            }
        }
    }

    private updateHandlerPosition(stopIndex: number, newPosition: number): void {
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        if (stopsKeys === -1) return

        const newOffset = Math.ceil(newPosition)
        this.stops[stopsKeys].offset = newOffset
        
        const updates = new Map()
        updates.set(
            `.gradient-picker__slider-handler[data-index='${stopIndex}']`,
            {'--handler-position': `${newOffset}%`}
        )
        updates.set(
            `input[data-index-position='${stopIndex}']`,
            {value: newOffset.toString()}
        )
        
        this.batchDOMUpdates(updates)
        this.updateGradient()
    }

    // Nouvelle méthode
    private batchDOMUpdates(updates: Map<string, Record<string, string>>): void {
        requestAnimationFrame(() => {
            updates.forEach((properties, selector) => {
                const elements = this.containerPicker.querySelectorAll(selector)
                elements.forEach(el => {
                    Object.entries(properties).forEach(([prop, value]) => {
                        if (prop === 'value' && el instanceof HTMLInputElement) {
                            el.value = value
                        } else if (el instanceof HTMLElement) {
                            el.style.setProperty(prop, value)
                        }
                    })
                })
            })
        })
    }

    private setupInputListeners(): void {
        this.typeInput?.addEventListener('input', () => {
            this.type = this.typeInput?.value as GradientType;
            
            // Désactiver/Activer les contrôles de direction
            if (this.directionInput && !this.directionRadial) {
                if (this.type === 'radial') {
                    this.directionInput.style.display = 'none';
                    this.directionType = 'select';
                    this.direction = 'center';
                } else {
                    this.directionInput.style.display = '';
                    this.directionType = this.directionTypeDefault;
                    this.direction = this.directionInput.value as GradientDirection;
                }
            }
            
            this.updateGradient();
        })
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

    private updateGradient(): void {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }
    
        this.debounceTimeout = window.setTimeout(() => {
            // Le slider reste toujours horizontal (de gauche à droite)
            const sliderGradient = GradientUtils.getGradientString(
                this.stops,
                "linear",
                "right",
                "select"
            )
            this.sliderEl.style.backgroundImage = sliderGradient
            
            // La preview montre le gradient avec la direction et le type choisis
            if (this.preview && this.previewEl) {
                const previewGradient = GradientUtils.getGradientString(
                    this.stops,
                    this.type,
                    this.direction,
                    this.directionType
                )
                console.debug(this.previewEl.style.backgroundImage = previewGradient)
                
                this.previewEl.style.backgroundImage = previewGradient
            }
    
            this.updateReturnValue()
        }, this.DEBOUNCE_DELAY)
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