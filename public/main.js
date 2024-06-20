import { GradientPicker } from '../src/gradient.ts'
import '../src/gradient-picker.scss'

const el = document.getElementById('card-app')

// TODO: publish UI library
new GradientPicker({
  el: el,
  directionType: "percent",
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