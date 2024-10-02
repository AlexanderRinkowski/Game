class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
}

const CombatHelper = {
    startCombat(gameModel) {
        for (const rowIndex in gameModel.board) {
            if (gameModel.board[rowIndex].length <= 1) { continue; }
            // Wizard combat
            gameModel = this.WizzardCombat.resolveWizardCombat(gameModel, rowIndex);
            // Close combat
            gameModel = this.CloseCombat.resolveCloseCombat(gameModel, rowIndex);
        }
        return gameModel;
    },
    CloseCombat: {
        resolveCloseCombat(gameModel, rowIndex) {
            let cards = gameModel.board[rowIndex];
            const defender = cards[0].owner;
        
            let defenderCards = cards.filter(card => card.owner === defender);
            let attackerCards = cards.filter(card => card.owner !== defender);
        
            let defenderCard = defenderCards[defenderCards.length - 1]; 
            let attackerCard = attackerCards[0]; 

            while (defenderCards.length > 0 && attackerCards.length > 0) {
                defenderCard = defenderCards[defenderCards.length - 1]; 
                attackerCard = attackerCards[0]; 
        
                // Store original strengths
                const originalDefenderStrength = defenderCard.strength;
                const originalAttackerStrength = attackerCard.strength;
        
                // Apply damage
                defenderCard.strength -= originalAttackerStrength;
                attackerCard.strength -= originalDefenderStrength;
        
                // Filter out defeated cards
                defenderCards = defenderCards.filter(card => card.strength > 0);
                attackerCards = attackerCards.filter(card => card.strength > 0);
        
                // Update the original cards array
                gameModel.board[rowIndex] = [...defenderCards, ...attackerCards];

                gameModel.updateGameState() // notify the view about changes
            }
            return gameModel;
        }               
    },
    WizzardCombat: {
        resolveWizardCombat(gameModel, rowIndex) {
            let cards = gameModel.board[rowIndex];
            // Determine defender and attacker cards
            let defender = cards[0].owner;

            // Filter out cards for both players directly from the board
            let defenderCards = cards.filter(card => card.owner === defender);
            let attackerCards = cards.filter(card => card.owner !== defender);

            // Calculate wizard attack value
            const defenderWizardAttack = this.calculateWizardAttack(defenderCards);
            const attackerWizardAttack = this.calculateWizardAttack(attackerCards);
            // Apply wizard attack value   
            defenderCards.forEach(card => { card.strength -= attackerWizardAttack; });
            attackerCards.forEach(card => { card.strength -= defenderWizardAttack; });
            
            gameModel.board[rowIndex] = cards.filter(card => card.strength >= 0);

            gameModel.updateGameState() 
            return gameModel; 
        },

        calculateWizardAttack(cards) {
            let wizardAttack = 0;
            cards.forEach(card => { 
                if (card.cardType === 'wizard') { wizardAttack = Math.max(wizardAttack, card.strength); }
            });
            return wizardAttack;
        },
    }
};



class Card { // export class Card
    constructor(id, strength, cardType, owner) {
        this.id = id;
        this.strength = strength;
        this.cardType = cardType;
        this.owner = owner;
    }
}

class GameModel { // export class GameModel
    constructor() {
        this.currentPlayer = null; 
        this.cardCount = null;
        this.info = {
            player1Coin: 10,
            player2Coin: 10,
            player1Magic: 5,
            player2Magic: 5,
        };
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
        this.rowOwner = {
            fire: "",
            water: "",
            air: "",
            earth: ""
        };
        this.cardLookup = {};
        this.eventEmitter = new EventEmitter();
    }

    onModelChanged(listener) {
        this.eventEmitter.on('modelChanged', listener);
    }

    updateGameState() {
        this.eventEmitter.emit('modelChanged', this); // Notify listeners
    }

