export class Probabilities<T> {
	private epsilon = 0.0005; // TODO: Chose value for this
	objects: T[] = [];
	probSum: number[] = [];

	constructor(chances: Map<T, number> | null){
		if (chances != null){
			var last = 0;
			chances.forEach((prob: number, key: T) => {
				this.objects.push(key);
				last += prob;
				this.probSum.push(last);
			})
	
			this.normalize();
		}
	}

	static buildUniform<T>(objects: T[]): Probabilities<T>{
		var probabilities: Probabilities<T> = new Probabilities<T>(null);
		
		var prob = 1/objects.length;
		var last = 0;
		objects.forEach((key: T) => {
			probabilities.objects.push(key);
			last += prob;
			probabilities.probSum.push(last);
		})

		return probabilities;
	}

	add(object: T, prob: number) {
		this.objects.push(object);
		this.probSum.push(prob);
		this.normalize();
	}

	remove(index: number) {
		if (index >= 0 && index < this.objects.length) {
			this.objects.splice(index, 1);
			this.probSum.splice(index, 1);
			this.normalize();
		}
	}

	update(object: T, newValue: number) {
		this.objects.forEach((key: T, i: number) => {
			if (key === object) {
				this.probSum[i] = newValue;
				return;
			}
		})
	}

	updateObject(object: T, newObject: T) {
		var index = this.objects.indexOf(object);
		this.objects[index] = newObject;
	}

	randPickOne(): T{
		var rand = Math.random();
		var i = 0;
		while (i < this.probSum.length - 1 && this.probSum[i] < rand){
			i++;
		}

		return this.objects[i];
	}

	randPickMany(amountModifier: number, allowDuplicates: boolean = true): T[]{
		var picks: T[] = [];
		var rand = Math.random();
		for (var i = 0; i < rand*amountModifier; i++){
			var pick = this.randPickOne();
			if (allowDuplicates || !picks.includes(pick)){
				picks.push(pick);
			}
		}
		if (picks.length === 1 && picks[0] == null){
			picks = [];
		}
		return picks;
	}

	randPickNum(num: number, allowDuplicates: boolean = true): T[]{
		var picks: T[] = [];
		while(picks.length < num) {
			var pick = this.randPickOne();
			if (allowDuplicates || !picks.includes(pick)){
				picks.push(pick);
			}
		}
		return picks;
	}

	private normalize(){
		if (this.probSum[this.probSum.length - 1] - 1 > this.epsilon){
			var factor = 1/this.probSum[this.probSum.length - 1];
			this.probSum.forEach((prob: number) => {
				prob *= factor;
			})
		}
	}
}