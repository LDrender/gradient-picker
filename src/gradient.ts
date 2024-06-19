import { createElement, createGradientElement, createGradientSelect } from "./utils"
import './picker.scss'

interface Props {
    el: HTMLElement
}

type GradientDirection = "top" | "left" | "center" | "bottom" | "right"
type GradientType = "linear" | "radial"
type GradientStop = {
    color: string 
    position: number
}

export class GradientPicker {
    el: Props['el']
    containerPicker: HTMLElement
    optionsEl: HTMLElement
    direction: GradientDirection = "right"
    directionInput: HTMLSelectElement | null
    previewEl: HTMLElement
    colorHandlersEl: HTMLElement
    type: GradientType = "linear"
    typeInput: HTMLSelectElement | null
    stops: GradientStop[] = []
    isDragging = false

    constructor({el}: Props) {
        this.el = el
        this.containerPicker = createGradientElement(this.el, 'gradient-picker')
        this.optionsEl = createGradientElement(this.containerPicker, 'gradient-picker__options')
        this.previewEl = createGradientElement(this.containerPicker, 'gradient-picker__preview')
        this.colorHandlersEl = createGradientElement(this.containerPicker, 'gradient-picker__colors')
        this.typeInput = createGradientSelect(this.optionsEl, ["linear", "radial"], 'gradient-picker__select')
        this.directionInput = createGradientSelect(this.optionsEl, ["top", "left", "center", "bottom", "right"], 'gradient-picker__select')
        this.addColorStop("#af68fe", 9.3) 
        this.addColorStop("#65dfff", 75.1)

        this.listener()
    }

    /**
     * Add color to the gradient
     * @param color The color string (HEX/RGB/any supported css color format)
     * @param position The position of the stop (0-100)
     */
    addColorStop(color: string, position: number) {
        this.stops.push({ color, position })
        this.createStopHandler(this.stops.length-1)
        this.updateElementBackground()
    }

    changeGradientType(type: GradientType) {
        this.type = type 
        this.updateElementBackground()
    }

    getGradientString(type: GradientType = this.type, direction: GradientDirection = this.direction) {
        const round = (num: number) => Math.round(num * 100) / 100
        const colorConcat = [...this.stops]
                                .sort((a,b) => a.position - b.position)
                                .map(stop => ` ${stop.color} ${round(stop.position)}%`).join(',')

        if(type === 'radial') {
            const radialPositions: Record<GradientDirection, string> = {
                "bottom": "at center bottom",
                "center": "",
                "left": "at left center",
                "right": "at center right",
                "top": "at center top",
            }
            return `radial-gradient(circle ${radialPositions[direction]}, ${colorConcat})`
        } 
        
        return `linear-gradient(to ${direction},${colorConcat})`
    }

    private updateElementBackground() {
        this.previewEl.style.backgroundImage = this.getGradientString('linear', 'right')
        
        // ! Update the background of the app (Only for demo purposes)
         const gradientString = this.getGradientString()
         document.getElementById('app')!.style.backgroundImage = gradientString
         let cssTextbox = document.getElementById('css')!
         cssTextbox.textContent = gradientString
    }

    private createStopHandler(stopIndex: number) {
        const colorStop = this.stops[stopIndex]
        const stopPositionCeil = Math.ceil(colorStop.position)

        // Handler bar
        const handler = createElement('div', { class: 'gradient-picker__preview-handler', 'data-index': stopIndex.toString() }, { '--handler-position': `${colorStop.position}%`, '--handler-color': colorStop.color })

        // Handler remover
        const handlerButtons = createElement('div', { class: 'gradient-picker__colors-variation', 'data-index': stopIndex.toString() }, { '--color-order': stopPositionCeil.toString() })
        const handlerRemover = createElement('div', { class: 'gradient-picker__colors-remover' })

        // Color picker
        const inputColorWrapper = createElement('div', {
            class: 'gradient-picker__colors-picker',
        })
        const inputColorPicker = createElement('input', {
            type: 'color',
            class: 'gradient-picker__colors-picker-input',
            'data-index-color': stopIndex.toString(),
            value: colorStop.color
        },
        {
            '--color-value': colorStop.color
        })
        const inputColorText = createElement('input', {
            type: 'text',
            class: 'gradient-picker__colors-picker-input',
            'data-index-color': stopIndex.toString(),
            value: colorStop.color
        },
        {
            '--color-value': colorStop.color
        })
        inputColorWrapper.append(inputColorPicker)
        inputColorWrapper.append(inputColorText)
        
        inputColorPicker.addEventListener('input', e => this.onColorChange(e as InputEvent, stopIndex))
        inputColorText.addEventListener('input', e => this.onColorChange(e as InputEvent, stopIndex))
        handler.addEventListener('mousedown', e => this.onHandlerMouseDown(e))
        handler.addEventListener('mouseup', e => this.onHandlerMouseUp(e))
        this.previewEl.addEventListener('mousemove', e => this.onHandlerMouseMove(e))
        handlerRemover.addEventListener('click', () => {
            this.stops.splice(stopIndex, 1)
            handler.remove()
            handlerButtons.remove()
            this.updateElementBackground()
        })

        handlerButtons.append(inputColorWrapper, handlerRemover)
        this.previewEl.append(handler)
        this.colorHandlersEl.append(handlerButtons)
    }

    onHandlerMouseDown(event: MouseEvent) {
        let handlerEl = event.target as HTMLElement
        handlerEl.classList.add('active')
        this.isDragging = true
    }

    onHandlerMouseMove(event: MouseEvent) {
        if(!this.isDragging) return

        let handlerEl = document.querySelector('.gradient-picker__preview-handler.active')
        if(!handlerEl?.classList.contains('active')) return 
        const stopIndex = ~~(handlerEl.getAttribute('data-index') || 0)

        const newStopPosition = this.getPercentage(event.clientX)

        if(newStopPosition < 0.5 || newStopPosition > 99.5) return

        this.changePosition(stopIndex, newStopPosition)
        this.updateElementBackground()
    }

    onHandlerMouseUp(event: MouseEvent) {
        let handlerEl = event.target as HTMLElement
        handlerEl.classList.remove('active')
        this.isDragging = false
    }

    changeColor(stopIndex: number, color: string) {
        this.stops[stopIndex].color = color
        this.colorHandlersEl.querySelectorAll(`input[data-index-color='${stopIndex}']`).forEach((el) => (el as HTMLInputElement).value = color)
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--handler-color', color))
    }

    changePosition(stopIndex: number, position: number) {
        this.stops[stopIndex].position = position
        const stopPositionCeil = Math.ceil(position)
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--handler-position', position+'%'))
        this.colorHandlersEl.querySelectorAll(`div.gradient-picker__colors-variation[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--color-order', stopPositionCeil.toString()))
    }

    onColorChange(event: InputEvent, index: number) {
        this.changeColor(index, (event.target as HTMLInputElement).value)
        this.updateElementBackground()
    }

    getPercentage(mouseX: number) {
        const rect = this.previewEl.getBoundingClientRect()
        const clickPosition = mouseX - rect.x
        const elementWidth = getComputedStyle(this.previewEl).width.slice(0, -2)
        const newStopPosition = clickPosition/~~elementWidth * 100

        return newStopPosition
    }

    listener() {
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
