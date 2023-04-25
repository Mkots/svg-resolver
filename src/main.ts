import './style.css'

import {CanvasHandler, ResolvedImages} from "./canvas";

function displaySuggestions(suggestions: ResolvedImages | undefined) {
    if (!suggestions) return;
    const suggestionsEl = document.getElementById('suggestions');
    suggestionsEl!.innerHTML = '';

    for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];

        const img = document.createElement('img');
        img.setAttribute('src', suggestion.url);
        img.setAttribute('width', '80');
        img.setAttribute('height', '80');
        img.style.border = '1px solid black';
        img.onerror = function() {
            this.remove();
        };

        const imgWrapper = document.createElement('div');
        imgWrapper.setAttribute('style', 'width:80px;height:80px;');
        imgWrapper.appendChild(img);
        suggestionsEl!.appendChild(imgWrapper);
    }
}

const canva = new CanvasHandler(displaySuggestions);
canva.init()

document.addEventListener('click', function(event: MouseEvent) {
    const clickedEl = event.target as HTMLElement;
    if (clickedEl?.tagName === 'IMG' && clickedEl.parentElement?.parentElement?.id === 'suggestions') {
        pickSuggestion(clickedEl.getAttribute('src'));
    }
});

function pickSuggestion(src: string | null) {
    if(!src) return;
    canva.erase();
    const img = new Image();
    img.onload = () => {
        canva.ctx?.drawImage(img, 0, 0);
    }
    img.src = src;
}

document.querySelector("#save")?.addEventListener('click', () => canva.save());
document.querySelector('#clear')?.addEventListener('click', () => canva.erase())

