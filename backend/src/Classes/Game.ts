import { WebSocket } from "ws";
import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { z } from 'zod';

const MoveSchema = z.object({
    from: z.string(),
    to: z.string()
});

export class Game {

    private player1: WebSocket;
    private player2: WebSocket;

    public board: Chess;
    private startTime: Date;

    private moveCount: number = 0;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;

        this.board = new Chess();
        this.startTime = new Date()

        // when ever a new game is started we should let the players know the game has started

        // emmiting game start message
        // this.player1.send(JSON.stringify({
        //     type: INIT_GAME,
        //     payload: {
        //         color: "white"
        //     }
        // }));

        // this.player2.send(JSON.stringify({
        //     type: INIT_GAME,
        //     payload: {
        //         color: "black"
        //     }
        // }));
        this.emitToPlayer(this.player1, INIT_GAME, { color: "white" });
        this.emitToPlayer(this.player2, INIT_GAME, { color: "black" });
    }

    public getPlayer1(): WebSocket {
        return this.player1;
    }

    public getPlayer2(): WebSocket {
        return this.player2;
    }

    private emitToPlayer(player: WebSocket, type: string, payload: object) {
        player.send(this.createMessage(type, payload));
    }

    private createMessage(type: string, payload: object): string {
        return JSON.stringify({ type, payload });
    }

    private safeSend(player: WebSocket, message: string) {
        try {
            player.send(message);
        } catch (error) {
            console.log(`Failed to send message to player: ${error}`);
        }
    }

    public makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // Validations
        // Validate the type of MOVE using zod
        // is it this users move
        // is the move valid
        // i will use chess.js library to handle the validations
        console.log("logging move:", move);
        
        console.log("Current move count: ", this.moveCount);

        

        const validation = MoveSchema.safeParse(move);
        if (!validation.success) {
            console.log("Invalid move structure:", validation.error);
            return;
        }
        

        if (this.moveCount %2 === 0 && socket !== this.player1) {
            console.log("Early return 1", "Not Player 1's turn.");
            
            return
        }

        if (this.moveCount %2 === 1 && socket !== this.player2) {
            console.log("Early return 2", "Not player 2's turn.");
            return
        }

        console.log("Did not return early");
        


        try {
            this.board.move(move);
        } catch (error) {
            console.log("Chess.js move error", error)
            return;
        }

        console.log("Move successful");
        

        // update the board (chess.js library handles it for us)
        // push the move 


        // check if the game is over 
        if (this.board.isGameOver()) {
            // Send the game over message to both players
            const winner = this.board.turn() === "w" ? "black" : "white";
            const gameOverMessage = this.createMessage(GAME_OVER, { winner });
        
            this.safeSend(this.player1, gameOverMessage);
            this.safeSend(this.player2, gameOverMessage);
            return;
        }
        

        // if game is not over send the updated board to both players
        console.log("Move count", this.moveCount);
        

        // if (this.moveCount % 2 === 0) {
        //     console.log("sent1");
            
        //     this.player2.send(JSON.stringify({
        //         type: MOVE,
        //         payload: move
        //     }));
        // } else {
        //     console.log("sent2");
            
        //     this.player1.send(JSON.stringify({
        //         type: MOVE,
        //         payload: move
        //     }));
        // }

        const message = this.createMessage(MOVE, move);
        if (this.moveCount % 2 === 0) {
            this.safeSend(this.player2, message);
        } else {
            this.safeSend(this.player1, message);
        }
        this.moveCount++;
        
    }
}