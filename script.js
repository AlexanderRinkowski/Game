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
    newCard.setAttribute("id", cardId);
    newCard.setAttribute("draggable", "true");
    newCard.setAttribute("ondragstart", "drag(event)");
    newCard.setAttribute("data-strength", strength); // Set strength as a data attribute
    newCard.textContent = `ID: ${cardId}, Strength: ${strength}`; // Set text content

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
    rows.forEach(row => {
        const cards = Array.from(row.children).filter(child => child.classList.contains('card'));
        if (cards.length > 1) {
            let playerOneCards = [];
            let playerTwoCards = [];

            cards.forEach(card => {
                if (card.classList.contains('player-one')) {
                    playerOneCards.push(card);
                } else if (card.classList.contains('player-two')) {
                    playerTwoCards.push(card);
                }
            });

            if (playerOneCards.length > 0 && playerTwoCards.length > 0) {
                while (playerOneCards.length > 0 && playerTwoCards.length > 0) {
                    let cardOne = playerOneCards[playerOneCards.length - 1];
                    let cardTwo = playerTwoCards[0];

                    let strengthOne = parseInt(cardOne.getAttribute('data-strength'));
                    let strengthTwo = parseInt(cardTwo.getAttribute('data-strength'));

                    if (strengthOne > strengthTwo) {
                        strengthOne -= strengthTwo;
                        cardOne.setAttribute('data-strength', strengthOne);
                        cardOne.textContent = `ID: ${cardOne.id}, Strength: ${strengthOne}`;
                        row.removeChild(cardTwo);
                        playerTwoCards.shift();
                    } else if (strengthTwo > strengthOne) {
                        strengthTwo -= strengthOne;
                        cardTwo.setAttribute('data-strength', strengthTwo);
                        cardTwo.textContent = `ID: ${cardTwo.id}, Strength: ${strengthTwo}`;
                        row.removeChild(cardOne);
                        playerOneCards.pop();
                    } else {
                        row.removeChild(cardOne);
                        row.removeChild(cardTwo);
                        playerOneCards.pop();
                        playerTwoCards.shift();
                    }
                }
            }
        }
    });
}
