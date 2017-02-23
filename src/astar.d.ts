export as namespace astar;

export class Graph {
	readonly grid: GridNode[][];
	readonly nodes: GridNode[];
	diagonal: boolean;
	constructor(weights: number[][], options?: {}, diagonal?: boolean);
}

export class GridNode {
	x: number;
	y: number;
	weight: number;
	toString(): string;
}

export namespace astar {
	export function search(graph: Graph, start: GridNode, end: GridNode): GridNode[];
}