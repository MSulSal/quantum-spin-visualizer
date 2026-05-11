import type { Particle } from "../data/particles";

type ParticleFactPanelProps = {
	particle: Particle;
};

export function ParticleFactPanel({ particle }: ParticleFactPanelProps) {
	return (
		<aside className="glass-panel fact-panel">
			<div className={`particle-emblem ${particle.category}`}>
				<span>{particle.symbol}</span>
			</div>

			<div>
				<p className="eyebrow">{particle.family}</p>
				<h2>{particle.name}</h2>
				<p className="muted">{particle.shortDescription}</p>
			</div>

			<dl className="fact-list">
				<div>
					<dt>Spin</dt>
					<dd>{particle.spin}</dd>
				</div>
				<div>
					<dt>Charge</dt>
					<dd>{particle.charge}</dd>
				</div>
				<div>
					<dt>Mass</dt>
					<dd>{particle.mass}</dd>
				</div>
				{particle.generation && (
					<div>
						<dt>Generation</dt>
						<dd>{particle.generation}</dd>
					</div>
				)}
			</dl>

			<div>
				<h3>Interactions</h3>
				<div className="pill-row">
					{particle.interactions.map(interaction => (
						<span className="pill" key={interaction}>
							{interaction}
						</span>
					))}
				</div>
			</div>
		</aside>
	);
}
