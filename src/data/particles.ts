export type ParticleCategory =
	| "quark"
	| "lepton"
	| "gauge-boson"
	| "scalar-boson";

export type ParticleFamily = "fermion" | "boson";

export type Particle = {
	id: string;
	name: string;
	symbol: string;
	category: ParticleCategory;
	family: ParticleFamily;
	generation?: 1 | 2 | 3;
	spin: 0 | 0.5 | 1;
	charge: string;
	mass: string;
	interactions: string[];
	shortDescription: string;
	gaLesson: string;
};

export const particles: Particle[] = [
	{
		id: "up",
		name: "Up quark",
		symbol: "u",
		category: "quark",
		family: "fermion",
		generation: 1,
		spin: 0.5,
		charge: "+2/3",
		mass: "light",
		interactions: ["strong", "electromagnetic", "weak", "gravity"],
		shortDescription:
			"First-generation quark found inside protons and neutrons.",
		gaLesson:
			"As a spin-1/2 fermion, its state is modeled by a spinor: a rotor-like even multivector whose sign flips after 360° and returns after 720°.",
	},
	{
		id: "charm",
		name: "Charm quark",
		symbol: "c",
		category: "quark",
		family: "fermion",
		generation: 2,
		spin: 0.5,
		charge: "+2/3",
		mass: "medium",
		interactions: ["strong", "electromagnetic", "weak", "gravity"],
		shortDescription: "Second-generation up-type quark.",
		gaLesson:
			"The charm quark shares the spinor transformation behavior of all quarks: half-angle rotor structure and 720° spinor return.",
	},
	{
		id: "top",
		name: "Top quark",
		symbol: "t",
		category: "quark",
		family: "fermion",
		generation: 3,
		spin: 0.5,
		charge: "+2/3",
		mass: "very heavy",
		interactions: ["strong", "electromagnetic", "weak", "gravity"],
		shortDescription:
			"Third-generation up-type quark and the heaviest known elementary particle.",
		gaLesson:
			"Its mass is distinctive, but its spin category is still fermionic: spin-1/2 behavior under rotation.",
	},
	{
		id: "down",
		name: "Down quark",
		symbol: "d",
		category: "quark",
		family: "fermion",
		generation: 1,
		spin: 0.5,
		charge: "−1/3",
		mass: "light",
		interactions: ["strong", "electromagnetic", "weak", "gravity"],
		shortDescription:
			"First-generation quark found inside protons and neutrons.",
		gaLesson:
			"The down quark is a spinor state in this visualizer: the state, not a little ball, is what transforms under rotation.",
	},
	{
		id: "strange",
		name: "Strange quark",
		symbol: "s",
		category: "quark",
		family: "fermion",
		generation: 2,
		spin: 0.5,
		charge: "−1/3",
		mass: "medium",
		interactions: ["strong", "electromagnetic", "weak", "gravity"],
		shortDescription: "Second-generation down-type quark.",
		gaLesson:
			"Its spin behavior is the same spin-1/2 rotor lesson: a 360° turn changes spinor sign; a 720° turn returns it.",
	},
	{
		id: "bottom",
		name: "Bottom quark",
		symbol: "b",
		category: "quark",
		family: "fermion",
		generation: 3,
		spin: 0.5,
		charge: "−1/3",
		mass: "heavy",
		interactions: ["strong", "electromagnetic", "weak", "gravity"],
		shortDescription: "Third-generation down-type quark.",
		gaLesson:
			"The bottom quark is represented with the same fermion spinor model as the other quarks.",
	},
	{
		id: "electron-neutrino",
		name: "Electron neutrino",
		symbol: "νₑ",
		category: "lepton",
		family: "fermion",
		generation: 1,
		spin: 0.5,
		charge: "0",
		mass: "tiny",
		interactions: ["weak", "gravity"],
		shortDescription: "Neutral first-generation lepton.",
		gaLesson:
			"Even with no electric charge, the neutrino is a spin-1/2 fermion. The spinor transformation lesson still applies.",
	},
	{
		id: "muon-neutrino",
		name: "Muon neutrino",
		symbol: "νμ",
		category: "lepton",
		family: "fermion",
		generation: 2,
		spin: 0.5,
		charge: "0",
		mass: "tiny",
		interactions: ["weak", "gravity"],
		shortDescription: "Neutral second-generation lepton.",
		gaLesson:
			"This page uses the same spinor model: the physical observable can return after 360°, while the spinor itself needs 720°.",
	},
	{
		id: "tau-neutrino",
		name: "Tau neutrino",
		symbol: "ντ",
		category: "lepton",
		family: "fermion",
		generation: 3,
		spin: 0.5,
		charge: "0",
		mass: "tiny",
		interactions: ["weak", "gravity"],
		shortDescription: "Neutral third-generation lepton.",
		gaLesson:
			"Its spin is modeled as spin-1/2 transformation behavior, not literal spatial spinning.",
	},
	{
		id: "electron",
		name: "Electron",
		symbol: "e",
		category: "lepton",
		family: "fermion",
		generation: 1,
		spin: 0.5,
		charge: "−1",
		mass: "0.511 MeV",
		interactions: ["electromagnetic", "weak", "gravity"],
		shortDescription: "First-generation charged lepton.",
		gaLesson:
			"The electron is the clearest spin-1/2 example: R = e^(-Bθ/2), so 360° gives −ψ and 720° gives +ψ.",
	},
	{
		id: "muon",
		name: "Muon",
		symbol: "μ",
		category: "lepton",
		family: "fermion",
		generation: 2,
		spin: 0.5,
		charge: "−1",
		mass: "105.7 MeV",
		interactions: ["electromagnetic", "weak", "gravity"],
		shortDescription: "Second-generation charged lepton.",
		gaLesson:
			"The muon is heavier than the electron, but its spin representation is the same spinor transformation pattern.",
	},
	{
		id: "tau",
		name: "Tau",
		symbol: "τ",
		category: "lepton",
		family: "fermion",
		generation: 3,
		spin: 0.5,
		charge: "−1",
		mass: "1.777 GeV",
		interactions: ["electromagnetic", "weak", "gravity"],
		shortDescription: "Third-generation charged lepton.",
		gaLesson:
			"The tau uses the same spin-1/2 rotor/spinor lesson as the electron and muon.",
	},
	{
		id: "gluon",
		name: "Gluon",
		symbol: "g",
		category: "gauge-boson",
		family: "boson",
		spin: 1,
		charge: "0",
		mass: "0",
		interactions: ["strong"],
		shortDescription: "Gauge boson of the strong interaction.",
		gaLesson:
			"As a spin-1 boson, the gluon belongs to integer-spin behavior: the state representation returns after a 360° turn.",
	},
	{
		id: "photon",
		name: "Photon",
		symbol: "γ",
		category: "gauge-boson",
		family: "boson",
		spin: 1,
		charge: "0",
		mass: "0",
		interactions: ["electromagnetic"],
		shortDescription: "Gauge boson of electromagnetism.",
		gaLesson:
			"The photon is spin-1. This app treats its page as an integer-spin / polarization-style contrast with fermion spinors.",
	},
	{
		id: "z-boson",
		name: "Z boson",
		symbol: "Z",
		category: "gauge-boson",
		family: "boson",
		spin: 1,
		charge: "0",
		mass: "91.2 GeV",
		interactions: ["weak"],
		shortDescription: "Neutral weak gauge boson.",
		gaLesson:
			"The Z boson shows integer-spin behavior: a 360° rotation returns the state representation.",
	},
	{
		id: "w-boson",
		name: "W boson",
		symbol: "W",
		category: "gauge-boson",
		family: "boson",
		spin: 1,
		charge: "±1",
		mass: "80.4 GeV",
		interactions: ["weak"],
		shortDescription: "Charged weak gauge boson.",
		gaLesson:
			"The W boson is a spin-1 gauge boson. It contrasts with spin-1/2 fermions by returning after one full turn.",
	},
	{
		id: "higgs",
		name: "Higgs boson",
		symbol: "H",
		category: "scalar-boson",
		family: "boson",
		spin: 0,
		charge: "0",
		mass: "125 GeV",
		interactions: ["mass / Higgs field", "gravity"],
		shortDescription: "Scalar boson associated with the Higgs field.",
		gaLesson:
			"Spin-0 means scalar behavior under spatial rotation: no spinor sign flip and no directional spin axis.",
	},
];

export const particleOrder = particles.map(particle => particle.id);

export function getParticleById(id: string) {
	return particles.find(particle => particle.id === id) ?? particles[0];
}

export function getParticleNeighbors(id: string) {
	const index = particleOrder.indexOf(id);
	const safeIndex = index === -1 ? 0 : index;

	return {
		previous: getParticleById(
			particleOrder[
				(safeIndex - 1 + particleOrder.length) % particleOrder.length
			],
		),
		next: getParticleById(
			particleOrder[(safeIndex + 1) % particleOrder.length],
		),
	};
}
