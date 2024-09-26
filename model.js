export class Card {
    constructor(id, strength, cardType, owner) {
        this.id = id;
        this.strength = strength;
        this.cardType = cardType;
        this.owner = owner;
    }
}

export class GameModel {
    constructor() {
        this.hand = {
            player1: [],
            player2: []
        };
        this.board = {
            fire: [],
            water: [],
            air: [],
            earth: []
        };
    }

    addCardToHand(owner, card) {
        this.hand[owner].push(card);
    }

    getCardFromHand(owner, cardIndex) {
        const card = this.hand[owner][cardIndex];
        this.hand[owner].splice(cardIndex, 1);
        return card;
    }

    addCardToBoard(row, card) {
        this.board[row].push(card);
    }
    
    getCardFromBoard(row, cardIndex) {
        const card = this.board[row][cardIndex];
        this.board[row].splice(cardIndex, 1);
        return card;
    }

    moveCardFromHandToBoard(owner, cardIndex, row) {
        const card = this.getCardFromHand(owner, cardIndex);
        this.addCardToBoard(row, card);
    }
    
}