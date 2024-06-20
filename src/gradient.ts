import { createElement, createGradientElement, createGradientSelect } from "./utils"

export class GradientPicker {
    el: Props['el']
    containerPicker: HTMLElement
    optionsEl: HTMLElement
    direction: GradientDirection | Number = 'right'
    directionType: Props['directionType'] = "select"
    directionInput: HTMLSelectElement | HTMLInputElement | null = null
    previewEl: HTMLElement
    colorHandlersEl: HTMLElement
    type: GradientType = "linear"
    typeInput: HTMLSelectElement | null
    stops: GradientStop[] = []
    isDragging = false

    constructor({el = document.body, stops = [], directionType = "percent"}: Props) {
        this.el = el
        this.containerPicker = createGradientElement(this.el, 'gradient-picker')
        this.optionsEl = createGradientElement(this.containerPicker, 'gradient-picker__options')
        this.previewEl = createGradientElement(this.containerPicker, 'gradient-picker__preview')
        this.colorHandlersEl = createGradientElement(this.containerPicker, 'gradient-picker__colors')
        this.typeInput = createGradientSelect(this.optionsEl, ["linear", "radial"], 'gradient-picker__select')
        
        this.initDirection(directionType)        
        this.initStops(stops)

        this.listener()
    }
 
    /**
     * Initialize the gradient picker
     * 
     */
    public initStops(stops: GradientStop[]) {
        if (!stops.length) {
            this.addColorStop("#af68fe", 9.3) 
            this.addColorStop("#65dfff", 75.1)

            return
        }

        stops.forEach(({color, position}) => this.addColorStop(color, position))
    }

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
     * @param color The color string (HEX/RGB/any supported css color format)
     * @param position The position of the stop (0-100)
     */
    public addColorStop(color: string, position: number) {
        this.stops.push({ color, position })
        this.createStopHandler(this.stops.length-1)
        this.updateElementBackground()
    }

    public getGradientString(type: GradientType = this.type, direction: GradientDirection | Number = this.direction, directionType: Props['directionType'] = this.directionType) {
        const round = (num: number) => Math.round(num * 100) / 100
        const colorConcat = [...this.stops]
                                .sort((a,b) => a.position - b.position)
                                .map(stop => ` ${stop.color} ${round(stop.position)}%`).join(',')
        const directionValue = this.getDirectionValue(type, direction, directionType)

        if(type === 'radial') {
            return `radial-gradient(circle ${directionValue}, ${colorConcat})`
        }
        
        return `linear-gradient(${directionValue},${colorConcat})`
    }

    public getGradient(type: GradientType = this.type, direction: GradientDirection | Number = this.direction) {
        const gradient = {
            type,
            direction,
            stops: [...this.stops]
        }

        return gradient
    }

    private updateElementBackground() {
        this.previewEl.style.backgroundImage = this.getGradientString('linear', 'right', 'select')
        
        // ! Update the background of the app (Only for demo purposes)
        //document.getElementById('app')!.style.backgroundImage = this.getGradientString()
        //let cssTextbox = document.getElementById('css')!
        //cssTextbox.textContent = this.getGradientString()
    }

    private createStopHandler(stopIndex: number) {
        const colorStop = this.stops[stopIndex]
        const stopPositionCeil = Math.ceil(colorStop.position)

        // Handler bar
        const handler = createElement('div', { class: 'gradient-picker__preview-handler', 'data-index': stopIndex.toString() }, { '--handler-position': `${colorStop.position}%`, '--handler-color': colorStop.color })
        
        // Handler Options
        const handlerButtons = createElement('div', { class: 'gradient-picker__colors-variation', 'data-index': stopIndex.toString() }, { '--color-order': stopPositionCeil.toString() })

        // Option remover
        const handlerRemover = createElement('div', { class: 'gradient-picker__colors-remover' })

        // Option color picker
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

        // Option position
        const positionWrapper = createElement('div', { class: 'gradient-picker__colors-position' })
        const positionInput = createElement('input', {
            type: 'number',
            class: 'gradient-picker__colors-position-input',
            'data-index-position': stopIndex.toString(),
            value: colorStop.position.toString()
        })
        positionWrapper.append(positionInput)
        
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
        positionInput.addEventListener('input', e => this.onPositionChange(e as InputEvent, stopIndex))

        handlerButtons.append(inputColorWrapper, positionWrapper, handlerRemover)
        this.previewEl.append(handler)
        this.colorHandlersEl.append(handlerButtons)
    }

    private onColorChange(event: InputEvent, index: number) {
        this.changeColor(index, (event.target as HTMLInputElement).value)
        this.updateElementBackground()
    }

    private onHandlerMouseDown(event: MouseEvent) {
        let handlerEl = event.target as HTMLElement
        handlerEl.classList.add('active')
        this.isDragging = true
    }

    onPositionChange(event: InputEvent, index: number) {
        const newPosition = parseInt((event.target as HTMLInputElement).value)
        this.changePosition(index, newPosition)
        this.updateElementBackground()
    }

    private onHandlerMouseMove(event: MouseEvent) {
        if(!this.isDragging) return

        let handlerEl = document.querySelector('.gradient-picker__preview-handler.active')
        if(!handlerEl?.classList.contains('active')) return 
        const stopIndex = ~~(handlerEl.getAttribute('data-index') || 0)

        const newStopPosition = this.getPercentage(event.clientX)

        if(newStopPosition < 0.5 || newStopPosition > 99.5) return

        this.changePosition(stopIndex, newStopPosition)
        this.updateElementBackground()
    }

    private onHandlerMouseUp(event: MouseEvent) {
        let handlerEl = event.target as HTMLElement
        handlerEl.classList.remove('active')
        this.isDragging = false
    }

    private changeColor(stopIndex: number, color: string) {
        this.stops[stopIndex].color = color
        this.colorHandlersEl.querySelectorAll(`input[data-index-color='${stopIndex}']`).forEach((el) => (el as HTMLInputElement).value = color)
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--handler-color', color))
    }

    private changePosition(stopIndex: number, position: number) {
        this.stops[stopIndex].position = position
        const stopPositionCeil = Math.ceil(position)
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--handler-position', position+'%'))
        this.colorHandlersEl.querySelectorAll(`div.gradient-picker__colors-variation[data-index='${stopIndex}']`).forEach((el) => (el as HTMLElement).style.setProperty('--color-order', stopPositionCeil.toString()))
        this.colorHandlersEl.querySelectorAll(`input.gradient-picker__colors-position-input[data-index-position='${stopIndex}']`).forEach((el) => (el as HTMLInputElement).value = stopPositionCeil.toString())
    }

    private getPercentage(mouseX: number) {
        const rect = this.previewEl.getBoundingClientRect()
        const clickPosition = mouseX - rect.x
        const elementWidth = getComputedStyle(this.previewEl).width.slice(0, -2)
        const newStopPosition = clickPosition/~~elementWidth * 100

        return newStopPosition
    }

    private getDirectionValue(type: GradientType, direction: GradientDirection | Number, directionType: Props['directionType']) {
        let directionValue = null
        if(directionType === "select") {
            
            if(type === 'radial') {
                const radialPositions: Record<(GradientDirection), string> = {
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
    el: HTMLElement
    stops?: GradientStop[]
    directionType?: GradientDirectionType
}

type GradientDirectionType = "select" | "percent"
type GradientDirection = "top" | "left" | "center" | "bottom" | "right"
type GradientType = "linear" | "radial"
type GradientStop = {
    color: string 
    position: number
}