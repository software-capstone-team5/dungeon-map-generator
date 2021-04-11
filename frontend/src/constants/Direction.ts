export enum Direction {
	left = 'LEFT',
	right = 'RIGHT',
	up = 'UP',
	down = 'DOWN'
}

export namespace Direction {
	export function getOppositeDirection(direction: Direction): Direction {
		switch (direction){
			case Direction.right:
				return Direction.left;
			case Direction.left:
				return Direction.right;
			case Direction.up:
				return Direction.down;
			case Direction.down:
				return Direction.up;
		}
	}
}