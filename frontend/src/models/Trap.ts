export class Trap {
	id: string = "";
	premade: boolean = false;
	name: string = "";
	description: string = "";
	difficulty: number = Trap.maxDifficulty/2;
	static minDifficulty: number = 1;
	static maxDifficulty: number = 30;
	
	constructor(name: string = "", description: string = "", difficulty: number = Trap.maxDifficulty/2){
		this.name = name;
		this.description = description;
		this.difficulty = difficulty;
	}
}