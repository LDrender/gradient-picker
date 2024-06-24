
<h1 align="center">Gradient Picker</h1>

<p align="center">A website that allows you to create your own gradient</p>

![image](https://github.com/LDrender/gradient-picker/blob/master/gradient-picker.png)

## Installation

```bash 
  npm install @ldrender/gradient-picker
```

## Usage

```javascript
import GradientPicker from '@ldrender/gradient-picker';
import '@ldrender/gradient-picker/dist/gradient-picker.css';

const gradientPicker = new GradientPicker({
  el: document.querySelector('#gradient-picker'),
  stops: [
    { color: '#ff0000', position: 0 },
    { color: '#00ff00', position: 50 },
    { color: '#0000ff', position: 100 },
  ],
  directionType: "percent",
})
```

## API Documentation

### GradientPicker Instance

#### `new GradientPicker(options: GradientPickerOptions): GradientPicker`

Create a new instance of GradientPicker.

#### `GradientPickerOptions`

| Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| el | HTMLElement | | The element to render the gradient picker |
| stops? | GradientStop[] | | The initial stops of the gradient (optional)|
| directionType? | string('select' \| 'percent') | 'select' | The type of gradient (optional)|

#### `GradientStop`

| Name | Type | Description |
| --- | --- | --- |
| id? | number | The id of the stop (optional)|
| color | string | The color of the stop |
| position | number | The position of the stop |

#### `GradientPicker Methods`

##### `getGradient(): object`

Exemple :
```json
{
    "type": "linear",
    "direction": "to right",
    "stops": [
        {
        "color": "#ff0000",
        "position": 0
        },
        {
            "color": "#00ff00",
            "position": 1
        }
    ]
}
```

##### `getGradientString(): string`

Exemple :
```css
linear-gradient(to right, #ff0000 0%, #00ff00 100%)
```

##### `addColorStop(color: string, position: number): void`

Add a color stop to the gradient.

