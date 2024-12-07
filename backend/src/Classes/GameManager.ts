import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {
    
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = []
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    // Added more rigid logic for user removal
    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        const game = this.games.find(game => game.getPlayer1() === socket || game.getPlayer2() === socket);
    
        // logic to notify player that their opponent has left
        if (game) {
            const opponent = game.getPlayer1() === socket ? game.getPlayer2() : game.getPlayer1();
            opponent.send(JSON.stringify({
                type: "USER_DISCONNECTED",
                payload: { message: "Your opponent has disconnected." }
            }));
    
            // removing the game from the list
            this.games = this.games.filter(g => g !== game);
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    // Start a game
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if (message.type === MOVE) {
                console.log("Game Manager :: Inside Move");
                
                const game = this.games.find(game => game.getPlayer1() === socket || game.getPlayer2() === socket);
                if (game) {
                    console.log("Inside make move Move");
                    
                    game.makeMove(socket, message.payload.move);
                    console.log();
                    
                }
            }
        })
    }

}