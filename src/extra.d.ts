
interface FlyNavigator extends Navigator {
	publishServer(name: string, options: any): Promise<Server>;
}

interface Server extends EventTarget {
	readonly name: string;
	readonly uiUrl: string;
	close(): void;
	onclose(event: Event): void;
	onfetch(event: FetchEvent): void;
}
interface Request {
	url: string
}

interface FetchEvent extends Event {
	readonly request: Request;
	respondWith(r: Response): void;
}

interface WebSocketEvent extends Event {
	readonly request: Request;
	accept(protocol: string): WebSocket;
	respondWith(r: Response): void;
}

declare class Response {
	constructor(html: string, headers: any);
}