let currentPlayer = 'player-one'; // Track the current player

function initializeDragAndDrop() { // initialize drag/drop & touch event listeners
    // enable drags
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => { 
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('touchstart', touchStart, { passive: false }); // passive: false to prevent default behavior
        card.addEventListener('touchmove', touchMove, { passive: false });
        card.addEventListener('touchend', touchEnd, { passive: false }); // touch end works different from drop - see function touchEnd
    });
    
    // enable drops
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => { 
        row.addEventListener('dragover', dragOver);
        row.addEventListener('drop', drop);
    });
}

function dragStart(e) { // drag a card if its the current players'
    const card = e.target;
    card.classList.contains(currentPlayer) ? e.dataTransfer.setData('text/plain', card.id) : e.preventDefault(); // Prevent dragging if it's not the player's card
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) { // drop the card if its on a row
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain'); // data was set to card.id
    const card = document.getElementById(cardId);
    e.target.classList.contains('row') ? e.target.appendChild(card) : console.log("Not a valid drop target.");
}

function touchStart(e) { // start dragging card if current players
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
}

function touchMove(e) { // keep dragging (updating displayed position of card) if current players 
    e.preventDefault(); 
    const card = e.target;
    if (card.classList.contains(currentPlayer)) {
        // update card position
        const touch = e.targetTouches[0];
        card.style.left = `${touch.pageX - card.offsetWidth / 2}px`;
        card.style.top = `${touch.pageY - card.offsetHeight / 2}px`;
    }
}

