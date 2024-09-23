let currentPlayer = 1;
let cardCounter = 11; // Start counter at 11 because 10 cards already exist

function allowDrop(ev) {
    ev.preventDefault(); // Allow dropping by preventing default behavior
}

function drag(ev) {
    const card = ev.target;
    const cardPlayer = card.classList.contains('player-one') ? 1 : 2;

    if (cardPlayer === currentPlayer) {
        ev.dataTransfer.setData("text", ev.target.id);
    }
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var card = document.getElementById(data);

    const cardPlayer = card.classList.contains('player-one') ? 1 : 2;  // if yes 1 else 2

    if (cardPlayer === currentPlayer) {
        if (ev.target.className.includes("row")) {
            ev.target.appendChild(card);
        }
    }
}

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
            }, 900);

            // Update the UI to reflect the result of the wizard attack
            setTimeout(() => {
                // Remove wizards with zero or negative strength
                defenderCards = defenderCards.filter(card => card.parentNode !== null);
                attackerCards = attackerCards.filter(card => card.parentNode !== null);

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
            // Remove the highlight effect after 500ms
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

            // Recursive call to handle the next close combat after 2 seconds
            resolveCloseCombat(row, defenderCards, attackerCards);
        }, 900);
    }
}


