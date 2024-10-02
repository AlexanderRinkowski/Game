import { CombatManager } from './CombatManager.js';

class FlowManager {
    // manages game flow and uses boardmanager to manipulate the board state depending on the flow of the game
    constructor(boardManager) {
        this.currentPlayer = null;
        this.boardManager = boardManager;
        this.combatManager = new CombatManager(boardManager);
    };
    
    switchCurrentPlayer(){};

    resolveCombat(){
        // for each row in boardmanager: 
        this.startCombat(row);
    };

    startPlayerTurn(player){};
    
    onPlayerMovesCard(playerCssId, sourceCssId, sourceIndex, targetCssId, targetIndex){
        // validate if move is allowed at this state 
        
        // execute the move using the boardmanager
    };
    
    onPlayerEndsTurn(){
        // validate if allowed according to state
        
        // execute end turn actions (autobattler, switch players, new turn)
        this.resolveCombat();
        this.switchCurrentPlayer();
        this.startPlayerTurn();
    };
    
    start(){
        // init the board state using the board manager
    };
}