
<h1 align="center">Gradient Picker</h1>

<p align="center">A website that allows you to create your own gradient</p>

![image](https://github.com/LDrender/gradient-picker/blob/master/gradient-picker.png)

## Installation

```bash 
  npm install @ldrender/gradient-picker
```

## Development or Build

```bash
  npm run dev
```
  
```bash
  npm run build
```

## Usage

```javascript
import GradientPicker from '@ldrender/gradient-picker';
import '@ldrender/gradient-picker/dist/gradient-picker.css';

const gradientPicker = new GradientPicker({
  el: document.querySelector('#gradient-picker'),
  stops: [
    { color: '#ff0000', offset: 0 },
    { color: '#00ff00', offset: 50 },
    { color: '#0000ff', offset: 100 },
  ],
  type: "linear",
  directionType: "percent",
  direction: 90,
  returnType: "object",
})
```

## API Documentation

### GradientPicker Instance

#### `new GradientPicker(options: GradientPickerOptions): GradientPicker`

Create a new instance of GradientPicker.
Your element is replaced by the gradient picker. But an input is created with your element id and the value is the gradient string. You can use this input to send the gradient to your server for example.

If your element is input and he have value then value use to generate colorSteps
Value = Methods getGradient(): object

#### `GradientPickerOptions`

| Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| defaultElement | ID | | The element where the gradient picker will be created |
| stops? | GradientStop[] | | The initial stops of the gradient (optional)|
| type? | string('linear' \| 'radial') | 'linear' | The type of gradient (optional)|
| directionType? | string('select' \| 'percent') | 'select' | The type of gradient (optional)|
| direction? | string\|int | 'right' | The direction of the gradient (optional)|
| returnType? | string('string' \| 'object' \| 'stops-list' ) | 'string' | The type of return value (optional)|

##### `GradientStop`

| Name | Type | Description |
| --- | --- | --- |
| id? | number | The id of the stop (optional)|
| color | string | The color of the stop |
| offset | number | The position of the stop |

##### `GradientPickerOptions.direction`

If directionType is 'select' then direction is a string ('top', 'right', 'bottom', 'left', 'center').

### `GradientPicker Methods`

#### `getGradient(): object` (returnType: 'object')

Exemple :
```json
{
    "type": "linear",
    "direction": "right",
    "stops": [
        {
            "color": "#ff0000",
            "offset": 0
        },
        {
            "color": "#00ff00",
            "offset": 50
        },
        {
            "color": "#0000ff",
            "offset": 100
        }
    ]
}
```

#### `getGradientString(): string` (returnType: 'string')

Exemple :
```css
linear-gradient(to right, #ff0000 0%, #00ff00 50%, #0000ff 100%)
```

#### `getStopList(): GradientStop[]` (returnType: 'stops-list')

Exemple :
```json
[
    {
        "color": "#ff0000",
        "offset": 0
    },
    {
        "color": "#00ff00",
        "offset": 50
    },
    {
        "color": "#0000ff",
        "offset": 100
    }
]
```

#### `addColorStop(color: string, offset: number): void`

Add a color stop to the gradient.