import type { Particle } from "../data/particles";

type EducationPanelProps = {
	particle: Particle;
};

function getSpinCopy(particle: Particle) {
	if (particle.spin === 0.5) {
		return {
			title: "Spin-1/2: spinor behavior",
			formula: "R = e^{-Bθ/2}",
			body: "The state is represented as a rotor-like even multivector. The half-angle is not a trick: it is the transformation law. At 360°, the spinor sign flips. At 720°, it returns.",
		};
	}

	if (particle.spin === 1) {
		return {
			title: "Spin-1: integer-spin behavior",
			formula: "v' = RvR̃",
			body: "The state transforms vector-like in this first visual model. A full 360° rotation returns the representation without the spinor sign flip.",
		};
	}

	return {
		title: "Spin-0: scalar behavior",
		formula: "s' = s",
		body: "A scalar has no directional spin structure in this visual model. Rotation changes the reference frame, but the scalar state itself remains invariant.",
	};
}

export function EducationPanel({ particle }: EducationPanelProps) {
	const copy = getSpinCopy(particle);

	return (
		<aside className="glass-panel education-panel">
			<p className="eyebrow">Geometric algebra lesson</p>
			<h2>{copy.title}</h2>

			<div className="formula-card">
				<code>{copy.formula}</code>
			</div>

			<p>{copy.body}</p>
			<p>{particle.gaLesson}</p>

			<div className="note-card">
				<strong>Not a tiny spinning ball.</strong>
				<span>
					Spin describes how the quantum state transforms under
					rotations. The animation starts from vectors, bivectors,
					rotors, and spinors before translating into particle
					categories.
				</span>
			</div>
		</aside>
	);
}
