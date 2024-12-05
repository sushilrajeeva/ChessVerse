import { WebSocket } from "ws";

export class Game {

    private player1: WebSocket;
    private player2: WebSocket;

    private board: string;
    private moves: string[];
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;

        this.board = "";
        this.moves = []
        this.startTime = new Date()
    }

    public getPlayer1(): WebSocket {
        return this.player1;
    }

    public getPlayer2(): WebSocket {
        return this.player2;
    }

    public makeMove(socket: WebSocket, move: string) {
        // Validations
        // is it this users move
        // is the move valid
        // i will use chess.js library to handle the validations

        // update the board
        // push the move 


        // check if the game is over 

        // send the updated board to both players
    }
}