    _generateRandomCard() {
        const cardTypes = ["warrior", "wizard", "farmer", "apprentice"];
        const owners = ["player1", "player2"];
    
        // Generate random card properties
        const id = String(this.cardCount);
        this.cardCount++;
        const strength = Math.floor(Math.random() * 9) + 1; // Strength between 1 and 9
        const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        let owner = owners[Math.floor(Math.random() * owners.length)];
    
        // Create and return a new Card instance
        const newCard =  new Card(id, strength, cardType, owner);
        this.cardLookup[id] = newCard;
        return newCard;
    }

    _switchCurrentPlayer() {
        this.currentPlayer = this.currentPlayer === "player1" ? "player2" : "player1";
    }

    _addCardToHand(owner, card) {
        card.owner = owner;
        this.hand[owner].push(card);
    }

    _getCardFromHand(owner, cardIndex) {
        const card = this.hand[owner][cardIndex];
        this.hand[owner].splice(cardIndex, 1);
        return card;
    }

    _addCardToBoard(row, card) {
        this.board[row].push(card);
    }
    
    _getCardFromBoard(row, cardIndex) {
        const card = this.board[row][cardIndex];
        this.board[row].splice(cardIndex, 1);
        return card;
    }

    _moveCardFromHandToBoard(owner, cardIndex, row) {
        const card = this._getCardFromHand(owner, cardIndex);
        this._addCardToBoard(row, card);
    }

    _moveCardOnBoard(sourceRow, cardIndex, targetRow){
        const card = this._getCardFromBoard(sourceRow, cardIndex);
        this._addCardToBoard(targetRow, card);
    }

    _findCard(cardId){
        if (this.hand.player1.some((c) => c.id === cardId)) {
            return "hand-player1";
        } else if (this.hand.player2.some((c) => c.id === cardId)) {
            return "hand-player2";
        } else if (this.board.water.some((c) => c.id === cardId)) {
            return "water";
        } else if (this.board.fire.some((c) => c.id === cardId)) {
            return "fire";
        } else if (this.board.earth.some((c) => c.id === cardId)) {
            return "earth";
        } else if (this.board.air.some((c) => c.id === cardId)) {
            return "air";
        } else {
            return "";
        }
    }
    
    moveCard(card, targetId) {
        // request validation (return bool)
        const isCurrentPlayer = card.owner === this.currentPlayer;
        if (!isCurrentPlayer) { return false; }

        const isValidTarget = targetId in this.board;
        if (!isValidTarget) { return false; }

        // determine card position to see if its move from hand or between rows
        const cardPosition = this._findCard(card.id);
        if (cardPosition == "") { return false; }

        // move card
        const isPlayFromHand = cardPosition.includes("hand");
        if (isPlayFromHand){
            // play from hand
            const cardArrayIndex = this.hand[this.currentPlayer].findIndex((c) => c.id === card.id);
            this._moveCardFromHandToBoard(this.currentPlayer, cardArrayIndex, targetId);
        } else {
            // move between rows
            const cardArrayIndex = this.board[cardPosition].findIndex((c) => c.id === card.id);
            this._moveCardOnBoard(cardPosition, cardArrayIndex, targetId);
        }
        
        this.updateGameState();

        // success
        return true;
    }

    endTurn(player) {
        // request validation (return bool)
        const isCurrentPlayer = player === this.currentPlayer;
        if (!isCurrentPlayer) { return false; }
        // validation successful

        // combat
        CombatHelper.startCombat(this);

        // start new turn
        this._switchCurrentPlayer();
        this._addCardToHand(this.currentPlayer, this._generateRandomCard());
        this.updateGameState();
        return true;
    }
    
    start() {
        // coinflip
        const players = ["player1", "player2"];
        this.currentPlayer = players[Math.floor(Math.random() * players.length)];
        console.log(`${this.currentPlayer} begins`)
        
        // initial draw
        this.cardCount = 1
        for (let i = 0; i < 5; i++) {
            this._addCardToHand(players[0], this._generateRandomCard());
            this._addCardToHand(players[1], this._generateRandomCard());
        }
        
        this.updateGameState();
    }
    
}

model = new GameModel()

console.log(model)