// controller.js
import { Card, GameModel } from './model.js';

let model = new GameModel();

// ViewModelMapping ? 

const userInput = {
    moveCardDragging: {
        dragStart(e) {
            e.dataTransfer.setData('text/plain', e.target.id); // set element id for transfer
        },
        dragOver(e) {
            e.preventDefault();
        },
        drop(e) { // drop the card if its on a row
            e.preventDefault();
            const cardId = e.dataTransfer.getData('text/plain'); // data was set to card.id
            const isValidMove = inputValidation.verifyCardMove(cardId, e.target.id);
            if(!isValidMove){
                alert("Not a valid target.");
            }
        }
    },
    moveCardTouch: {
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
        touchEnd(e) { // stop dragging (reset positioning) & if drag stopped over row add card
            e.preventDefault();
            const element = e.target;
            if (element.draggable) {
                // reset that card was brought to front
                element.style.position = '';
                element.style.zIndex = '';
                // Check if the card is being dropped onto a valid row
                const touch = e.changedTouches[0];
                const dropTargets = document.elementsFromPoint(touch.clientX, touch.clientY);
                let isValidMove = false;
                for (let target of dropTargets) {
                    isValidMove = inputValidation.verifyCardMove(element.id, target.id);
                    if(isValidMove){
                        break;
                    }
                }
                if (!isValidMove) { alert("Not a valid target."); }
            }
        }
    },
    buttons: {
        endTurnButtonPlayer1() {
            const isVerified = inputValidation.verifyEndTurn("player1");
            if (!isVerified) { 
                alert("End turn was not legal."); 
            }
        },
        endTurnButtonPlayer2() {
            const isVerified = inputValidation.verifyEndTurn("player2");
            if (!isVerified) { 
                alert("End turn was not legal.");
            }
        }
    }
}

const inputValidation = { // (updateModel)
    verifyCardMove(cardElementId, targetElementId) {
        const cardId = cardElementId.split('-')[1];
        const cardModel = model.cardLookup[cardId];
        const targetModelId = targetElementId.split('-')[0];
        const isValidMove = this.modelRequests.cardMoveRequest(cardModel, targetModelId)
        return isValidMove
    },
    verifyEndTurn(player){
        const isVerified = this.modelRequests.endTurnRequest(player);
        return isVerified;
    },
    modelRequests: {
        cardMoveRequest(cardModel, targetModelId) {
            const wasCardplayed = model.moveCard(cardModel, targetModelId);
            return wasCardplayed;
        },
        endTurnRequest(player) {
            const isVerified = model.endTurn(player);
            return isVerified;
        }
    }
}

