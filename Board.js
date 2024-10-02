// valid card sources / targets for board
const BoardRowType = Object.freeze({
    FIRE: 'fire',
    WATER: 'water',
    EARTH: 'earth',
    AIR: 'air'
});

export class Board {
    constructor() {
        const boardRowTypes = Object.values(BoardRowType);
        
        this.cards = {};
        this.owner = {};
        // create cards and owner for every valid BoardRowType (DRY)
        boardRowTypes.forEach(type => {
            this.cards[type] = [];
            this.owner[type] = ""; 
        });
    };  
    
    addCard(card, targetRow, index) { // Defaults to last element in row
        if (!Object.values(BoardRowType).includes(targetRow)) {
            throw new Error(`Invalid targetRow: ${targetRow}. Valid targetRows are: ${Object.values(BoardRowType).join(', ')}.`);
        }

        const rowLength = this.cards[targetRow].length;

        if (index !== undefined) {
            // Check if index is out of range
            if (index < 0 || index > rowLength) {
                throw new Error(`Index ${index} is out of bounds for targetRow ${targetRow}. Valid indices are 0 to ${rowLength}.`);
            }

            // Insert the card at the specified index
            this.cards[targetRow].splice(index, 0, card);
    
        } else {
            // If index is not provided, push the card to the end of the row
            this.cards[targetRow].push(card);
        }
    };
    
    getCard(sourceRow, index) { // Defaults to last element in row
        if (!Object.values(BoardRowType).includes(sourceRow)) {
            throw new Error(`Invalid sourceRow: ${sourceRow}. Valid sourceRows are: ${Object.values(BoardRowType).join(', ')}.`);
        }
        
        const rowLength = this.cards[sourceRow].length;
        if (rowLength < 1) {
            throw new Error(`Cannot draw card from row with row length ${rowLength}`);
        }

        let card;

        if (index !== undefined) {
            // Check if index is out of range
            if (index < 0 || index >= rowLength) {
                throw new Error(`Index ${index} is out of bounds for row ${sourceRow}. Valid indices are 0 to ${rowLength-1}.`);
            }

            card = this.cards[sourceRow][index];
            // splice(index, deleteCount, itemToAdd1, itemToAdd2, ...)
            this.cards[sourceRow].splice(index, 1); // remove 1 starting at index 

        } else {
            // If index is not provided, push the card to the end of the row
            card = this.cards[sourceRow].pop();
        }

        return card;
    };

    moveCard(sourceRow, sourceRowIndex, targetRow, targetRowIndex){
        const card = this.getCard(sourceRow, sourceRowIndex);
        this.addCard(card, targetRow, targetRowIndex);
    };
}