import { Direction } from "../constants/Direction";

export class Coordinates {
	x: number = 0;
	y: number = 0;

	constructor(x: number, y: number){
		this.x = x;
		this.y = y;
	}

	static fromString(str: string): Coordinates {
		var split = str.split(",");
		return new Coordinates(parseInt(split[0]), parseInt(split[1]));
	}

	subtract(rhs: Coordinates): Coordinates{
		return new Coordinates(this.x - rhs.x, this.y - rhs.y);
	}

	add(rhs: Coordinates): Coordinates{
		return new Coordinates(this.x + rhs.x, this.y + rhs.y);
	}

	offset(offset: number): Coordinates{
		return new Coordinates(this.x + offset, this.y + offset);
	}

	getDirectionTo(rhs: Coordinates): Direction {
		if (this.x === rhs.x){
			if (this.y < rhs.y){
				return Direction.up;
			}
			else{
				return Direction.down;
			}
		}
		else if (this.x < rhs.x){
			return Direction.right;
		}
		else{
			return Direction.left;
		}
	}

	getNextLocation(direction: Direction): Coordinates {
		switch (direction){
			case Direction.right:
				return new Coordinates(this.x + 1, this.y);
			case Direction.left:
				return new Coordinates(this.x - 1, this.y);
			case Direction.up:
				return new Coordinates(this.x, this.y + 1);
			case Direction.down:
				return new Coordinates(this.x, this.y - 1);
		}
	}

	getAdjacent(): Coordinates[] {
		return [new Coordinates(this.x + 1, this.y),
			new Coordinates(this.x - 1, this.y),
			new Coordinates(this.x, this.y + 1),
			new Coordinates(this.x, this.y - 1)];
	}

	getDistanceTo(rhs: Coordinates): number {
		// TODO: Could use manhatten 
		// return Math.sqrt(Math.pow(rhs.x - this.x, 2) + Math.pow(rhs.y - this.y, 2));
		return Math.abs(rhs.x - this.x) + Math.abs(rhs.y - this.y);
	}
}

Coordinates.prototype.toString = function () {
	return this.x + ',' + this.y;
};