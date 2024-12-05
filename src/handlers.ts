import { createElement } from './utils'
import { GradientStop } from './types'

export class StopHandlerManager {

    constructor(
        private stops: GradientStop[],
        private sliderEl: HTMLElement,
        private colorHandlersEl: HTMLElement,
        private updateCallback: () => void
    ) {}

    createHandler(stopIndex: number): void {
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        const colorStop = this.stops[stopsKeys]
        const stopPositionCeil = Math.ceil(colorStop.offset).toString()

        const handler = this.createHandlerElement(stopIndex, stopPositionCeil, colorStop.color)
        const handlerButtons = this.createHandlerButtons(stopIndex, stopPositionCeil, colorStop.color)

        this.sliderEl.append(handler)
        this.colorHandlersEl.append(handlerButtons)
    }

    private createHandlerElement(stopIndex: number, position: string, color: string): HTMLElement {
        const handler = createElement('div', {
            class: 'gradient-picker__slider-handler',
            'data-index': stopIndex.toString()
        }, {
            '--handler-position': `${position}%`,
            '--handler-color': color
        })
        return handler
    }

    private createHandlerButtons(stopIndex: number, position: string, color: string): HTMLElement {
        const handlerButtons = createElement('div', {
            class: 'gradient-picker__colors-variation',
            'data-index': stopIndex.toString()
        }, {
            '--color-order': position
        })

        const inputColorWrapper = this.createColorInputs(stopIndex, color)
        const positionWrapper = this.createPositionInput(stopIndex, position)
        const handlerRemover = this.createRemoveButton(stopIndex)

        handlerButtons.append(inputColorWrapper, positionWrapper, handlerRemover)
        return handlerButtons
    }

    private createColorInputs(stopIndex: number, color: string): HTMLElement {
        const wrapper = createElement('div', { class: 'gradient-picker__colors-picker' })
        const colorPicker = createElement('input', {
            type: 'color',
            class: 'gradient-picker__colors-picker-input',
            'data-index-color': stopIndex.toString(),
            value: color
        }, {
            '--color-value': color
        })
        
        const colorText = createElement('input', {
            type: 'text',
            class: 'gradient-picker__colors-picker-input',
            'data-index-color': stopIndex.toString(),
            value: color
        }, {
            '--color-value': color
        })

        colorPicker.addEventListener('input', e => this.onColorChange(e as InputEvent, stopIndex))
        colorText.addEventListener('input', e => this.onColorChange(e as InputEvent, stopIndex))

        wrapper.append(colorPicker, colorText)
        return wrapper
    }

    private createPositionInput(stopIndex: number, position: string): HTMLElement {
        const wrapper = createElement('div', { class: 'gradient-picker__colors-position' })
        const input = createElement('input', {
            type: 'number',
            class: 'gradient-picker__colors-position-input',
            'data-index-position': stopIndex.toString(),
            value: position,
            min: '0',
            max: '100'
        })

        input.addEventListener('input', e => this.onPositionChange(e as InputEvent, stopIndex))
        wrapper.append(input)
        return wrapper
    }

    private createRemoveButton(stopIndex: number): HTMLElement {
        const button = createElement('div', { class: 'gradient-picker__colors-remover' })
        button.addEventListener('click', () => {
            if (this.stops.length <= 2) {
                throw new Error('Gradient must have at least 2 color stops')
                return
            }

            const index = this.stops.findIndex(stop => stop.id === stopIndex)
            this.stops.splice(index, 1)
            this.sliderEl.querySelector(`[data-index="${stopIndex}"]`)?.remove()
            this.colorHandlersEl.querySelector(`[data-index="${stopIndex}"]`)?.remove()
            this.updateCallback()
        })
        return button
    }

    private onColorChange(event: InputEvent, stopIndex: number): void {
        const newColor = (event.target as HTMLInputElement).value
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        this.stops[stopsKeys].color = newColor

        this.colorHandlersEl.querySelectorAll(`input[data-index-color='${stopIndex}']`)
            .forEach((el) => (el as HTMLInputElement).value = newColor)
        
        this.sliderEl.querySelectorAll(`div.gradient-picker__slider-handler[data-index='${stopIndex}']`)
            .forEach((el) => (el as HTMLElement).style.setProperty('--handler-color', newColor))

        this.updateCallback()
    }

    private onPositionChange(event: InputEvent, stopIndex: number): void {
        let newPosition = parseInt((event.target as HTMLInputElement).value)
        if (newPosition < 0 || newPosition > 100) {
            throw new Error('Stop offsets must be between 0 and 100')
        }
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        const stopPositionCeil = Math.ceil(newPosition)
        this.stops[stopsKeys].offset = stopPositionCeil

        this.sliderEl.querySelectorAll(`div.gradient-picker__slider-handler[data-index='${stopIndex}']`)
            .forEach((el) => (el as HTMLElement).style.setProperty('--handler-position', newPosition+'%'))
        
        this.colorHandlersEl.querySelectorAll(`div.gradient-picker__colors-variation[data-index='${stopIndex}']`)
            .forEach((el) => (el as HTMLElement).style.setProperty('--color-order', stopPositionCeil.toString()))
        
        this.colorHandlersEl.querySelectorAll(`input.gradient-picker__colors-position-input[data-index-position='${stopIndex}']`)
            .forEach((el) => (el as HTMLInputElement).value = stopPositionCeil.toString())

        this.updateCallback()
    }
}