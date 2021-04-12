export class Item {
	id: string = "";
	premade: boolean = false;
	name: string = "";
	description: string = "";
	value: number = 1;
	
	constructor(name: string = "", description: string = "") {
		this.name = name;
		this.description = description;
	}
}