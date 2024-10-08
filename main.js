const Utils = {
    setDragAndDrop() { // initialize drag/drop & touch event listeners
        // enable drags
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => { 
            card.addEventListener('dragstart', Utils.dragStart);
            card.addEventListener('touchstart', Utils.touchStart, { passive: false }); // passive: false to prevent default behavior
            card.addEventListener('touchmove', Utils.touchMove, { passive: false });
            card.addEventListener('touchend', Utils.touchEnd, { passive: false }); // touch end works different from drop - see function touchEnd
        });
        
        // enable drops
        const rows = document.querySelectorAll('.row');
        rows.forEach(row => { 
            row.addEventListener('dragover', Utils.dragOver);
            row.addEventListener('drop', Utils.drop);
        });
    },
    dragStart(e) { // drag a card if its the current players'
        const card = e.target;
        card.classList.contains(currentPlayer) ? e.dataTransfer.setData('text/plain', card.id) : e.preventDefault(); // Prevent dragging if it's not the player's card
    },
    dragOver(e) {
        e.preventDefault();
    },
    drop(e) { // drop the card if its on a row
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain'); // data was set to card.id
        const card = document.getElementById(cardId);
        console.log(e.target.classList)
        e.target.classList.contains('row') ? e.target.appendChild(card) : console.log("Not a valid drop target.");
    },
    touchStart(e) { // start dragging card if current players
        e.preventDefault();
        const card = e.target;
        if (card.classList.contains(currentPlayer)) {
            // bring to front
            card.style.position = 'absolute';
            card.style.zIndex = '1000'; 
            
            // update card position
            const touch = e.targetTouches[0];
            card.style.left = `${touch.pageX - card.offsetWidth / 2}px`;
            card.style.top = `${touch.pageY - card.offsetHeight / 2}px`;
        } 
    },
    touchMove(e) { // keep dragging (updating displayed position of card) if current players 
        e.preventDefault(); 
        const card = e.target;
        if (card.classList.contains(currentPlayer)) {
            // update card position
            const touch = e.targetTouches[0];
            card.style.left = `${touch.pageX - card.offsetWidth / 2}px`;
            card.style.top = `${touch.pageY - card.offsetHeight / 2}px`;
        }
    },
    touchEnd(e) { // stop dragging (reset positioning) & if drag stopped over row add card
        e.preventDefault();
        const card = e.target;
        if (card.classList.contains(currentPlayer)) {
            // reset that card was brought to front
            card.style.position = '';
            card.style.zIndex = '';
            
            // Check if the card is being dropped onto a valid row
            const touch = e.changedTouches[0];
            const dropTargets = document.elementsFromPoint(touch.clientX, touch.clientY);
            for (let target of dropTargets) {
                if (target.classList.contains('row')) {
                    target.appendChild(card);
                    break;
                }
            }
        }
    }
}
const CombatUtils = {
    resolveWizardCombat(row, defenderCards, attackerCards) {
        let defenderWizardAttack = this.calculateWizardAttack(defenderCards);
        let attackerWizardAttack = this.calculateWizardAttack(attackerCards);
        setTimeout(() => {
            this.applyWizardAttack(row, defenderCards, attackerWizardAttack);
            this.applyWizardAttack(row, attackerCards, defenderWizardAttack);
        }, 900);
    },
    calculateWizardAttack(cards) {
        let wizardAttack = 0;
        cards.forEach(card => {
            if (card.getAttribute('data-type') === 'wizard') {
                wizardAttack = Math.max(wizardAttack, parseInt(card.getAttribute('data-strength')));
            }
        });
        return wizardAttack;
    },
    applyWizardAttack(row, cards, opponentWizardAttack) {
        cards.forEach(card => {
            let currentStrength = parseInt(card.getAttribute('data-strength'));
            const cardType = card.getAttribute('data-type');
            currentStrength -= opponentWizardAttack;
            if (currentStrength <= 0) {
                row.removeChild(card);
            } else {
                card.setAttribute('data-strength', currentStrength);
                card.innerHTML = `ID: ${card.id}<br>Strength: ${currentStrength}<br>Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`;
            }
        });
    },
    resolveCloseCombat(row, defenderCards, attackerCards) {
        if (defenderCards.length > 0 && attackerCards.length > 0) {
            // Take the last card from the defender and the first card from the attacker
            let defenderCard = defenderCards[defenderCards.length - 1]; // Peek at the last card of the defender
            let attackerCard = attackerCards[0]; // Peek at the first card of the attacker
    
            // Add highlight effect
            defenderCard.classList.add('highlight');
            attackerCard.classList.add('highlight');
    
            let defenderStrength = parseInt(defenderCard.getAttribute('data-strength'));
            let attackerStrength = parseInt(attackerCard.getAttribute('data-strength'));
    
            const defenderType = defenderCard.getAttribute('data-type');
            const attackerType = attackerCard.getAttribute('data-type');
    
            setTimeout(() => {
                // Remove the highlight effect after 900ms
                defenderCard.classList.remove('highlight');
                attackerCard.classList.remove('highlight');
    
                if (defenderStrength > attackerStrength) {
                    defenderStrength -= attackerStrength;
                    defenderCard.setAttribute('data-strength', defenderStrength);
                    defenderCard.innerHTML = `ID: ${defenderCard.id}<br>Strength: ${defenderStrength}<br>Type: ${defenderType.charAt(0).toUpperCase() + defenderType.slice(1)}`;
                    attackerCards.shift(); // Remove the defeated attacker card
                    row.removeChild(attackerCard);
                } else if (attackerStrength > defenderStrength) {
                    attackerStrength -= defenderStrength;
                    attackerCard.setAttribute('data-strength', attackerStrength);
                    attackerCard.innerHTML = `ID: ${attackerCard.id}<br>Strength: ${attackerStrength}<br>Type: ${attackerType.charAt(0).toUpperCase() + attackerType.slice(1)}`;
                    defenderCards.pop(); // Remove the defeated defender card
                    row.removeChild(defenderCard);
                } else {
                    defenderCards.pop(); // Remove the defeated defender card
                    attackerCards.shift(); // Remove the defeated attacker card
                    row.removeChild(defenderCard);
                    row.removeChild(attackerCard);
                }
    
                // Filter out cards that have been removed from the DOM
                defenderCards = defenderCards.filter(card => card.parentNode !== null);
                attackerCards = attackerCards.filter(card => card.parentNode !== null);
    
                // Recursive call to handle the next close combat after 900ms
                setTimeout(() => {
                    CombatUtils.resolveCloseCombat(row, defenderCards, attackerCards);
                }, 900);
            }, 900);
        }
    }
}

