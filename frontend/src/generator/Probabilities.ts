export class Probabilities<T> {
	private epsilon = 0.0005; // TODO: Chose value for this
	objects: T[];
	probSum: number[];

	constructor(chances: Map<T, number>){
		var last = 0;
		chances.forEach((prob: number, key: T) => {
			this.objects.push(key);
			last += prob;
			this.probSum.push(last);
		})

		this.normalize();
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
		if (picks.length == 1 && picks[0] == null){
			picks = [];
		}
		return picks;
	}

	randPickNum(num: number, allowDuplicates: boolean = true): T[]{
		var picks: T[] = [];
		for (var i = 0; i < num; i++){
			var pick = this.randPickOne();
			if (allowDuplicates || !picks.includes(pick)){
				picks.push(pick);
			}
		}
		if (picks.length == 1 && picks[0] == null){
			picks = [];
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