import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Particle } from "../data/particles";
import {
	bivectorFromAxis,
	formatMultivector,
	rotateVector,
	rotorFromPlaneAngle,
	spinorSign,
	type Vector3,
} from "../math/clifford3.ts";

type SpinSceneProps = {
	particle: Particle;
};

type ProjectedPoint = {
	x: number;
	y: number;
};

const axis: Vector3 = { x: 0.35, y: 0.72, z: 0.59 };
const referenceVector: Vector3 = { x: 1, y: 0, z: 0 };

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function project(
	point: Vector3,
	width: number,
	height: number,
): ProjectedPoint {
	const scale = Math.min(width, height) * 0.24;
	const x = (point.x - point.z * 0.42) * scale + width / 2;
	const y = (-point.y + point.z * 0.24) * scale + height / 2;

	return { x, y };
}

function drawArrow(
	ctx: CanvasRenderingContext2D,
	from: ProjectedPoint,
	to: ProjectedPoint,
	color: string,
	width: number,
	label?: string,
) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const angle = Math.atan2(dy, dx);
	const length = Math.hypot(dx, dy);

	if (length < 2) return;

	ctx.save();
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();

	const size = Math.max(8, width * 3.4);

	ctx.translate(to.x, to.y);
	ctx.rotate(angle);
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(-size, size * 0.48);
	ctx.lineTo(-size * 0.72, 0);
	ctx.lineTo(-size, -size * 0.48);
	ctx.closePath();
	ctx.fill();
	ctx.restore();

	if (label) {
		ctx.save();
		ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, monospace";
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.9;
		ctx.fillText(label, to.x + 8, to.y - 8);
		ctx.restore();
	}
}