let currentPlayer = 'player-one'; // Track the current player
let currentOpponent = 'player-two';
let cardCounter = 11;

// initialize state
window.onload = Utils.setDragAndDrop();

document.querySelector('.player-one button').addEventListener('click', endTurnButton);
document.querySelector('.player-two button').addEventListener('click', endTurnButton);
document.querySelector(`.${currentOpponent} button`).setAttribute('disabled', true);

function createNewCardForPlayer(player) {
    const newCard = document.createElement("div");
    // generate random values
    const strength = Math.floor(Math.random() * 5) + 1; // Generate random strength between 1 and 5
    const cardId = "card" + cardCounter; // Generate unique card ID
    const cardTypes = ['wizard', 'warrior', 'apprentice', 'farmer'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    // set card values
    newCard.setAttribute("id", cardId);
    newCard.classList.add("card");
    newCard.classList.add(player);
    player === currentPlayer ? newCard.setAttribute("draggable", "true") : newCard.setAttribute("draggable", "false");
    newCard.setAttribute("data-strength", strength); // Set strength as a data attribute
    newCard.setAttribute("data-type", cardType); // Set type as a data attribute
    newCard.innerHTML = `ID: ${cardId}<br>Strength: ${strength}<br>Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`; // Set text content with type
    // add event listener
    newCard.addEventListener('dragstart', (e) => Utils.dragStart(e));
    newCard.addEventListener('touchstart', (e) => Utils.touchStart(e), { passive: false }); // passive: false to prevent default behavior
    newCard.addEventListener('touchmove', (e) => Utils.touchMove(e), { passive: false });
    newCard.addEventListener('touchend', (e) => Utils.touchEnd(e), { passive: false });
    // add card to hand
    const playerHand = document.querySelector(`.hand-container.${player} .hand-cards`);
    playerHand.insertBefore(newCard, playerHand.children[0]); 
    cardCounter++;
}
function separatePlayerCards(cards) {
    let playerOneCards = [];
    let playerTwoCards = [];
    cards.forEach(card => {
        if (card.classList.contains('player-one')) {
            playerOneCards.push(card);
        } else if (card.classList.contains('player-two')) {
            playerTwoCards.push(card);
        }
    });
    return { playerOneCards, playerTwoCards };
}

function endTurnButton() {
    // switch players
    [currentPlayer, currentOpponent] = currentPlayer === 'player-one' ? ['player-two', 'player-one'] : ['player-one', 'player-two'];
    createNewCardForPlayer(currentPlayer);
    // disallow dragging for opponent & disable button
    const playerCards = document.querySelectorAll(`.${currentOpponent}.card`);
    playerCards.forEach(card => {
        card.setAttribute('draggable', 'false')
        card.classList.remove('card-hover')
    });
    document.querySelector(`.${currentOpponent} button`).setAttribute('disabled', true);
    // allow dragging for player & enable button
    const nextPlayerCards = document.querySelectorAll(`.${currentPlayer}.card`);
    nextPlayerCards.forEach(card => {
        card.setAttribute('draggable', 'true')
        card.classList.add('card-hover')
    });
    document.querySelector(`.${currentPlayer} button`).removeAttribute('disabled');
    // resolve board state
    const rows = document.querySelectorAll('.row');
    rows.forEach((row) => {
        // Combat
        let cards = Array.from(row.children).filter(child => child.classList.contains('card'));
        if (cards.length > 1) {
            const { playerOneCards, playerTwoCards } = separatePlayerCards(cards);            
            // first card in a row determines who is defender
            let defenderCards, attackerCards;
            [defenderCards, attackerCards] = cards[0].classList.contains('player-one') ? [playerOneCards, playerTwoCards] : [playerTwoCards, playerOneCards];
            CombatUtils.resolveWizardCombat(row, defenderCards, attackerCards)
            // Filter out cards that have been removed from the DOM
            defenderCards = defenderCards.filter(card => card.parentNode !== null);
            attackerCards = attackerCards.filter(card => card.parentNode !== null);
            CombatUtils.resolveCloseCombat(row, defenderCards, attackerCards);
        }
        // Farming on remaining cards 
        cards = Array.from(row.children).filter(child => child.classList.contains('card'));
        if (cards.length > 0) {
            cards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                const cardStrength = parseInt(card.getAttribute('data-strength'));
                let playerSelector = card.classList.contains('player-one') ? '.player-one': 'player-two';
                if (cardType === 'apprentice') {
                    // Add to magic count
                    const magicElement = document.querySelector(`.hand-container${playerSelector} .magic`);
                    const currentMagic = parseInt(magicElement.textContent);
                    magicElement.textContent = currentMagic + cardStrength;
                } else if (cardType === 'farmer') {
                    // Add to coin count
                    const coinElement = document.querySelector(`.hand-container${playerSelector} .coin`);
                    const currentCoin = parseInt(coinElement.textContent);
                    coinElement.textContent = currentCoin + cardStrength;
                }
            });
        } 
    });}

