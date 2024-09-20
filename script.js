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

    const cardPlayer = card.classList.contains('player-one') ? 1 : 2;

    if (cardPlayer === currentPlayer) {
        if (ev.target.className.includes("row") || ev.target.className.includes("card")) {
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
    newCard.textContent = `ID: ${cardId}, Strength: ${strength}, Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`; // Set text content with type

    cardCounter++;

    if (player === 1) {
        newCard.classList.add("player-one");
        const playerOneHand = document.querySelector(".hand-container:nth-child(2)");
        playerOneHand.insertBefore(newCard, playerOneHand.children[1]); // Insert after <h2> element
    } else {
        newCard.classList.add("player-two");
        const playerTwoHand = document.querySelector(".hand-container:nth-child(3)");
        playerTwoHand.insertBefore(newCard, playerTwoHand.children[1]); // Insert after <h2> element
    }
}


function endTurn() {
    resolveBattles(); // Resolve any battles before switching turns

    if (currentPlayer === 1) {
        currentPlayer = 2;
        document.querySelectorAll('.player-one').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.player-two').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.hand-container button')[0].disabled = true;
        document.querySelectorAll('.hand-container button')[1].disabled = false;

        createNewCardForPlayer(2);
    } else {
        currentPlayer = 1;
        document.querySelectorAll('.player-one').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.player-two').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.hand-container button')[0].disabled = false;
        document.querySelectorAll('.hand-container button')[1].disabled = true;

        createNewCardForPlayer(1);
    }
}

function resolveBattles() {
    const rows = document.querySelectorAll('.row');
    rows.forEach((row, rowIndex) => {
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

            // Step 1: Wizards attack simultaneously
            let playerOneWizardAttack = 0;
            let playerTwoWizardAttack = 0;

            playerOneCards.forEach(card => {
                if (card.getAttribute('data-type') === 'wizard') {
                    playerOneWizardAttack = Math.max(playerOneWizardAttack, parseInt(card.getAttribute('data-strength')));
                }
            });

            playerTwoCards.forEach(card => {
                if (card.getAttribute('data-type') === 'wizard') {
                    playerTwoWizardAttack = Math.max(playerTwoWizardAttack, parseInt(card.getAttribute('data-strength')));
                }
            });

            // Apply the Wizards' attacks
            playerOneCards.forEach(card => {
                let currentStrength = parseInt(card.getAttribute('data-strength'));
                const cardType = card.getAttribute('data-type');
                currentStrength -= playerTwoWizardAttack;
                if (currentStrength <= 0) {
                    row.removeChild(card);
                } else {
                    card.setAttribute('data-strength', currentStrength);
                    card.textContent = `ID: ${card.id}, Strength: ${currentStrength}, Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`;
                }
            });

            playerTwoCards.forEach(card => {
                let currentStrength = parseInt(card.getAttribute('data-strength'));
                const cardType = card.getAttribute('data-type');
                currentStrength -= playerOneWizardAttack;
                if (currentStrength <= 0) {
                    row.removeChild(card);
                } else {
                    card.setAttribute('data-strength', currentStrength);
                    card.textContent = `ID: ${card.id}, Strength: ${currentStrength}, Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`;
                }
            });

            // Update the UI to reflect the result of the wizard attack
            setTimeout(() => {
                // Remove wizards with zero or negative strength
                playerOneCards = playerOneCards.filter(card => card.parentNode !== null);
                playerTwoCards = playerTwoCards.filter(card => card.parentNode !== null);

                // Step 2: Close combat between adjacent cards
                resolveCloseCombat(row, playerOneCards, playerTwoCards);
            }, 1000 * (rowIndex + 1));
        }
    });
}

function resolveCloseCombat(row, playerOneCards, playerTwoCards) {
    if (playerOneCards.length > 0 && playerTwoCards.length > 0) {
        // Take the last card from player one and the first card from player two
        let cardOne = playerOneCards.pop();
        let cardTwo = playerTwoCards.shift();

        let strengthOne = parseInt(cardOne.getAttribute('data-strength'));
        let strengthTwo = parseInt(cardTwo.getAttribute('data-strength'));

        const cardOneType = cardOne.getAttribute('data-type');
        const cardTwoType = cardTwo.getAttribute('data-type');

        setTimeout(() => {
            if (strengthOne > strengthTwo) {
                strengthOne -= strengthTwo;
                cardOne.setAttribute('data-strength', strengthOne);
                cardOne.textContent = `ID: ${cardOne.id}, Strength: ${strengthOne}, Type: ${cardOneType.charAt(0).toUpperCase() + cardOneType.slice(1)}`;
                row.removeChild(cardTwo);
            } else if (strengthTwo > strengthOne) {
                strengthTwo -= strengthOne;
                cardTwo.setAttribute('data-strength', strengthTwo);
                cardTwo.textContent = `ID: ${cardTwo.id}, Strength: ${strengthTwo}, Type: ${cardTwoType.charAt(0).toUpperCase() + cardTwoType.slice(1)}`;
                row.removeChild(cardOne);
            } else {
                row.removeChild(cardOne);
                row.removeChild(cardTwo);
            }

            // Recursive call to handle the next close combat after 2 seconds
            resolveCloseCombat(row, playerOneCards, playerTwoCards);
        }, 1000);
    }
}

