function createElement(tagName, attrs, styles) {
    const el = document.createElement(tagName);
    for (const attr in attrs) {
        el.setAttribute(attr, attrs[attr]);
    }
    for (const style in styles) {
        el.style.setProperty(style, styles[style]);
    }
    return el;
}
function createGradientElement(parent, className = 'gradient-picker') {
    const el = createElement('div', {
        class: className,
    });
    parent.append(el);
    return el;
}
// Create a gradient select input for type or direction
function createGradientSelect(parent, options, className = 'gradient-picker__select') {
    const select = createElement('select', {
        class: className
    });
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.text = option;
        select.append(optionEl);
    });
    parent.append(select);
    return select;
}

class GradientPicker {
    constructor({ el }) {
        this.direction = "right";
        this.type = "linear";
        this.stops = [];
        this.isDragging = false;
        this.el = el;
        this.containerPicker = createGradientElement(this.el, 'gradient-picker');
        this.optionsEl = createGradientElement(this.containerPicker, 'gradient-picker__options');
        this.previewEl = createGradientElement(this.containerPicker, 'gradient-picker__preview');
        this.colorHandlersEl = createGradientElement(this.containerPicker, 'gradient-picker__colors');
        this.typeInput = createGradientSelect(this.optionsEl, ["linear", "radial"], 'gradient-picker__select');
        this.directionInput = createGradientSelect(this.optionsEl, ["top", "left", "center", "bottom", "right"], 'gradient-picker__select');
        this.addColorStop("#af68fe", 9.3);
        this.addColorStop("#65dfff", 75.1);
        this.listener();
    }
    /**
     * Add color to the gradient
     * @param color The color string (HEX/RGB/any supported css color format)
     * @param position The position of the stop (0-100)
     */
    addColorStop(color, position) {
        this.stops.push({ color, position });
        this.createStopHandler(this.stops.length - 1);
        this.updateElementBackground();
    }
    changeGradientType(type) {
        this.type = type;
        this.updateElementBackground();
    }
    getGradientString(type = this.type, direction = this.direction) {
        const round = (num) => Math.round(num * 100) / 100;
        const colorConcat = [...this.stops]
            .sort((a, b) => a.position - b.position)
            .map(stop => `${stop.color} ${round(stop.position)}%`).join(',');
        if (type === 'radial') {
            const radialPositions = {
                "bottom": "at center bottom",
                "center": "",
                "left": "at left center",
                "right": "at center right",
                "top": "at center top",
            };
            return `radial-gradient(circle ${radialPositions[direction]}, ${colorConcat})`;
        }
        return `linear-gradient(to ${direction},${colorConcat})`;
    }
    updateElementBackground() {
        this.previewEl.style.backgroundImage = this.getGradientString('linear', 'right');
        // ! Update the background of the app (Only for demo purposes)
        const gradientString = this.getGradientString();
        document.getElementById('app').style.backgroundImage = gradientString;
        let cssTextbox = document.getElementById('css');
        cssTextbox.textContent = gradientString;
    }
    createStopHandler(stopIndex) {
        const colorStop = this.stops[stopIndex];
        const stopPositionCeil = Math.ceil(colorStop.position);
        // Handler bar
        const handler = createElement('div', { class: 'gradient-picker__preview-handler', 'data-index': stopIndex.toString() }, { '--handler-position': `${colorStop.position}%`, '--handler-color': colorStop.color });
        // Handler remover
        const handlerButtons = createElement('div', { class: 'gradient-picker__colors-variation', 'data-index': stopIndex.toString() }, { '--color-order': stopPositionCeil.toString() });
        const handlerRemover = createElement('div', { class: 'gradient-picker__colors-remover' });
        // Color picker
        const inputColorWrapper = createElement('div', {
            class: 'gradient-picker__colors-picker',
        });
        const inputColorPicker = createElement('input', {
            type: 'color',
            class: 'gradient-picker__colors-picker-input',
            'data-index-color': stopIndex.toString(),
            value: colorStop.color
        }, {
            '--color-value': colorStop.color
        });
        const inputColorText = createElement('input', {
            type: 'text',
            class: 'gradient-picker__colors-picker-input',
            'data-index-color': stopIndex.toString(),
            value: colorStop.color
        }, {
            '--color-value': colorStop.color
        });
        inputColorWrapper.append(inputColorPicker);
        inputColorWrapper.append(inputColorText);
        inputColorPicker.addEventListener('input', e => this.onColorChange(e, stopIndex));
        inputColorText.addEventListener('input', e => this.onColorChange(e, stopIndex));
        handler.addEventListener('mousedown', e => this.onHandlerMouseDown(e));
        handler.addEventListener('mouseup', e => this.onHandlerMouseUp(e));
        this.previewEl.addEventListener('mousemove', e => this.onHandlerMouseMove(e));
        handlerRemover.addEventListener('click', () => {
            this.stops.splice(stopIndex, 1);
            handler.remove();
            handlerButtons.remove();
            this.updateElementBackground();
        });
        handlerButtons.append(inputColorWrapper, handlerRemover);
        this.previewEl.append(handler);
        this.colorHandlersEl.append(handlerButtons);
    }
    onHandlerMouseDown(event) {
        let handlerEl = event.target;
        handlerEl.classList.add('active');
        this.isDragging = true;
    }
    onHandlerMouseMove(event) {
        if (!this.isDragging)
            return;
        let handlerEl = document.querySelector('.gradient-picker__preview-handler.active');
        if (!handlerEl?.classList.contains('active'))
            return;
        const stopIndex = ~~(handlerEl.getAttribute('data-index') || 0);
        const newStopPosition = this.getPercentage(event.clientX);
        if (newStopPosition < 0.5 || newStopPosition > 99.5)
            return;
        this.changePosition(stopIndex, newStopPosition);
        this.updateElementBackground();
    }
    onHandlerMouseUp(event) {
        let handlerEl = event.target;
        handlerEl.classList.remove('active');
        this.isDragging = false;
    }
    changeColor(stopIndex, color) {
        this.stops[stopIndex].color = color;
        this.colorHandlersEl.querySelectorAll(`input[data-index-color='${stopIndex}']`).forEach((el) => el.value = color);
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => el.style.setProperty('--handler-color', color));
    }
    changePosition(stopIndex, position) {
        this.stops[stopIndex].position = position;
        const stopPositionCeil = Math.ceil(position);
        this.previewEl.querySelectorAll(`div.gradient-picker__preview-handler[data-index='${stopIndex}']`).forEach((el) => el.style.setProperty('--handler-position', position + '%'));
        this.colorHandlersEl.querySelectorAll(`div.gradient-picker__colors-variation[data-index='${stopIndex}']`).forEach((el) => el.style.setProperty('--color-order', stopPositionCeil.toString()));
    }
    onColorChange(event, index) {
        this.changeColor(index, event.target.value);
        this.updateElementBackground();
    }
    getPercentage(mouseX) {
        const rect = this.previewEl.getBoundingClientRect();
        const clickPosition = mouseX - rect.x;
        const elementWidth = getComputedStyle(this.previewEl).width.slice(0, -2);
        const newStopPosition = clickPosition / ~~elementWidth * 100;
        return newStopPosition;
    }
    listener() {
        this.previewEl.addEventListener('click', e => {
            if (e.target.classList.contains('gradient-picker__preview-handler') || this.isDragging)
                return;
            if (!this.previewEl.contains(e.target))
                return;
            const newStopPosition = this.getPercentage(e.clientX);
            this.addColorStop("#333333", newStopPosition);
        });
        this.directionInput?.addEventListener('input', () => {
            this.direction = this.directionInput?.value;
            this.updateElementBackground();
        });
        this.typeInput?.addEventListener('input', () => {
            this.type = this.typeInput?.value;
            this.updateElementBackground();
        });
    }
}

export { GradientPicker };
