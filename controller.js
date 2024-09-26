// controller.js
import { Card, GameModel } from './model.js';

const updateDOM = {
    cardToHTML(card) {
        const cardElement = document.createElement('div');
        cardElement.id = `card-${card.id}`;
        cardElement.className = 'card player-one';
        cardElement.innerHTML = `Strength: ${card.strength}<br>Type: ${card.cardType}`;
        cardElement.dataset.strength = card.strength;
        cardElement.dataset.cardType = card.cardType;
        cardElement.draggable = true;
        return cardElement;
    },
    renderHand(handModel) {
        const handCardContainers = {
            player1: document.getElementById('hand-cards-player1'),
            player2: document.getElementById('hand-cards-player2')
        };
        for (const playerIndex in handModel) {
            let cards = handModel[playerIndex];
            cards.forEach(card => { // create card divs and add to container
                const cardElement = this.cardToHTML(card);
                handCardContainers[playerIndex].appendChild(cardElement);
            })
        }
    },
    renderBoard(boardModel) {
        const rowCardContainers = {
            fire: document.getElementById('fire-cards'),
            water: document.getElementById('water-cards'),
            air: document.getElementById('air-cards'),
            earth: document.getElementById('earth-cards')
        };        
        for (const rowIndex in boardModel) {
            console.log(rowIndex)
            let cards = boardModel[rowIndex];
            cards.forEach(card => { // create card divs and add to container
                const cardElement = this.cardToHTML(card);
                console.log(card)
                rowCardContainers[rowIndex].appendChild(cardElement);
            })
        }
    }
}

const dragUtils = {
    dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id); // set element id for transfer
    },
    dragOver(e) {
        e.preventDefault();
    },
    drop(e, validTargetIds) { // drop the card if its on a row
        e.preventDefault();
        const elementId = e.dataTransfer.getData('text/plain'); // data was set to card.id
        const element = document.getElementById(elementId);
        console.log(e.target.id)
        const hasValidId = validTargetIds.some(id => e.target.id === id);
        hasValidId ? document.getElementById(e.target.id).appendChild(element) : console.log("Not a valid drop target.");
    }
}

let currentPlayerCSS = 'player-one'; 
let currentOpponentCSS = 'player-two';

const touchUtils = {
    touchStart(e) { 
        e.preventDefault();
        const element = e.target;
        if (element.draggable) { // if movable by drag / drop then also by touch
            // bring to front
            element.style.position = 'absolute';
            element.style.zIndex = '1000'; 
            // update position
            const touch = e.targetTouches[0];
            element.style.left = `${touch.pageX - element.offsetWidth / 2}px`;
            element.style.top = `${touch.pageY - element.offsetHeight / 2}px`;
        } 
    },
    touchMove(e) { // keep dragging 
        e.preventDefault(); 
        const element = e.target;
        if (element.draggable) { // if movable by drag / drop then also by touch
            // update card position
            const touch = e.targetTouches[0];
            element.style.left = `${touch.pageX - element.offsetWidth / 2}px`;
            element.style.top = `${touch.pageY - element.offsetHeight / 2}px`;
        }
    },
    touchEnd(e, validTargetIds) { // stop dragging (reset positioning) & if drag stopped over row add card
        e.preventDefault();
        const element = e.target;
        if (element.draggable) {
            // reset that card was brought to front
            element.style.position = '';
            element.style.zIndex = '';
            // Check if the card is being dropped onto a valid row
            const touch = e.changedTouches[0];
            const dropTargets = document.elementsFromPoint(touch.clientX, touch.clientY);
            for (let target of dropTargets) {
                const hasValidId = validTargetIds.some(id => target.id === id);
                if (hasValidId) {
                    document.getElementById(target.id).appendChild(element);
                    break;
                }
            }
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const model = new GameModel();

    const c1 = new Card("1", 1, "warrior", "player1");
    const c2 = new Card("2", 3, "wizzard", "player1");
    model.addCardToHand("player1", c1);
    model.addCardToHand("player1", c2);
    model.moveCardFromHandToBoard("player1", 1, "water");

    function render() {
        updateDOM.renderHand(model.hand);
        updateDOM.renderBoard(model.board);
        // add eventBinding
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => { 
            card.addEventListener('dragstart', dragUtils.dragStart);
            card.addEventListener('touchstart', touchUtils.touchStart, { passive: false }); // passive: false to prevent default behavior
            card.addEventListener('touchmove', touchUtils.touchMove, { passive: false });
            card.addEventListener('touchend', (e) => touchUtils.touchEnd(e, ["water-cards", "fire-cards", "air-cards", "earth-cards"]), { passive: false }); // touch end works different from drop - see function touchEnd
        });
        
        // enable drops
        const rows = document.querySelectorAll('.row');
        rows.forEach(row => { 
            row.addEventListener('dragover', dragUtils.dragOver);
            row.addEventListener('drop', (e) => dragUtils.drop(e, ["water-cards", "fire-cards", "air-cards", "earth-cards"]));
        });
    }

    render(); 

});
