<h1 align="center">Gradient Picker</h1>

<p align="center">A powerful and customizable gradient picker for modern web applications</p>

<p align="center">
  <img src="https://github.com/LDrender/gradient-picker/blob/master/gradient-picker.png" alt="Gradient Picker Demo" />
</p>

## Features

- 🎨 Intuitive color stop management
- 📐 Support for linear and radial gradients
- 🔄 Multiple direction modes (select or degree)
- 💾 Flexible output formats (CSS string, object, or stops list)
- 📱 Mobile-friendly with touch support
- 🎯 Precise control with numeric inputs
- 🖼️ Optional preview window
- 🌈 Comprehensive color format support (Hex, RGB, HSL, Named Colors)

## Installation

```bash
npm install @ldrender/gradient-picker
```

## Quick Start

```javascript
// Import the package and its styles
import GradientPicker from '@ldrender/gradient-picker';
import '@ldrender/gradient-picker/dist/gradient-picker.css';

// Initialize the gradient picker
const gradientPicker = new GradientPicker({
  el: '#gradient-picker',
  preview: true, // Enable preview window
  stops: [
    { color: '#ff0000', offset: 0 },
    { color: '#00ff00', offset: 50 },
    { color: '#0000ff', offset: 100 }
  ]
});
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Color Support

The gradient picker supports various color formats:

### Supported Formats

```javascript
// Hexadecimal
gradientPicker.addColorStop('#ff0000', 0);    // Standard hex
gradientPicker.addColorStop('#f00', 0);       // Short hex

// RGB/RGBA
gradientPicker.addColorStop('rgb(255, 0, 0)', 0);
gradientPicker.addColorStop('rgba(255, 0, 0, 0.5)', 0);

// HSL/HSLA
gradientPicker.addColorStop('hsl(0, 100%, 50%)', 0);
gradientPicker.addColorStop('hsla(0, 100%, 50%, 0.5)', 0);

// Named Colors
gradientPicker.addColorStop('red', 0);
gradientPicker.addColorStop('blue', 50);
gradientPicker.addColorStop('green', 100);
```

### Color Normalization

All colors are automatically normalized to hexadecimal format internally for consistent handling and optimal performance. This normalization is transparent to the user, and the original color format is preserved in the output when using `getGradientString()`.

### Input Methods

Colors can be input in two ways:
1. Using the color picker input (supports system color picker)
2. Direct text input supporting any valid CSS color format

Example with different formats:
```javascript
// Initialize with various color formats
const gradientPicker = new GradientPicker({
  el: '#gradient-picker',
  preview: true,
  stops: [
    { color: '#ff0000', offset: 0 },          // Hex
    { color: 'rgb(0, 255, 0)', offset: 33 },  // RGB
    { color: 'blue', offset: 66 },            // Named color
    { color: 'hsl(270, 100%, 50%)', offset: 100 } // HSL
  ]
});
```

## Configuration

### Constructor Options

```typescript
interface GradientPickerOptions {
  el: string;                    // Selector for the target element
  stops?: GradientStop[];        // Initial color stops
  type?: 'linear' | 'radial';    // Gradient type (default: 'linear')
  directionType?: 'select' | 'percent'; // Direction input type (default: 'select')
  direction?: string | number;    // Gradient direction (default: 'right')
  returnType?: 'string' | 'object' | 'stops-list'; // Output format (default: 'string')
  preview?: boolean;             // Enable preview window (default: false)
}

interface GradientStop {
  color: string;   // CSS color value (hex, rgb, rgba, etc.)
  offset: number;  // Position in percentage (0-100)
}
```

### Direction Values

- When `directionType: 'select'`:
  - Valid values: `'top'`, `'right'`, `'bottom'`, `'left'`, `'center'`
- When `directionType: 'percent'`:
  - Valid values: `0-360` (degrees)

## Methods

### getGradient()
Returns the gradient configuration as an object.

```typescript
interface GradientObject {
  type: 'linear' | 'radial';
  direction: string | number;
  stops: Array<{ color: string; offset: number; }>;
}

const gradient = gradientPicker.getGradient();
// Example output:
{
  type: "linear",
  direction: "right",
  stops: [
    { color: "#ff0000", offset: 0 },
    { color: "#00ff00", offset: 50 },
    { color: "#0000ff", offset: 100 }
  ]
}
```

### getGradientString()
Returns the gradient as a CSS string.

```javascript
const cssGradient = gradientPicker.getGradientString();
// Example output:
"linear-gradient(to right, #ff0000 0%, #00ff00 50%, #0000ff 100%)"
```

### getStops()
Returns an array of color stops.

```javascript
const stops = gradientPicker.getStops();
// Example output:
[
  { color: "#ff0000", offset: 0 },
  { color: "#00ff00", offset: 50 },
  { color: "#0000ff", offset: 100 }
]
```

### addColorStop(color: string, offset: number)
Adds a new color stop to the gradient.

```javascript
gradientPicker.addColorStop('#ff0000', 25);
```

## DOM Structure

When initialized, the gradient picker creates the following structure:
1. Container element (`gradient-picker`)
2. Preview window (if enabled) (`gradient-picker__preview`)
3. Options section (`gradient-picker__options`)
4. Gradient slider (`gradient-picker__slider`)
5. Color handlers section (`gradient-picker__colors`)
6. Hidden input with the target element's ID

The picker replaces the target element while maintaining the original form functionality.

## Events

The hidden input element fires a `change` event whenever the gradient is modified, allowing you to listen for updates:

```javascript
document.querySelector('#gradient-picker').addEventListener('change', (event) => {
  console.log('New gradient value:', event.target.value);
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.