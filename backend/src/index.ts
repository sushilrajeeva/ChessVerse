// using ws library to create the web socket

import { WebSocketServer } from 'ws';
import { GameManager } from './Classes/GameManager';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();


wss.on('connection', function connection(ws) {
    gameManager.addUser(ws);
    ws.on("disconnect", () => gameManager.removeUser(ws));
});