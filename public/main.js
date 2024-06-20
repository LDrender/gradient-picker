import { GradientPicker } from '../src/gradient.ts'
import '../src/gradient-picker.scss'

const el = document.getElementById('card-app')
const el2 = document.getElementById('card-app-2')

// TODO: publish UI library
new GradientPicker({
  el: el,
  stops: [
    { color: '#af68fe', position: 9 },
    { color: '#65dfff', position: 75 },
  ],
  directionType: "percent",
})
new GradientPicker({
  el: el2,
  stops: [
    { color: '#af68fe', position: 9 },
    { color: '#65dfff', position: 75 },
  ],
  directionType: "select",
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