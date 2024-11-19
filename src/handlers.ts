import { createElement } from './utils'
import { GradientStop } from './types'

export class StopHandlerManager {
    private stops: GradientStop[]
    private previewEl: HTMLElement
    private colorHandlersEl: HTMLElement
    private updateCallback: () => void

    constructor(stops: GradientStop[], previewEl: HTMLElement, colorHandlersEl: HTMLElement, updateCallback: () => void) {
        this.stops = stops
        this.previewEl = previewEl
        this.colorHandlersEl = colorHandlersEl
        this.updateCallback = updateCallback
    }

    createHandler(stopIndex: number): void {
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        const colorStop = this.stops[stopsKeys]
        const stopPositionCeil = Math.ceil(colorStop.offset).toString()

        const handler = this.createHandlerElement(stopIndex, stopPositionCeil, colorStop.color)
        const handlerButtons = this.createHandlerButtons(stopIndex, stopPositionCeil, colorStop.color)

        this.previewEl.append(handler)
        this.colorHandlersEl.append(handlerButtons)
    }

    private createHandlerElement(stopIndex: number, position: string, color: string): HTMLElement {
        return createElement('div', {
            class: 'gradient-picker__preview-handler',
            'data-index': stopIndex.toString()
        }, {
            '--handler-position': `${position}%`,
            '--handler-color': color
        })
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
            value: position
        })

        input.addEventListener('input', e => this.onPositionChange(e as InputEvent, stopIndex))
        wrapper.append(input)
        return wrapper
    }

    private createRemoveButton(stopIndex: number): HTMLElement {
        const button = createElement('div', { class: 'gradient-picker__colors-remover' })
        button.addEventListener('click', () => {
            const index = this.stops.findIndex(stop => stop.id === stopIndex)
            this.stops.splice(index, 1)
            this.previewEl.querySelector(`[data-index="${stopIndex}"]`)?.remove()
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
        
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`)
            .forEach((el) => (el as HTMLElement).style.setProperty('--handler-color', newColor))

        this.updateCallback()
    }

    private onPositionChange(event: InputEvent, stopIndex: number): void {
        const newPosition = parseInt((event.target as HTMLInputElement).value)
        const stopsKeys = this.stops.findIndex(stop => stop.id === stopIndex)
        const stopPositionCeil = Math.ceil(newPosition)
        this.stops[stopsKeys].offset = stopPositionCeil

        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`)
            .forEach((el) => (el as HTMLElement).style.setProperty('--handler-position', newPosition+'%'))
        
        this.colorHandlersEl.querySelectorAll(`div.gradient-picker__colors-variation[data-index='${stopIndex}']`)
            .forEach((el) => (el as HTMLElement).style.setProperty('--color-order', stopPositionCeil.toString()))
        
        this.colorHandlersEl.querySelectorAll(`input.gradient-picker__colors-position-input[data-index-position='${stopIndex}']`)
            .forEach((el) => (el as HTMLInputElement).value = stopPositionCeil.toString())

        this.updateCallback()
    }
}