import { useMemo, useState } from "react";
import { Rotate3D } from "lucide-react";
import { getParticleById, particles } from "./data/particles.ts";
import { ParticlePage } from "./components/ParticlePage.tsx";
import { StandardModelChart } from "./components/StandardModelChart.tsx";

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
			<header className="home-header">
				<div className="brand-lockup">
					<div className="logo-mark" aria-hidden="true">
						<Rotate3D size={22} strokeWidth={1.8} />
					</div>

					<div>
						<h1>rotorspin</h1>
						<p>
							Standard Model spin explained through geometric
							algebra rotors: vectors, bivectors, spinors, and the
							sandwich product.
						</p>
					</div>
				</div>

				<div className="header-thesis">
					<span>Core idea</span>
					<strong>
						Spin is transformation under rotation through bivectors,
						rotors, spinors, and half-angle state behavior.
					</strong>
				</div>
			</header>

			<section className="standard-model-section">
				<StandardModelChart
					particles={particles}
					selectedId={selectedParticle.id}
					onSelectParticle={selectParticle}
				/>
			</section>
		</main>
	);
}
