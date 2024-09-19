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
    newCard.textContent = (cardCounter).toString();
    newCard.setAttribute("draggable", "true");
    newCard.setAttribute("ondragstart", "drag(event)");
    newCard.setAttribute("id", "card" + cardCounter); // Set unique ID
    cardCounter++;

    if (player === 1) {
        newCard.classList.add("player-one");
        const playerOneHand = document.querySelector(".hand-container:nth-child(2)");
        playerOneHand.insertBefore(newCard, playerOneHand.children[1]);
    } else {
        newCard.classList.add("player-two");
        const playerTwoHand = document.querySelector(".hand-container:nth-child(3)");
        playerTwoHand.insertBefore(newCard, playerTwoHand.children[1]);
    }
}

function endTurn() {
    if (currentPlayer === 1) {
        // End Player One's turn and start Player Two's turn
        currentPlayer = 2;
        document.querySelectorAll('.player-one').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.player-two').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.hand-container button')[0].disabled = true;
        document.querySelectorAll('.hand-container button')[1].disabled = false;

        // Create new card for Player Two
        createNewCardForPlayer(2);

    } else {
        // End Player Two's turn and start Player One's turn
        currentPlayer = 1;
        document.querySelectorAll('.player-one').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.player-two').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.hand-container button')[0].disabled = false;
        document.querySelectorAll('.hand-container button')[1].disabled = true;

        // Create new card for Player One
        createNewCardForPlayer(1);
    }
}
