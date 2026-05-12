import { ArrowLeft, ArrowRight } from "lucide-react";
import { getParticleNeighbors, type Particle } from "../data/particles";
import { EducationPanel } from "./EducationPanel";
import { ParticleFactPanel } from "./ParticleFactPanel";
import { SpinScene } from "./SpinScene";

type ParticlePageProps = {
	particle: Particle;
	onBack: () => void;
	onSelectParticle: (id: string) => void;
};

export function ParticlePage({
	particle,
	onBack,
	onSelectParticle,
}: ParticlePageProps) {
	const { previous, next } = getParticleNeighbors(particle.id);

	return (
		<main className="particle-page">
			<nav className="top-nav">
				<button className="ghost-button" type="button" onClick={onBack}>
					<ArrowLeft size={17} />
					Standard Model
				</button>

				<div className="particle-nav">
					<button
						className="ghost-button"
						type="button"
						onClick={() => onSelectParticle(previous.id)}
					>
						<ArrowLeft size={17} />
						{previous.symbol}
					</button>
					<button
						className="ghost-button"
						type="button"
						onClick={() => onSelectParticle(next.id)}
					>
						{next.symbol}
						<ArrowRight size={17} />
					</button>
				</div>
			</nav>

			{/* <section className="particle-hero">
				<p className="eyebrow">Selected particle</p>
				<h1>
					{particle.name}
					<span>{particle.symbol}</span>
				</h1>
				<p>
					This page shows the particle's spin category as
					transformation behavior under rotation, using geometric
					algebra objects first: vectors, bivectors, rotors, and
					spinors.
				</p>
			</section> */}

			<div className="particle-layout">
				<ParticleFactPanel particle={particle} />
				<SpinScene particle={particle} />
				<EducationPanel particle={particle} />
			</div>
		</main>
	);
}