function touchEnd(e) { // stop dragging (reset positioning) & if drag stopped over row add card
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

window.onload = initializeDragAndDrop;



// Function to handle turn ending logic
function endTurn(player) {
    currentPlayer = player === 'player-one' ? 'player-two' : 'player-one'; // Switch current player

    // Disable the current player's cards
    const playerCards = document.querySelectorAll(`.${player} .card`);
    playerCards.forEach(card => {
        card.setAttribute('draggable', 'false');
    });

    // Enable the next player's cards
    const nextPlayerCards = document.querySelectorAll(`.${currentPlayer} .card`);
    nextPlayerCards.forEach(card => {
        card.setAttribute('draggable', 'true');
    });

    // Switch buttons
    document.querySelector(`.${player} button`).setAttribute('disabled', true);
    document.querySelector(`.${currentPlayer} button`).removeAttribute('disabled');
}

// Initialize the drag-and-drop functionality on page load


/*


function createNewCardForPlayer(player) {
    const newCard = document.createElement("div");
    newCard.classList.add("card");

    const strength = Math.floor(Math.random() * 5) + 1; // Generate random strength between 1 and 5
    const cardId = "card" + cardCounter; // Generate unique card ID

    // Randomly assign type as either "wizard" or "warrior"
    const cardType = Math.random() < 0.5 ? 'wizard' : 'warrior';

    newCard.setAttribute("id", cardId);
    newCard.setAttribute("draggable", "true");
    newCard.setAttribute("ondragstart", "drag(event)");
    newCard.setAttribute("data-strength", strength); // Set strength as a data attribute
    newCard.setAttribute("data-type", cardType); // Set type as a data attribute
    newCard.innerHTML = `ID: ${cardId}<br>Strength: ${strength}<br>Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`; // Set text content with type

    cardCounter++;

    if (player === 1) {
        newCard.classList.add("player-one");
        const playerOneHand = document.querySelector(".hand-container.player-one .hand-cards");
        playerOneHand.insertBefore(newCard, playerOneHand.children[1]); // Insert after <h2> element
    } else {
        newCard.classList.add("player-two");
        const playerTwoHand = document.querySelector(".hand-container.player-two .hand-cards");
        playerTwoHand.insertBefore(newCard, playerTwoHand.children[1]); // Insert after <h2> element
    }
}

function endTurn() {
    resolveBattles(); // Resolve any battles before switching turns

    if (currentPlayer === 1) {
        currentPlayer = 2;
        document.querySelectorAll('.card.player-one').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.card.player-two').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.hand-container button')[0].disabled = true;
        document.querySelectorAll('.hand-container button')[1].disabled = false;

        createNewCardForPlayer(2);
    } else {
        currentPlayer = 1;
        document.querySelectorAll('.card.player-one').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.card.player-two').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.hand-container button')[0].disabled = false;
        document.querySelectorAll('.hand-container button')[1].disabled = true;

        createNewCardForPlayer(1);
    }
}
*/
function resolveBattles() {
    const rows = document.querySelectorAll('.row');
    rows.forEach((row) => {
        const cards = Array.from(row.children).filter(child => child.classList.contains('card'));
        if (cards.length > 1) {
            let playerOneCards = [];
            let playerTwoCards = [];

            // Separate the cards into two arrays: one for each player
            cards.forEach(card => {
                if (card.classList.contains('player-one')) {
                    playerOneCards.push(card);
                } else if (card.classList.contains('player-two')) {
                    playerTwoCards.push(card);
                }
            });

            // Determine who is the defender based on the first card in the row
            let defenderCards, attackerCards;
            if (cards[0].classList.contains('player-one')) {
                defenderCards = playerOneCards;
                attackerCards = playerTwoCards;
            } else {
                defenderCards = playerTwoCards;
                attackerCards = playerOneCards;
            }

            // Step 1: Wizards attack simultaneously
            let defenderWizardAttack = 0;
            let attackerWizardAttack = 0;

            defenderCards.forEach(card => {
                if (card.getAttribute('data-type') === 'wizard') {
                    defenderWizardAttack = Math.max(defenderWizardAttack, parseInt(card.getAttribute('data-strength')));
                    card.classList.add('highlight'); // Highlight wizards
                }
            });

            attackerCards.forEach(card => {
                if (card.getAttribute('data-type') === 'wizard') {
                    attackerWizardAttack = Math.max(attackerWizardAttack, parseInt(card.getAttribute('data-strength')));
                    card.classList.add('highlight'); // Highlight wizards
                }
            });

            setTimeout(() => {
                // Apply the Wizards' attacks
                defenderCards.forEach(card => {
                    let currentStrength = parseInt(card.getAttribute('data-strength'));
                    const cardType = card.getAttribute('data-type');
                    currentStrength -= attackerWizardAttack;
                    if (currentStrength <= 0) {
                        row.removeChild(card);
                    } else {
                        card.setAttribute('data-strength', currentStrength);
                        card.innerHTML = `ID: ${card.id}<br>Strength: ${currentStrength}<br>Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`;
                    }
                });

                attackerCards.forEach(card => {
                    let currentStrength = parseInt(card.getAttribute('data-strength'));
                    const cardType = card.getAttribute('data-type');
                    currentStrength -= defenderWizardAttack;
                    if (currentStrength <= 0) {
                        row.removeChild(card);
                    } else {
                        card.setAttribute('data-strength', currentStrength);
                        card.innerHTML = `ID: ${card.id}<br>Strength: ${currentStrength}<br>Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`;
                    }
                });

                // Filter out cards that have been removed from the DOM
                defenderCards = defenderCards.filter(card => card.parentNode !== null);
                attackerCards = attackerCards.filter(card => card.parentNode !== null);

                // Remove highlights from wizards
                defenderCards.forEach(card => {
                    if (card.getAttribute('data-type') === 'wizard') {
                        card.classList.remove('highlight'); 
                    }
                });
                attackerCards.forEach(card => {
                    if (card.getAttribute('data-type') === 'wizard') {
                        card.classList.remove('highlight'); 
                    }
                });

                // Step 2: Close combat between adjacent cards
                resolveCloseCombat(row, defenderCards, attackerCards);

            }, 900);
        }
    });
}

function resolveCloseCombat(row, defenderCards, attackerCards) {
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
                resolveCloseCombat(row, defenderCards, attackerCards);
            }, 900);
        }, 900);
    }
}
