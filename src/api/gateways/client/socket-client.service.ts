import { Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';


// Import configs
import config from 'config';

@Injectable()
export class SocketClientService {
    private socket: Socket;

    constructor() {
        // this.socket = io(config.keys.SOCKET.EMAIL_SERVER);
        // console.log("test")
        // // Set up event handlers for the socket
        // this.socket.on('connect', () => {
        //     console.log('Connected to socket server');
        // });

        // this.socket.on('message', (data: any) => {
        //     console.log('Received message:', data);
        // });

        // this.socket.on('connect_error', (error: any) => {
        //     console.log('Socket connection error:', error);
        // });
    }

    sendMessage(message: string): void {
        this.socket.emit('message', message);
    }

    disconnect(): void {
        this.socket.disconnect();
    }
}
