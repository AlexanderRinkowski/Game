const CardType = Object.freeze({
    WARRIOR: 'warrior',
    WIZARD: 'wizard',
    FARMER: 'farmer',
    APPRENTICE: 'apprentice'
});

export class Card { 
    constructor(strength, cardType) {
        this.id = null;
        this.owner = null;
        this.position = null;
        
        this.strength = strength;
        this.cardType = cardType;
    };
}

export class CardManager {
    constructor() {
        this.cardLookup = {};
        this.cardCount = 1;
    };

    generateRandomCard() {        
        const strength = Math.floor(Math.random() * 9) + 1; 
        
        const cardTypes = Object.values(CardType);
        let randomIndex = Math.floor(Math.random() * cardTypes.length);
        const cardType = cardTypes[randomIndex];

        const newCard =  new Card(strength, cardType); // Card attributes will be mutable no matter if passed as const or let
        const card = newCard;
        return newCard;
    };
    
    getCard(cardId) { // No default
        const card = this.cardLookup[cardId];

        // If the cardId does not exist, throw an error
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found.`);
        }

        return card;
    };

    addCard(card) { // Defaults to random card
        if(!card) { 
            card = this.generateRandomCard();    
        } 

        // OVERWRITE id: Ensure the card's id is equal to the current cardCount
        card.id = String(this.cardCount);

        // Validate the card's strength (must be an integer >= 0)
        if (!Number.isInteger(card.strength) || card.strength < 0) {
            throw new Error(`Invalid card strength: ${card.strength}. Strength must be an integer greater than or equal to 0.`);
        }

        // Validate the card's type (must be part of CardType)
        if (!Object.values(CardType).includes(card.cardType)) {
            throw new Error(`Invalid card type: ${card.cardType}. Valid types are: ${Object.values(CardType).join(', ')}.`);
        }

        // Add the card to the cardLookup with the current cardCount as the key
        this.cardLookup[card.id] = card;

        // Increment the cardCount
        this.cardCount++;
    };
}