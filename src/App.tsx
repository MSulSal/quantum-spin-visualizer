import { useMemo, useState } from "react";
import { Atom, ExternalLink } from "lucide-react";
import { getParticleById, particles } from "./data/particles";
import { ParticlePage } from "./components/ParticlePage";
import { StandardModelChart } from "./components/StandardModelChart";

type Route =
	| {
			name: "home";
	  }
	| {
			name: "particle";
			id: string;
	  };

export default function App() {
	const [route, setRoute] = useState<Route>({ name: "home" });
	const [selectedId, setSelectedId] = useState("electron");

	const selectedParticle = useMemo(
		() => getParticleById(selectedId),
		[selectedId],
	);

	function selectParticle(id: string) {
		setSelectedId(id);
		setRoute({ name: "particle", id });
	}

	if (route.name === "particle") {
		return (
			<ParticlePage
				particle={getParticleById(route.id)}
				onBack={() => setRoute({ name: "home" })}
				onSelectParticle={selectParticle}
			/>
		);
	}

	return (
		<main className="home-page">
			<header className="hero">
				<div className="hero-copy">
					<div className="brand-pill">
						<Atom size={18} />
						Quantum Spin Visualizer
					</div>

					<h1>Spin through geometric algebra rotors.</h1>

					<p>
						Spin is not a tiny ball spinning. It is how a quantum
						state transforms under rotations. This visualizer starts
						with real 3D geometry: vectors, bivectors, rotors, and
						spinors.
					</p>

					<div className="hero-actions">
						<button
							type="button"
							onClick={() => selectParticle("electron")}
						>
							Start with the electron
						</button>
						<a href="https://github.com/" aria-label="Repository">
							<ExternalLink size={17} />
							Repository
						</a>
					</div>
				</div>

				<div className="glass-panel thesis-card">
					<p className="eyebrow">Core lesson</p>
					<h2>The geometry was hidden by notation.</h2>
					<p>In Cl₃, spinors live in the even subalgebra:</p>
					<code>R = a + b e₂e₃ + c e₃e₁ + d e₁e₂</code>
					<p>
						For spin-1/2, the half-angle rotor explains why a 360°
						turn changes sign and a 720° turn returns the spinor.
					</p>
				</div>
			</header>

			<section className="section-heading">
				<p className="eyebrow">Particle selector</p>
				<h2>The Standard Model as a spin interface</h2>
				<p>
					Click a particle to open its spin page. Fermions show spinor
					double-cover behavior, gauge bosons show integer-spin
					behavior, and the Higgs shows scalar invariance.
				</p>
			</section>

			<StandardModelChart
				particles={particles}
				selectedId={selectedParticle.id}
				onSelectParticle={selectParticle}
			/>
		</main>
	);
}
