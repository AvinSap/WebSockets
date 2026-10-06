import { 
    WebSocketGateway, 
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
 } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway(8080)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server!: Server;
  // Remembers each client's name, keyed by their socket
  private names = new Map<WebSocket, string>();

  // Counts connections so each person gets a unique name
  private count = 0;
    handleConnection(socket: WebSocket) {
        this.count++;
    const name = `User ${this.count}`;
    this.names.set(socket, name);

    socket.send(`Welcome ${name}`);   // only to the new person
    this.broadcast(`${name} joined`); // to everyone

    socket.on('message', (message) => {
      socket.send(`Roger that! ${message}`);
    });
  }

  // Runs when someone disconnects (closes the tab, loses network)
  handleDisconnect(socket: WebSocket) {
    const name = this.names.get(socket);
    this.names.delete(socket);        // forget them so the Map doesn't grow forever
    this.broadcast(`${name} left`);
  }

  // Sends a message to every connected client
  private broadcast(text: string) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  }
}