const updateView = {
    renderFull() {
        // pure html manipulation
        this.staticDomUpdate.renderHandCards();
        this.staticDomUpdate.renderBoardCards();
        this.staticDomUpdate.renderPlayerInfo();
        this.staticDomUpdate.renderBoardInfo();
        
        // add event binding to all cards 
        const cards = document.querySelectorAll('.card');
        cards.forEach(cardElement => {
            const cardId = cardElement.id.split('-')[1];
            const cardModel = model.cardLookup[cardId]
            if(cardModel.owner === model.currentPlayer) { 
                cardElement.setAttribute("draggable", "true");
                this.eventBinding.addCardListeners(cardElement);
            }
        });

        // event binding for rows
        const rows = document.querySelectorAll('.cards');
        rows.forEach(row => { 
            if(["water-cards", "fire-cards", "air-cards", "earth-cards"].includes(row.id)){
                this.eventBinding.addRowListeners(row);
            }
        });

        // other event binding 
        this.eventBinding.addButtonListeners()
    },
    staticDomUpdate: {
        cardToHTML(card) {
            const cardElement = document.createElement('div');
            cardElement.id = `card-${card.id}`;
            const playerCSS = card.owner === 'player1' ? 'player-one' : 'player-two'; 
            cardElement.className = `card ${playerCSS}`;
            cardElement.innerHTML = `Strength: ${card.strength}<br>Type: ${card.cardType}`;
            cardElement.dataset.strength = card.strength;
            cardElement.dataset.cardType = card.cardType;
            return cardElement;
        },
        renderHandCards() {
            const handModel = model.hand;
            const handCardContainers = {
                // Mapping: id in model: html Element
                player1: document.getElementById('player-one-cards-hand'),
                player2: document.getElementById('player-two-cards-hand')
            };
            for (const playerIndex in handModel) {
                // reset view
                handCardContainers[playerIndex].innerHTML = '';
                // render cards according to model
                let cards = handModel[playerIndex];
                cards.forEach(card => { 
                    const cardElement = this.cardToHTML(card);
                    handCardContainers[playerIndex].appendChild(cardElement);
                })
            }
        },
        renderBoardCards() {
            const boardModel = model.board;
            const rowCardContainers = {
                // Mapping: id in model: html Element
                fire: document.getElementById('fire-cards'),
                water: document.getElementById('water-cards'),
                air: document.getElementById('air-cards'),
                earth: document.getElementById('earth-cards')
            };        
            // create card div for each card in model
            for (const rowIndex in boardModel) {
                // reset view
                rowCardContainers[rowIndex].innerHTML = '';
                // render cards according to model
                let cards = boardModel[rowIndex];
                cards.forEach(card => { 
                    const cardElement = this.cardToHTML(card);
                    rowCardContainers[rowIndex].appendChild(cardElement);
                })
            }
        },
        renderPlayerInfo() {
            const infoModel = model.info;
            const rowCardContainers = {
                player1Coin: document.getElementById('player-one-info-coin'),
                player2Coin: document.getElementById('player-two-info-coin'),
                player1Magic: document.getElementById('player-one-info-magic'),
                player2Magic: document.getElementById('player-two-info-magic')
            };        
            for (const index in infoModel) {
                const modelValue = infoModel[index];
                const htmlElement = rowCardContainers[index];
                htmlElement.innerHTML = modelValue;
            }
        },
        renderBoardInfo() {
            const infoModel = model.rowOwner;
            const rowCardContainers = {
                fire: document.getElementById('fire-info'),
                water: document.getElementById('water-info'),
                air: document.getElementById('air-info'),
                earth: document.getElementById('earth-info')
            };        
            for (const index in infoModel) {
                const modelValue = infoModel[index];
                const rowHeader = rowCardContainers[index];
                if (modelValue === "player1") { rowHeader.style.backgroundColor = 'antiquewhite'; }
                else if (modelValue === "player2") { rowHeader.style.backgroundColor = 'lightblue'; }
                else { rowHeader.style.backgroundColor = ''; }
            }
        }
    },
    eventBinding: {
        addCardListeners(card){
            // allow drag start & touch start
            card.addEventListener('dragstart', userInput.moveCardDragging.dragStart);
            card.addEventListener('touchstart', userInput.moveCardTouch.touchStart, { passive: false }); // passive: false to prevent default behavior
            card.addEventListener('touchmove', userInput.moveCardTouch.touchMove, { passive: false });
            card.addEventListener('touchend', userInput.moveCardTouch.touchEnd, { passive: false }); // touch end works different from drop - see function touchEnd
        },
        addRowListeners(row){
            // enable drops
            row.addEventListener('dragover', userInput.moveCardDragging.dragOver);
            row.addEventListener('drop', userInput.moveCardDragging.drop);
        },
        addButtonListeners(){
            document.getElementById("player-one-end-turn").addEventListener('click', userInput.buttons.endTurnButtonPlayer1);
            document.getElementById("player-two-end-turn").addEventListener('click', userInput.buttons.endTurnButtonPlayer2);
            const opponentButtonId = model.currentPlayer === "player1" ? "player-two-end-turn": "player-one-end-turn";
            const playerButtonId = model.currentPlayer === "player1" ? "player-one-end-turn" : "player-two-end-turn";
            document.getElementById(opponentButtonId).setAttribute('disabled', true);  
            if (document.getElementById(playerButtonId).hasAttribute('disabled')) {
                document.getElementById(playerButtonId).removeAttribute('disabled');
            }
        }
    }
}

// On initial load
document.addEventListener('DOMContentLoaded', () => {
    // Subscribe to model for render updates
    model.onModelChanged(() => {
        updateView.renderFull(); 
    });
    // initital render
    model.start();
});