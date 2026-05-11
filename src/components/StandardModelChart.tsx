import type { Particle } from "../data/particles";

type StandardModelChartProps = {
	particles: Particle[];
	selectedId: string;
	onSelectParticle: (id: string) => void;
};

const groups = [
	{
		title: "Quarks",
		category: "quark",
		description: "Spin-1/2 fermions with color charge.",
	},
	{
		title: "Leptons",
		category: "lepton",
		description: "Spin-1/2 fermions without color charge.",
	},
	{
		title: "Gauge Bosons",
		category: "gauge-boson",
		description: "Spin-1 force carriers.",
	},
	{
		title: "Scalar Boson",
		category: "scalar-boson",
		description: "Spin-0 scalar behavior.",
	},
] as const;

export function StandardModelChart({
	particles,
	selectedId,
	onSelectParticle,
}: StandardModelChartProps) {
	return (
		<section className="chart-shell" aria-label="Standard Model particles">
			{groups.map(group => {
				const groupParticles = particles.filter(
					particle => particle.category === group.category,
				);

				return (
					<div
						className={`particle-group ${group.category}`}
						key={group.category}
					>
						<div className="group-heading">
							<h2>{group.title}</h2>
							<p>{group.description}</p>
						</div>

						<div className="particle-grid">
							{groupParticles.map(particle => (
								<button
									className={`particle-card ${particle.category} ${
										particle.id === selectedId
											? "selected"
											: ""
									}`}
									key={particle.id}
									onClick={() =>
										onSelectParticle(particle.id)
									}
									type="button"
								>
									<span className="particle-symbol">
										{particle.symbol}
									</span>
									<span className="particle-name">
										{particle.name}
									</span>
									<span className="particle-meta">
										spin {particle.spin} · charge{" "}
										{particle.charge}
									</span>
								</button>
							))}
						</div>
					</div>
				);
			})}
		</section>
	);
}
