export class Probabilities<T> {
	private epsilon = 0.0005; // TODO: Chose value for this
	objects: (T | null)[] = [];
	probSum: number[] = [];

	constructor(chances: Map<T | null, number> | null){
		if (chances != null){
			var last = 0;
			chances.forEach((prob: number, key: T | null) => {
				this.objects.push(key);
				last += prob;
				this.probSum.push(last);
			})
	
			this.normalize();
		}
	}

	static buildUniform<T>(objects: (T | null)[]): Probabilities<T>{
		var probabilities: Probabilities<T> = new Probabilities<T>(null);
		
		var prob = 1/objects.length;
		var last = 0;
		objects.forEach((key: (T | null)) => {
			probabilities.objects.push(key);
			last += prob;
			probabilities.probSum.push(last);
		})

		return probabilities;
	}

	add(object: T | null, prob: number) {
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

	update(object: T | null, newValue: number) {
		this.objects.forEach((key: T | null, i: number) => {
			if (key === object) {
				this.probSum[i] = newValue;
				return;
			}
		})
	}

	randPickOne(): T | null{
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
			if (allowDuplicates || pick == null || !picks.includes(pick)){
				if (pick){
					picks.push(pick);
				}
			}
		}
		if (picks.length === 1 && picks[0] == null){
			picks = [];
		}
		return picks;
	}

	randPickNum(num: number, allowDuplicates: boolean = true, countNull: boolean = true): T[]{
		var picks: T[] = [];
		var numNulls = 0;
		while(picks.length + numNulls < num) {
			var pick = this.randPickOne();
			if (allowDuplicates || pick == null || !picks.includes(pick)){
				if (pick){
					picks.push(pick);
				}
				else if (countNull){
					numNulls ++;
				}
			}
		}
		return picks;
	}

	private normalize(){
		//TODO: Check that this actually works
		if (this.probSum[this.probSum.length - 1] - 1 > this.epsilon){
			var factor = 1/this.probSum[this.probSum.length - 1];
			this.probSum.forEach((prob: number) => {
				prob *= factor;
			})
		}
	}
}