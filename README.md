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
- 🔍 CSS gradient string parsing
- 💨 Performance optimized with color caching
- ✅ Built-in validation
- 📝 Named color support (140+ CSS colors)

## Installation

```bash
npm install @ldrender/gradient-picker
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Quick Start

```javascript
import GradientPicker from '@ldrender/gradient-picker';
import '@ldrender/gradient-picker/dist/gradient-picker.css';

const gradientPicker = new GradientPicker({
  el: '#gradient-picker',
  preview: true,
  stops: [
    { color: '#ff0000', offset: 0 },
    { color: 'rgb(0, 255, 0)', offset: 33 },
    { color: 'blue', offset: 66 },
    { color: 'hsl(270, 100%, 50%)', offset: 100 }
  ]
});
```

## Configuration

### Constructor Options

```typescript
interface GradientPickerProps {
  el: string;                    // Selector for the target element
  stops?: GradientStop[];        // Initial color stops
  type?: 'linear' | 'radial';    // Gradient type (default: 'linear')
  direction?: string | number;    // Gradient direction (default: 'right')
  directionType?: 'select' | 'percent'; // Direction input type (default: 'select')
  directionRadial?: boolean;     // For gradient type 'radial', select if direction input is displayed (default: true)
  returnType?: 'string' | 'object' | 'stops-list'; // Output format (default: 'string')
  preview?: boolean;             // Enable preview window (default: false)
}

interface GradientStop {
  color: string;   // CSS color value
  offset: number;  // Position in percentage (0-100)
  id: number;      // Unique identifier
}
```

### Return Types

- `string`: CSS gradient string
- `object`: Gradient configuration object
- `stops-list`: Array of color stops only

## Methods

### Core Methods

#### getGradient()
Returns the gradient configuration as an object.

```typescript
interface GradientObject {
  type: 'linear' | 'radial';
  direction: string | number;
  stops: Array<{ color: string; offset: number; }>;
}
```

#### getStops()
Returns an array of color stops.

#### addColorStop(color: string, offset: number)
Adds a new color stop to the gradient.

### Additional Methods

#### importFromCSSString(gradientStr: string)
Parses and imports a CSS gradient string.

```javascript
gradientPicker.importFromCSSString('linear-gradient(to right, #ff0000 0%, #00ff00 50%)');
```

#### initDirection(directionType: 'select' | 'percent')
Changes the direction input type dynamically.

## Events

### Change Event
Fired whenever the gradient is modified:

```javascript
document.querySelector('#gradient-picker').addEventListener('change', (event) => {
  const value = event.target.value;
  // value format depends on returnType option
});
```

### Error Handling

The picker includes built-in validation for:
- Color formats
- Stop positions (0-100)
- Minimum number of stops (2)
- Direction values

```javascript
try {
  gradientPicker.addColorStop('invalid-color', 50);
} catch (error) {
  console.error('Invalid color format');
}
```

## Gradient Type Support

### Linear Gradients

- integer: `0 - 360`
- string: `top`, `right`, `bottom`, `left`

### Radial Gradients

- string: `top`, `right`, `bottom`, `left`, `center`
- integer: `0` = `at center`
- integer: `1 - 89` = `at center top`
- integer: `90 - 179` = `at center right`,
- integer: `180 - 269` = `at center bottom`,
- integer: `270 - 359` = `at center left`
- integer: `360` = `at center top`

## Color Support

### Supported Formats

- Hexadecimal: `#ff0000`, `#f00`
- RGB/RGBA: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
- HSL/HSLA: `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)`
- Named Colors: `red`, `blue`, `forestgreen`, etc.

#### Examples

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

### Color Caching

The picker includes an optimized color normalization system with caching for improved performance.

### Named Colors

Supports all standard CSS color names (140+ colors). Full list available in the source code.
<a href="https://github.com/LDrender/gradient-picker/blob/master/colorReference.md" target="_blank">Named Colors List supporter</a>

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Performance Considerations

- Efficient color caching system
- Debounced updates for smooth interactions
- Optimized DOM manipulation
- Event delegation for color stops

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.