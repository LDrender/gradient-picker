import { GradientPicker } from '../src/gradient.ts'
import '../src/gradient-picker.scss'

// TODO: publish UI library
new GradientPicker({
    el: '#gradient-color-1',
    stops: [
        { color: '#af68fe', offset: 9 },
        { color: '#65dfff', offset: 75 },
    ],
    directionType: "percent",
    preview: true,
})
new GradientPicker({
    el: '#gradient-color-2',
    stops: [
        { color: '#1ed760', offset: 9 },
        { color: '#faf200', offset: 75 },
    ],
    directionType: "select",
    returnType: "object",
    preview: true,
})

const copyCssButton = document.getElementById('copy-css')
copyCssButton?.addEventListener('click', () => {
    let textarea = document.querySelector("#css");
    navigator.clipboard.writeText(textarea.value);
    
    // Show "Copied!" text
    const copiedEl = document.getElementById('copied')
    copiedEl?.classList.add('show')
    setTimeout(() => copiedEl?.classList.remove('show'), 500);
})


const gradientColor1 = document.getElementById('gradient-color-1')
gradientColor1?.addEventListener('change', (e) => {
    const textarea = document.querySelector("#css")
    textarea.value = e.target.value
})

const gradientColor2 = document.getElementById('gradient-color-2')
gradientColor2?.addEventListener('change', (e) => {
    const textarea = document.querySelector("#css2")
    textarea.value = e.target.value
})