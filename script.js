function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var card = document.getElementById(data);
    if (ev.target.className.includes("row")) {
        ev.target.appendChild(card);
    } else if (ev.target.className.includes("card")) {
        ev.target.parentElement.appendChild(card);
    }
}
