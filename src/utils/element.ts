
export function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, attrs?: Record<string, string>, styles?: Record<string, string>): HTMLElementTagNameMap[K]  {
    const el = document.createElement(tagName)

    for(const attr in attrs) {
        el.setAttribute(attr, attrs[attr])
    }
    
    for(const style in styles) {
        el.style.setProperty(style, styles[style])
    }

    return el
}

export function createGradientElement(parent: HTMLElement, className: string = 'gradient-picker') {
    const el = createElement('div', {
        class: className,
    })

    parent.append(el)

    return el
}

// Create a gradient select input for type or direction
export function createGradientSelect(parent: HTMLElement, options: string[], className: string = 'gradient-picker__select') {
    const select = createElement('select', {
        class: className
    })

    options.forEach(option => {
        const optionEl = document.createElement('option')
        optionEl.value = option
        optionEl.text = option

        select.append(optionEl)
    })

    parent.append(select)

    return select
}