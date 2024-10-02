// change player ids here
const PlayerIds = Object.freeze({
    PLAYER1: 'player1',
    PLAYER2: 'player2'
});

// change valid sources / targets here
const PlayerCards = Object.freeze({
    DECK: 'deck',
    HAND: 'hand',
    DISCARDED: 'discarded'
});

export class Player {
    constructor(id, name) {
        // Validate that id is a valid PlayerId
        if (!Object.values(PlayerIds).includes(id)) {
            throw new Error(`Invalid player ID: ${id}. Valid IDs are: ${Object.values(PlayerIds).join(', ')}.`);
        }

        this.id = id;
        this.name = name;
        this.coin = null;
        this.magic = null;
        this.cards = {};
        // create hand, deck, discarded (DRY)
        const playerCardSources = Object.values(PlayerCards);
        playerCardSources.forEach(source => {
            this.cards[source] = [];
        });
    };

    addCard(card, target, index) { // Defaults to last element in row
        if (!Object.values(PlayerCards).includes(target)) {
            throw new Error(`Invalid target type: ${target}. Valid target types are: ${Object.values(PlayerCards).join(', ')}.`);
        }

        const targetLength = this.cards[target].length;

        if (index !== undefined) {
            // Check if indexInRow is out of range
            if (index < 0 || index > targetLength) {
                throw new Error(`Index ${index} is out of bounds for target ${target}. Valid indices are 0 to ${targetLength}.`);
            }

            // Insert the card at the specified index
            this.cards[target].splice(index, 0, card);
    
        } else {
            // If indexInRow is not provided, push the card to the end of the row
            this.cards[target].push(card);
        }
    };

    getCard(source, index) {
        if (!Object.values(PlayerCards).includes(source)) {
            throw new Error(`Invalid player card source: ${source}. Valid row types are: ${Object.values(PlayerCards).join(', ')}.`);
        }
        
        const sourceLength = this.cards[source].length;
        if (sourceLength < 1) {
            throw new Error(`Cannot draw card from source with length ${sourceLength}`);
        }

        if (index === undefined) {
            throw new Error(`Must provide index.`);
        }
        // Check if index is out of range
        if (index < 0 || index >= sourceLength) {
            throw new Error(`Index ${index} is out of bounds for ${source}. Valid indices are 0 to ${sourceLength-1}.`);
        }

        let card;
        card = this.cards[source][index];
        // splice(index, deleteCount, itemToAdd1, itemToAdd2, ...)
        this.cards[source].splice(index, 1); // remove 1 starting at index 

        return card;
    };

    moveCard(source, sourceIndex, target, targetIndex){
        const card = this.getCard(source, sourceIndex);
        this.addCard(card, target, targetIndex);
    };

    // specialized getCard functions:
    play(index) { // get card from Hand
        return this.getCard("hand", index);
    };

    draw(index) { // get card from Deck (Defaults to last)
        if (!index) {
            index = this.cards["deck"].length - 1;
        }
        return this.getCard("deck", index);
    };

    revive(index) { // get card from Discarded
        return this.getCard("discarded", index);
    };
}