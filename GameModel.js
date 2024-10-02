import { BoardManager } from './BoardManager.js';

export class GameModel {
    constructor(player1name, player2name) {
        this.boardManager = new BoardManager(player1name, player2name);
        this.flowManager = new FlowManager(this.boardManager);
        this.flowManager.start();
    };
    
    moveCardRequest(playerCssId, sourceCssId, sourceIndex, targetCssId, targetIndex){
        try {
            this.flowManager.onPlayerMovesCard(paramsOfRequest);
            return true;
        } catch (e) {
            console.log(`Error ${e} occured.`)
            return false;
        }
    };

    endTurnRequest(playerCssId){
        this.flowManager.onPlayerEndsTurn(paramsOfRequest);
    };
}