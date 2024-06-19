import { GradientPicker } from './gradient'
import './style.css'
import './picker.scss'


const el = document.getElementById('card-app')!

// TODO: publish UI library
new GradientPicker({
  el: el
})

const copyCssButton = document.getElementById('copy-css')
copyCssButton?.addEventListener('click', () => {
  let textarea = document.querySelector("#css") as HTMLTextAreaElement;
  navigator.clipboard.writeText(textarea.value);
  
  // Show "Copied!" text
  const copiedEl = document.getElementById('copied')
  copiedEl?.classList.add('show')
  setTimeout(() => copiedEl?.classList.remove('show'), 500);
})