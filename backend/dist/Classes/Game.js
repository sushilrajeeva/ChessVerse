"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
const zod_1 = require("zod");
class Game {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        // when ever a new game is started we should let the players know the game has started
        // emmiting game start message
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }
    getPlayer1() {
        return this.player1;
    }
    getPlayer2() {
        return this.player2;
    }
    makeMove(socket, move) {
        // Validations
        // Validate the type of MOVE using zod
        // is it this users move
        // is the move valid
        // i will use chess.js library to handle the validations
        console.log("Current move count: ", this.moveCount);
        const MoveSchema = zod_1.z.object({
            from: zod_1.z.string(),
            to: zod_1.z.string()
        });
        const validation = MoveSchema.safeParse(move);
        if (!validation.success) {
            console.log("Invalid move structure:", validation.error);
            return;
        }
        if (this.moveCount % 2 === 0 && socket !== this.player1) {
            console.log("Early return 1");
            return;
        }
        if (this.moveCount % 2 === 1 && socket !== this.player2) {
            console.log("Early return 2");
            return;
        }
        console.log("Did not return early");
        try {
            this.board.move(move);
        }
        catch (error) {
            console.log("Chess.js move error", error);
            return;
        }
        console.log("Move succeded");
        // update the board (chess.js library handles it for us)
        // push the move 
        // check if the game is over 
        if (this.board.isGameOver()) {
            // Send the game over message to both players
            const winner = this.board.turn() === "w" ? "black" : "white";
            const gameOverMessage = JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: { winner }
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
            return;
        }
        // if game is not over send the updated board to both players
        console.log("Move count", this.moveCount);
        if (this.moveCount % 2 == 0) {
            console.log("sent1");
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
        else {
            console.log("sent2");
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
        this.moveCount++;
    }
}
exports.Game = Game;
