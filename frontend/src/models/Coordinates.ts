export class Coordinates {
	x: number;
	y: number;

	constructor(x: number, y: number){
		this.x = x;
		this.y = y;
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
}