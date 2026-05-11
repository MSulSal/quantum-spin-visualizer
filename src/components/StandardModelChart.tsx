import type { Particle } from "../data/particles.ts";

type StandardModelChartProps = {
	particles: Particle[];
	selectedId: string;
	onSelectParticle: (id: string) => void;
};

type ChartRow = {
	label: string;
	className: string;
	cells: Array<string | null>;
};

const chartRows: ChartRow[] = [
	{
		label: "up-type quarks",
		className: "quark-row",
		cells: ["up", "charm", "top", "gluon"],
	},
	{
		label: "down-type quarks",
		className: "quark-row",
		cells: ["down", "strange", "bottom", "photon"],
	},
	{
		label: "neutrinos",
		className: "lepton-row",
		cells: [
			"electron-neutrino",
			"muon-neutrino",
			"tau-neutrino",
			"z-boson",
		],
	},
	{
		label: "charged leptons",
		className: "lepton-row",
		cells: ["electron", "muon", "tau", "w-boson"],
	},
	{
		label: "scalar",
		className: "scalar-row",
		cells: [null, null, null, "higgs"],
	},
];

const columnHeaders = ["I", "II", "III", "Bosons"];

export function StandardModelChart({
	particles,
	selectedId,
	onSelectParticle,
}: StandardModelChartProps) {
	const particleById = new Map(
		particles.map(particle => [particle.id, particle]),
	);

	return (
		<div
			className="standard-model-chart"
			aria-label="Interactive Standard Model chart"
		>
			<div className="chart-title-row">
				<div className="chart-corner">Fermions</div>

				{columnHeaders.map(header => (
					<div className="chart-column-heading" key={header}>
						{header}
					</div>
				))}
			</div>

			{chartRows.map(row => (
				<div className={`chart-row ${row.className}`} key={row.label}>
					<div className="chart-row-label">{row.label}</div>

					{row.cells.map((particleId, index) => {
						if (!particleId) {
							return (
								<div
									className="particle-slot empty"
									key={`${row.label}-${index}`}
								/>
							);
						}

						const particle = particleById.get(particleId);

						if (!particle) {
							return (
								<div
									className="particle-slot empty"
									key={particleId}
								/>
							);
						}

						return (
							<button
								className={`sm-particle-card ${particle.category} ${
									particle.id === selectedId ? "selected" : ""
								}`}
								key={particle.id}
								onClick={() => onSelectParticle(particle.id)}
								type="button"
							>
								<span className="sm-symbol">
									{particle.symbol}
								</span>
								<span className="sm-name">{particle.name}</span>
								<span className="sm-meta">
									spin {particle.spin} · q {particle.charge}
								</span>
							</button>
						);
					})}
				</div>
			))}

			<div className="chart-legend">
				<span className="legend-item quark-dot">quarks</span>
				<span className="legend-item lepton-dot">leptons</span>
				<span className="legend-item boson-dot">gauge bosons</span>
				<span className="legend-item scalar-dot">scalar boson</span>
			</div>
		</div>
	);
}
