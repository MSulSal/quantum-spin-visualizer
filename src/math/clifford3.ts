export type Multivector3 = {
	s: number;
	e1: number;
	e2: number;
	e3: number;
	e23: number;
	e31: number;
	e12: number;
	e123: number;
};

export type Vector3 = {
	x: number;
	y: number;
	z: number;
};

export type Bivector3 = {
	e23: number;
	e31: number;
	e12: number;
};

const BASIS_BITS = [0, 1, 2, 4, 6, 5, 3, 7] as const;
const BASIS_KEYS = [
	"s",
	"e1",
	"e2",
	"e3",
	"e23",
	"e31",
	"e12",
	"e123",
] as const;

type BasisKey = (typeof BASIS_KEYS)[number];

export const ZERO: Multivector3 = {
	s: 0,
	e1: 0,
	e2: 0,
	e3: 0,
	e23: 0,
	e31: 0,
	e12: 0,
	e123: 0,
};

export const ONE: Multivector3 = {
	...ZERO,
	s: 1,
};

export function vector(x: number, y: number, z: number): Multivector3 {
	return {
		...ZERO,
		e1: x,
		e2: y,
		e3: z,
	};
}

export function bivector(e23: number, e31: number, e12: number): Multivector3 {
	return {
		...ZERO,
		e23,
		e31,
		e12,
	};
}

export function add(a: Multivector3, b: Multivector3): Multivector3 {
	return {
		s: a.s + b.s,
		e1: a.e1 + b.e1,
		e2: a.e2 + b.e2,
		e3: a.e3 + b.e3,
		e23: a.e23 + b.e23,
		e31: a.e31 + b.e31,
		e12: a.e12 + b.e12,
		e123: a.e123 + b.e123,
	};
}

export function scale(a: Multivector3, factor: number): Multivector3 {
	return {
		s: a.s * factor,
		e1: a.e1 * factor,
		e2: a.e2 * factor,
		e3: a.e3 * factor,
		e23: a.e23 * factor,
		e31: a.e31 * factor,
		e12: a.e12 * factor,
		e123: a.e123 * factor,
	};
}

function popcount(value: number) {
	let count = 0;
	let current = value;

	while (current > 0) {
		count += current & 1;
		current >>= 1;
	}

	return count;
}

function multiplyBasisBlade(aBits: number, bBits: number) {
	let sign = 1;

	for (let i = 0; i < 3; i += 1) {
		if ((aBits & (1 << i)) === 0) continue;

		for (let j = 0; j < i; j += 1) {
			if ((bBits & (1 << j)) !== 0) {
				sign *= -1;
			}
		}
	}

	return {
		sign,
		bits: aBits ^ bBits,
	};
}

function bitsToKey(bits: number): BasisKey {
	const index = BASIS_BITS.indexOf(bits as (typeof BASIS_BITS)[number]);

	if (index === -1) {
		throw new Error(`Unknown basis bits: ${bits}`);
	}

	return BASIS_KEYS[index];
}

export function geometricProduct(
	a: Multivector3,
	b: Multivector3,
): Multivector3 {
	let result = ZERO;

	for (let i = 0; i < BASIS_KEYS.length; i += 1) {
		const aKey = BASIS_KEYS[i];
		const aValue = a[aKey];

		if (aValue === 0) continue;

		for (let j = 0; j < BASIS_KEYS.length; j += 1) {
			const bKey = BASIS_KEYS[j];
			const bValue = b[bKey];

			if (bValue === 0) continue;

			const product = multiplyBasisBlade(BASIS_BITS[i], BASIS_BITS[j]);
			const resultKey = bitsToKey(product.bits);

			result = {
				...result,
				[resultKey]: result[resultKey] + product.sign * aValue * bValue,
			};
		}
	}

	return result;
}

export function reverse(a: Multivector3): Multivector3 {
	return {
		s: a.s,
		e1: a.e1,
		e2: a.e2,
		e3: a.e3,
		e23: -a.e23,
		e31: -a.e31,
		e12: -a.e12,
		e123: -a.e123,
	};
}

export function magnitudeVector(v: Vector3) {
	return Math.hypot(v.x, v.y, v.z);
}

export function normalizeVector(v: Vector3): Vector3 {
	const length = magnitudeVector(v);

	if (length < 0.000001) {
		return { x: 1, y: 0, z: 0 };
	}

	return {
		x: v.x / length,
		y: v.y / length,
		z: v.z / length,
	};
}

export function normalizeBivector(B: Bivector3): Bivector3 {
	const length = Math.hypot(B.e23, B.e31, B.e12);

	if (length < 0.000001) {
		return { e23: 0, e31: 0, e12: 1 };
	}

	return {
		e23: B.e23 / length,
		e31: B.e31 / length,
		e12: B.e12 / length,
	};
}

export function rotorFromPlaneAngle(
	plane: Bivector3,
	theta: number,
): Multivector3 {
	const B = normalizeBivector(plane);
	const halfAngle = -theta / 2;

	return {
		...ZERO,
		s: Math.cos(halfAngle),
		e23: B.e23 * Math.sin(halfAngle),
		e31: B.e31 * Math.sin(halfAngle),
		e12: B.e12 * Math.sin(halfAngle),
	};
}

export function rotateVector(v: Vector3, R: Multivector3): Vector3 {
	const vectorMultivector = vector(v.x, v.y, v.z);
	const rotated = geometricProduct(
		geometricProduct(R, vectorMultivector),
		reverse(R),
	);

	return {
		x: rotated.e1,
		y: rotated.e2,
		z: rotated.e3,
	};
}

export function bivectorFromAxis(axis: Vector3): Bivector3 {
	const n = normalizeVector(axis);

	/**
	 * In Cl₃, the rotation plane bivector can be represented by I·n.
	 *
	 * I e₁ = e₂e₃
	 * I e₂ = e₃e₁
	 * I e₃ = e₁e₂
	 */
	return {
		e23: n.x,
		e31: n.y,
		e12: n.z,
	};
}

export function spinorSign(theta: number) {
	const turns = theta / (2 * Math.PI);

	if (Math.abs(turns - 1) < 0.03) return "-ψ";
	if (Math.abs(turns - 2) < 0.03) return "+ψ";

	return Math.cos(theta / 2) >= 0 ? "+ψ" : "-ψ";
}

export function formatMultivector(a: Multivector3) {
	const parts = [
		[a.s, ""],
		[a.e23, "e₂e₃"],
		[a.e31, "e₃e₁"],
		[a.e12, "e₁e₂"],
	] as const;

	const visible = parts
		.filter(([value]) => Math.abs(value) > 0.001)
		.map(([value, label], index) => {
			const rounded = Math.abs(value).toFixed(2);
			const sign = value < 0 ? "−" : index === 0 ? "" : "+";

			return `${sign}${rounded}${label}`;
		});

	return visible.length > 0 ? visible.join(" ") : "0";
}

export function gradeOfBasisKey(key: BasisKey) {
	const index = BASIS_KEYS.indexOf(key);

	return popcount(BASIS_BITS[index]);
}
