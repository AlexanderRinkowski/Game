import { Board } from './Board.js';
import { Player } from './Player.js';
import { Card, CardManager } from './CardManager.js';

export class BoardManager { // Manages positions of card ids (player/board) and has "cards" as lookup for the object
    constructor(player1name, player2name) {
        // position of card ids
        this.player1 = new Player("player1", player1name);
        this.player2 = new Player("player2", player2name);
        this.board = new Board();
        // card elements with card ids
        this.cards = new CardManager();
    };
    
    moveCardFromPlayerToBoard(player, source, sourceIndex, target, targetIndex){
        let cardId;
        if (player === "player1") {
            cardId = this.player1.getCard(source, sourceIndex);
        } else if (player === "player2") {
            cardId = this.player2.getCard(source, sourceIndex);
        } else {
            throw new Error(`Player ${player} is not a valid player id (player1 / player2).`);
        }
        this.board.addCard(cardId, target, targetIndex);
    };

    moveCardFromBoardToPlayer(source, sourceIndex, targetPlayer, target, targetIndex){
        let cardId = this.board.getCard(source, sourceIndex);
        if (targetPlayer === "player1") {
            this.player1.addCard(cardId, target, targetIndex);
        } else if (targetPlayer === "player2") {
            this.player2.addCard(cardId, target, targetIndex);
        } else {
            throw new Error(`Player ${targetPlayer} is not a valid player id (player1 / player2).`);
        }
    };

    moveCardOnBoard(source, sourceIndex, target, targetIndex){
        this.board.moveCard(source, sourceIndex, target, targetIndex);
    };

    moveCardBetweenPlayers(sourcePlayer, source, sourceIndex, targetPlayer, target, targetIndex){
        let cardId;
        if (sourcePlayer === "player1") {
            cardId = this.player1.getCard(source, sourceIndex);
        } else if (sourcePlayer === "player2") {
            cardId = this.player2.getCard(source, sourceIndex);
        } else {
            throw new Error(`SourcePlayer ${sourcePlayer} is not a valid player id (player1 / player2).`);
        }
        if (targetPlayer === "player1") {
            this.player1.addCard(cardId, target, targetIndex);
        } else if (targetPlayer === "player2") {
            this.player2.addCard(cardId, target, targetIndex);
        } else {
            throw new Error(`TargetPlayer ${targetPlayer} is not a valid player id (player1 / player2).`);
        }
    };
}