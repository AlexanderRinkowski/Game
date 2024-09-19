let currentPlayer = 1;

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

function endTurn() {
    if (currentPlayer === 1) {
        currentPlayer = 2;
        document.querySelectorAll('.player-one').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.player-two').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.hand-container button')[0].disabled = true;
        document.querySelectorAll('.hand-container button')[1].disabled = false;
    } else {
        currentPlayer = 1;
        document.querySelectorAll('.player-one').forEach(card => card.setAttribute('draggable', 'true'));
        document.querySelectorAll('.player-two').forEach(card => card.setAttribute('draggable', 'false'));
        document.querySelectorAll('.hand-container button')[0].disabled = false;
        document.querySelectorAll('.hand-container button')[1].disabled = true;
    }
}
