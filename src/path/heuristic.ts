import { Point } from "../util/math"; 

export type Heuristic = (node:Point, goal: Point) => number;

export function manhattan(node: Point, goal: Point) {
	return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
}