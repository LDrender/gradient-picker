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

When initialized, the gradient picker:
1. Replaces the target element with the picker interface
2. Creates a hidden input with the target element's ID
3. Updates the input value whenever the gradient changes
4. Maintains the original element's form functionality

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