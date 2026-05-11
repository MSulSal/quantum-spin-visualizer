import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Particle } from "../data/particles";

type ParticleFactPanelProps = {
	particle: Particle;
};

const MOBILE_FACT_PANEL_QUERY = "(max-width: 820px)";

function useMobileFactPanelOpen() {
	const [isOpen, setIsOpen] = useState(() => {
		if (typeof window === "undefined") return true;

		return !window.matchMedia(MOBILE_FACT_PANEL_QUERY).matches;
	});

	useEffect(() => {
		const mediaQuery = window.matchMedia(MOBILE_FACT_PANEL_QUERY);

		function syncPanelState() {
			setIsOpen(!mediaQuery.matches);
		}

		syncPanelState();
		mediaQuery.addEventListener("change", syncPanelState);

		return () => mediaQuery.removeEventListener("change", syncPanelState);
	}, []);

	return [isOpen, setIsOpen] as const;
}

export function ParticleFactPanel({ particle }: ParticleFactPanelProps) {
	const [isOpen, setIsOpen] = useMobileFactPanelOpen();

	return (
		<aside className={`glass-panel fact-panel ${isOpen ? "open" : ""}`}>
			<button
				className="fact-panel-toggle"
				type="button"
				aria-expanded={isOpen}
				onClick={() => setIsOpen(value => !value)}
			>
				<span className={`fact-toggle-symbol ${particle.category}`}>
					{particle.symbol}
				</span>

				<span className="fact-toggle-copy">
					<strong>{particle.name}</strong>
					<em>
						{particle.family} · spin {particle.spin}
					</em>
				</span>

				<ChevronDown size={16} aria-hidden="true" />
			</button>

			<div className="fact-panel-content">
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
			</div>
		</aside>
	);
}