function drawPlane(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	angle: number,
	color: string,
) {
	const center = project({ x: 0, y: 0, z: 0 }, width, height);
	const radius = Math.min(width, height) * 0.22;

	ctx.save();
	ctx.translate(center.x, center.y);
	ctx.rotate(angle * 0.5);
	ctx.globalAlpha = 0.18;
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = 1.5;

	ctx.beginPath();
	ctx.ellipse(0, 0, radius * 1.35, radius * 0.58, -0.55, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = 0.55;
	ctx.stroke();

	ctx.restore();
}

function getAngleLimit(spin: Particle["spin"]) {
	return spin === 0.5 ? Math.PI * 4 : Math.PI * 2;
}

export function SpinScene({ particle }: SpinSceneProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const frameRef = useRef<number | null>(null);
	const [isPlaying, setIsPlaying] = useState(true);
	const [angle, setAngle] = useState(0);

	const angleLimit = getAngleLimit(particle.spin);
	const plane = useMemo(() => bivectorFromAxis(axis), []);

	const rotor = useMemo(() => {
		if (particle.spin === 0) {
			return rotorFromPlaneAngle(plane, 0);
		}

		return rotorFromPlaneAngle(
			plane,
			particle.spin === 0.5 ? angle : angle * 2,
		);
	}, [angle, particle.spin, plane]);

	const rotatedVector = useMemo(() => {
		if (particle.spin === 0) {
			return referenceVector;
		}

		if (particle.spin === 1) {
			return rotateVector(
				referenceVector,
				rotorFromPlaneAngle(plane, angle),
			);
		}

		return rotateVector(referenceVector, rotor);
	}, [angle, particle.spin, plane, rotor]);

	useEffect(() => {
		if (!isPlaying) return;

		let last = performance.now();

		function tick(now: number) {
			const delta = now - last;
			last = now;

			setAngle(current => {
				const next = current + delta * 0.00045 * angleLimit;

				return next % angleLimit;
			});

			frameRef.current = requestAnimationFrame(tick);
		}

		frameRef.current = requestAnimationFrame(tick);

		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};
	}, [angleLimit, isPlaying]);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) return;

		const ctx = canvas.getContext("2d");

		if (!ctx) return;

		const currentCanvas = canvas;
		const currentContext = ctx;

		function resizeCanvas() {
			const rect = currentCanvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;

			currentCanvas.width = Math.round(rect.width * dpr);
			currentCanvas.height = Math.round(rect.height * dpr);
			currentContext.setTransform(dpr, 0, 0, dpr, 0, 0);

			return rect;
		}

		const rect = resizeCanvas();
		const width = rect.width;
		const height = rect.height;

		currentContext.clearRect(0, 0, width, height);

		const origin = project({ x: 0, y: 0, z: 0 }, width, height);

		const basis = [
			{ v: { x: 1.18, y: 0, z: 0 }, label: "e₁", color: "#8b5cf6" },
			{ v: { x: 0, y: 1.18, z: 0 }, label: "e₂", color: "#22d3ee" },
			{ v: { x: 0, y: 0, z: 1.18 }, label: "e₃", color: "#f97316" },
		];

		currentContext.save();
		const gradient = currentContext.createRadialGradient(
			width / 2,
			height / 2,
			20,
			width / 2,
			height / 2,
			Math.max(width, height) * 0.55,
		);
		gradient.addColorStop(0, "rgba(148, 163, 184, 0.12)");
		gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
		currentContext.fillStyle = gradient;
		currentContext.fillRect(0, 0, width, height);
		currentContext.restore();

		drawPlane(currentContext, width, height, angle, "#a855f7");

		for (const item of basis) {
			drawArrow(
				currentContext,
				origin,
				project(item.v, width, height),
				item.color,
				2,
				item.label,
			);
		}

		drawArrow(
			currentContext,
			origin,
			project(referenceVector, width, height),
			"rgba(255,255,255,0.45)",
			2,
			"v",
		);

		drawArrow(
			currentContext,
			origin,
			project(rotatedVector, width, height),
			particle.spin === 0.5
				? "#34d399"
				: particle.spin === 1
					? "#60a5fa"
					: "#f8fafc",
			4,
			particle.spin === 0 ? "s" : "v′",
		);

		const axisTip = project(axis, width, height);

		drawArrow(
			currentContext,
			origin,
			axisTip,
			"rgba(244, 114, 182, 0.85)",
			2.5,
			"axis",
		);

		currentContext.save();
		currentContext.strokeStyle = "rgba(255,255,255,0.22)";
		currentContext.lineWidth = 1;
		currentContext.setLineDash([6, 8]);
		currentContext.beginPath();
		currentContext.arc(
			origin.x,
			origin.y,
			Math.min(width, height) * 0.31,
			0,
			Math.PI * 2,
		);
		currentContext.stroke();
		currentContext.restore();
	}, [angle, particle.spin, rotatedVector]);

	const degrees = (angle * 180) / Math.PI;
	const displayAngle = Math.round(degrees);
	const sign = particle.spin === 0.5 ? spinorSign(angle) : "+state";
	const rotorLabel =
		particle.spin === 0
			? "scalar invariant"
			: particle.spin === 1
				? "vector-like 360° return"
				: formatMultivector(rotor);

	return (
		<section className="glass-panel spin-scene">
			<div className="scene-header">
				<div>
					<p className="eyebrow">Rotor animation</p>
					<h2>
						{particle.spin === 0.5
							? "Spinor double-cover"
							: particle.spin === 1
								? "Integer-spin return"
								: "Scalar invariance"}
					</h2>
				</div>

				<div className="angle-badge">
					<span>{displayAngle}°</span>
					<strong>{sign}</strong>
				</div>
			</div>

			<div className="canvas-wrap">
				<canvas ref={canvasRef} />
			</div>

			<div className="scene-controls">
				<button
					type="button"
					onClick={() => setIsPlaying(value => !value)}
				>
					{isPlaying ? <Pause size={16} /> : <Play size={16} />}
					{isPlaying ? "Pause" : "Play"}
				</button>
				<button
					type="button"
					onClick={() => {
						setAngle(0);
						setIsPlaying(false);
					}}
				>
					<RotateCcw size={16} />
					Reset
				</button>
				<input
					aria-label="Rotation angle"
					max={angleLimit}
					min={0}
					onChange={event => setAngle(Number(event.target.value))}
					step={0.001}
					type="range"
					value={clamp(angle, 0, angleLimit)}
				/>
			</div>

			<div className="formula-strip">
				<code>
					{particle.spin === 0.5
						? "R = e^{-Bθ/2},  v′ = RvR̃"
						: particle.spin === 1
							? "v′ = RvR̃,  360° return"
							: "s′ = s"}
				</code>
				<span>{rotorLabel}</span>
			</div>
		</section>
	);
}
