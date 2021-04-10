export class Probabilities<T> {
	private epsilon = 0.0005; // TODO: Chose value for this
	objects: (T)[] = [];
	probSum: number[] = [];

	constructor(chances: Map<T, number> | null, normalize = true){
		if (chances != null){
			var last = 0;
			chances.forEach((prob: number, key: T) => {
				this.objects.push(key);
				last += prob;
				this.probSum.push(last);
			})
			
			if (normalize) {
				this.normalize();
			}
		}
	}

	static buildUniform<T>(objects: (T)[]): Probabilities<T>{
		var probabilities: Probabilities<T> = new Probabilities<T>(null);
		
		var prob = 1/objects.length;
		var last = 0;
		objects.forEach((key: (T)) => {
			probabilities.objects.push(key);
			last += prob;
			probabilities.probSum.push(last);
		})

		return probabilities;
	}

	toMap(): Map<T, number>{
        var map = new Map<T, number>();
		if (!this.objects || this.objects.length === 0 || (this.objects.length === 1 && this.objects[0] === null)){
			return map;
		}

        this.probSum.forEach((sum: number, index: number) => {
            var prob = sum;
            if (index > 0) {
                prob -= this.probSum[index - 1];
            }
			if (this.objects[index]){
				map.set(this.objects[index] as T, parseFloat(prob.toFixed(4)));
			}
        })

        return map;
    }

	add(object: T) {
		this.objects.push(object);
		if (this.probSum.length - 1 >= 0) {
			// This will give it a zero probability, if there are other items in the list
			this.probSum.push(this.probSum[this.probSum.length-1]);
		} else {
			this.probSum.push(1);
		}
	}

	remove(index: number) {
		if (index >= 0 && index < this.objects.length) {
			this.objects.splice(index, 1);
			this.probSum.splice(index, 1);
			this.normalize();
		}
	}

	updateObject(object: T, newObject: T) {
		var index = this.objects.indexOf(object);
		this.objects[index] = newObject;
	}

	randPickOne(): T | null{
		if (!this.objects || this.objects.length === 0){
			return null;
		}

		var rand = Math.random();
		var i = 0;
		while (i < this.probSum.length - 1 && this.probSum[i] < rand){
			i++;
		}

		return this.objects[i];
	}

	randPickMany(amountModifier: number, allowDuplicates: boolean = true): T[]{
		if (!this.objects || this.objects.length === 0){
			return [];
		}

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
		if (picks.length === 1 && picks[0] === null){
			picks = [];
		}
		return picks;
	}

	randPickNum(num: number, allowDuplicates: boolean = true, countNull: boolean = true): T[]{
		if (!this.objects || this.objects.length === 0){
			return [];
		}
		
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

	normalize(){
		var length = this.probSum ? this.probSum.length : 0;
		if (length === 1){
			this.probSum[length - 1] = 1;
		}
		else if (length > 1 && Math.abs(this.probSum[length - 1] - 1) > this.epsilon){
			var factor = 1/this.probSum[length - 1];
			var probs = [this.probSum[0]];
			for (var i = 1; i < length; i++) {
				probs.push((this.probSum[i] - this.probSum[i - 1]));
			}
			this.probSum[0] = probs[0] * factor;
			for (var i = 1; i < length; i++) {
				this.probSum[i] = (probs[i] * factor) + this.probSum[i - 1];
			}
		}
	}
}