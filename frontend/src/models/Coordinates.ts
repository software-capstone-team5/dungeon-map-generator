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
			if (this.y > rhs.y){
				return Direction.up;
			}
			else{
				return Direction.down;
			}
		}
		else if (this.x > rhs.x){
			return Direction.right;
		}
		else{
			return Direction.left;
		}
	}
}

Coordinates.prototype.toString = function () {
	return this.x + ',' + this.y;
};