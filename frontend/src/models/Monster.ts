export class Monster {
	static maxChallenge: number = 20;
	static minChallenge: number = 1;
	id: string = "";
	premade: boolean = false;
	challenge: number = Monster.maxChallenge/2;
	name: string = "";
	description: string = "";
}