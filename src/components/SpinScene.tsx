import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Particle } from "../data/particles.ts";
import {
	bivectorFromAxis,
	formatMultivector,
	rotateVector,
	rotorFromPlaneAngle,
	type Vector3,
} from "../math/clifford3.ts";

type SpinSceneProps = {
	particle: Particle;
};

type ProjectedPoint = {
	x: number;
	y: number;
};

type ArrowOptions = {
	alpha?: number;
	dash?: number[];
};

const sceneOffset: Vector3 = { x: -0.08, y: -0.02, z: 0 };
const axis: Vector3 = normalizeSceneVector({ x: 0.35, y: 0.72, z: 0.59 });
const referenceVector: Vector3 = normalizeSceneVector({
	x: axis.y,
	y: -axis.x,
	z: 0,
});
const planeCompanionVector: Vector3 = normalizeSceneVector(
	crossVectors(axis, referenceVector),
);

const VECTOR_ORBIT_RADIUS = 0.96;
const BIVECTOR_PLANE_RADIUS = 0.86;
const ROTOR_ACTION_RADIUS = 20;
const ROTOR_ACTION_MARGIN = 34;

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function normalizeSceneVector(vector: Vector3): Vector3 {
	const length = Math.hypot(vector.x, vector.y, vector.z);

	if (length < 0.000001) {
		return { x: 1, y: 0, z: 0 };
	}

	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length,
	};
}

function crossVectors(a: Vector3, b: Vector3): Vector3 {
	return {
		x: a.y * b.z - a.z * b.y,
		y: a.z * b.x - a.x * b.z,
		z: a.x * b.y - a.y * b.x,
	};
}

function addVectors(a: Vector3, b: Vector3): Vector3 {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
		z: a.z + b.z,
	};
}

function scaleVector(vector: Vector3, factor: number): Vector3 {
	return {
		x: vector.x * factor,
		y: vector.y * factor,
		z: vector.z * factor,
	};
}

function getScenePoint(point: Vector3): Vector3 {
	return addVectors(point, sceneOffset);
}

function getPlaneVector(angle: number, radius: number): Vector3 {
	const alongReference = scaleVector(
		referenceVector,
		Math.cos(angle) * radius,
	);
	const alongCompanion = scaleVector(
		planeCompanionVector,
		Math.sin(angle) * radius,
	);

	return addVectors(alongReference, alongCompanion);
}

function getPlanePoint(angle: number, radius: number): Vector3 {
	return getScenePoint(getPlaneVector(angle, radius));
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

function getPositiveModuloAngle(angle: number) {
	const tau = Math.PI * 2;

	return ((angle % tau) + tau) % tau;
}

function getSweepAngle(angle: number) {
	const sweep = getPositiveModuloAngle(Math.abs(angle));

	if (sweep < 0.0001 && Math.abs(angle) > 0.0001) {
		return Math.PI * 2;
	}

	return sweep;
}

function drawArrowhead(
	ctx: CanvasRenderingContext2D,
	point: ProjectedPoint,
	angle: number,
	color: string,
	size: number,
	alpha = 1,
) {
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.translate(point.x, point.y);
	ctx.rotate(angle);
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(-size, size * 0.48);
	ctx.lineTo(-size * 0.72, 0);
	ctx.lineTo(-size, -size * 0.48);
	ctx.closePath();
	ctx.fill();

	ctx.restore();
}

function drawArrow(
	ctx: CanvasRenderingContext2D,
	from: ProjectedPoint,
	to: ProjectedPoint,
	color: string,
	width: number,
	label?: string,
	options: ArrowOptions = {},
) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const angle = Math.atan2(dy, dx);
	const length = Math.hypot(dx, dy);
	const alpha = options.alpha ?? 1;

	if (length < 2) return;

	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.setLineDash(options.dash ?? []);

	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();

	ctx.restore();

	drawArrowhead(ctx, to, angle, color, Math.max(8, width * 3.2), alpha);

	if (label) {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
		ctx.fillStyle = color;
		ctx.fillText(label, to.x + 7, to.y - 7);
		ctx.restore();
	}
}

function drawProjectedCurve(
	ctx: CanvasRenderingContext2D,
	points: ProjectedPoint[],
	color: string,
	width: number,
	options: {
		alpha?: number;
		dash?: number[];
		close?: boolean;
	} = {},
) {
	if (points.length < 2) return;

	ctx.save();
	ctx.globalAlpha = options.alpha ?? 1;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.setLineDash(options.dash ?? []);

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);

	for (const point of points.slice(1)) {
		ctx.lineTo(point.x, point.y);
	}

	if (options.close) {
		ctx.closePath();
	}

	ctx.stroke();
	ctx.restore();
}

function drawRotorGuide(
	ctx: CanvasRenderingContext2D,
	leftCenter: ProjectedPoint,
	origin: ProjectedPoint,
	rightCenter: ProjectedPoint,
) {
	ctx.save();

	ctx.strokeStyle = "rgba(244, 114, 182, 0.16)";
	ctx.lineWidth = 1;
	ctx.setLineDash([4, 8]);

	ctx.beginPath();
	ctx.moveTo(leftCenter.x, leftCenter.y);
	ctx.lineTo(origin.x, origin.y);
	ctx.lineTo(rightCenter.x, rightCenter.y);
	ctx.stroke();

	ctx.restore();
}

function drawBivectorPatch(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
) {
	const anchor = addVectors(
		scaleVector(referenceVector, -0.32),
		scaleVector(planeCompanionVector, -0.23),
	);
	const sideA = scaleVector(referenceVector, 0.25);
	const sideB = scaleVector(planeCompanionVector, 0.25);

	const p0 = project(getScenePoint(anchor), width, height);
	const p1 = project(getScenePoint(addVectors(anchor, sideA)), width, height);
	const p2 = project(
		getScenePoint(addVectors(addVectors(anchor, sideA), sideB)),
		width,
		height,
	);
	const p3 = project(getScenePoint(addVectors(anchor, sideB)), width, height);

	ctx.save();
	ctx.fillStyle = "rgba(168, 85, 247, 0.22)";
	ctx.strokeStyle = "rgba(216, 180, 254, 0.72)";
	ctx.lineWidth = 1.2;

	ctx.beginPath();
	ctx.moveTo(p0.x, p0.y);
	ctx.lineTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.lineTo(p3.x, p3.y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	ctx.restore();

	drawArrow(ctx, p0, p1, "rgba(216, 180, 254, 0.84)", 1.3, undefined, {
		alpha: 0.84,
	});
	drawArrow(ctx, p1, p2, "rgba(216, 180, 254, 0.84)", 1.3, undefined, {
		alpha: 0.84,
	});

	ctx.save();
	ctx.fillStyle = "rgba(216, 180, 254, 0.78)";
	ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
	ctx.fillText("|B| = 1", p2.x + 5, p2.y - 5);
	ctx.restore();
}

function drawBivectorPlane(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	color: string,
) {
	const points: ProjectedPoint[] = [];

	for (let index = 0; index <= 112; index += 1) {
		const angle = (index / 112) * Math.PI * 2;
		points.push(
			project(getPlanePoint(angle, BIVECTOR_PLANE_RADIUS), width, height),
		);
	}

	ctx.save();

	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.globalAlpha = 0.09;
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);

	for (const point of points.slice(1)) {
		ctx.lineTo(point.x, point.y);
	}

	ctx.closePath();
	ctx.fill();

	ctx.globalAlpha = 0.46;
	ctx.lineWidth = 1.3;
	ctx.stroke();

	ctx.globalAlpha = 0.18;
	ctx.setLineDash([6, 8]);
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);

	for (const point of points.slice(1)) {
		ctx.lineTo(point.x, point.y);
	}

	ctx.stroke();

	ctx.restore();

	const orientationStart = Math.PI * 0.15;
	const orientationEnd = Math.PI * 0.47;
	const orientationPoints: ProjectedPoint[] = [];

	for (let index = 0; index <= 24; index += 1) {
		const t = index / 24;
		const angle =
			orientationStart + (orientationEnd - orientationStart) * t;

		orientationPoints.push(
			project(
				getPlanePoint(angle, BIVECTOR_PLANE_RADIUS * 1.03),
				width,
				height,
			),
		);
	}

	drawProjectedCurve(
		ctx,
		orientationPoints,
		"rgba(216, 180, 254, 0.75)",
		1.8,
		{
			alpha: 0.78,
		},
	);

	const end = orientationPoints[orientationPoints.length - 1];
	const previous = orientationPoints[orientationPoints.length - 3];
	const arrowAngle = Math.atan2(end.y - previous.y, end.x - previous.x);

	drawArrowhead(ctx, end, arrowAngle, "rgba(216, 180, 254, 0.8)", 8, 0.8);

	const labelPoint = project(
		getPlanePoint(Math.PI * 0.02, BIVECTOR_PLANE_RADIUS * 1.1),
		width,
		height,
	);

	ctx.save();
	ctx.fillStyle = color;
	ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
	ctx.fillText("B", labelPoint.x + 5, labelPoint.y - 6);
	ctx.restore();

	drawBivectorPatch(ctx, width, height);
}

function drawVectorOrbit(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
) {
	const points: ProjectedPoint[] = [];

	for (let index = 0; index <= 128; index += 1) {
		const angle = (index / 128) * Math.PI * 2;
		points.push(
			project(getPlanePoint(angle, VECTOR_ORBIT_RADIUS), width, height),
		);
	}

	drawProjectedCurve(ctx, points, "rgba(248, 250, 252, 0.2)", 1.1, {
		dash: [3, 7],
		close: true,
	});
}

function drawAngleArc(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	angle: number,
) {
	const normalizedAngle = getSweepAngle(angle);
	const radius = 0.34;
	const steps = Math.max(8, Math.ceil(Math.abs(normalizedAngle) * 28));
	const points: ProjectedPoint[] = [];

	for (let index = 0; index <= steps; index += 1) {
		const t = index / steps;
		points.push(
			project(getPlanePoint(normalizedAngle * t, radius), width, height),
		);
	}

	drawProjectedCurve(ctx, points, "rgba(52, 211, 153, 0.82)", 2);

	const end = points[points.length - 1];
	const previous = points[Math.max(0, points.length - 3)];
	const arrowAngle = Math.atan2(end.y - previous.y, end.x - previous.x);

	drawArrowhead(ctx, end, arrowAngle, "rgba(52, 211, 153, 0.92)", 8, 0.92);

	const labelPoint = project(
		getPlanePoint(normalizedAngle * 0.55, radius * 1.18),
		width,
		height,
	);

	ctx.save();
	ctx.fillStyle = "rgba(52, 211, 153, 0.92)";
	ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, monospace";
	ctx.fillText("θ", labelPoint.x + 4, labelPoint.y - 4);
	ctx.restore();
}

function drawRotorActionOrbit(
	ctx: CanvasRenderingContext2D,
	center: ProjectedPoint,
	rotorAngle: number,
	label: string,
	subLabel: string,
	color: string,
) {
	ctx.save();

	ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(center.x, center.y, ROTOR_ACTION_RADIUS, 0, Math.PI * 2);
	ctx.stroke();

	ctx.restore();

	const sweep = getSweepAngle(rotorAngle);
	const direction = rotorAngle >= 0 ? 1 : -1;
	const start = -Math.PI / 2;
	const end = start + direction * sweep;
	const anticlockwise = direction < 0;

	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = 2.2;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.arc(center.x, center.y, ROTOR_ACTION_RADIUS, start, end, anticlockwise);
	ctx.stroke();

	ctx.restore();

	const arrowPoint = {
		x: center.x + Math.cos(end) * ROTOR_ACTION_RADIUS,
		y: center.y + Math.sin(end) * ROTOR_ACTION_RADIUS,
	};
	const arrowAngle = end + (direction > 0 ? Math.PI / 2 : -Math.PI / 2);

	drawArrowhead(ctx, arrowPoint, arrowAngle, color, 7, 1);

	ctx.save();

	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillStyle = "#f8fafc";
	ctx.font = "800 12px ui-monospace, SFMono-Regular, Menlo, monospace";
	ctx.fillText(label, center.x, center.y - 2);

	ctx.fillStyle = "#94a3b8";
	ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
	ctx.fillText(subLabel, center.x, center.y + 12);

	ctx.restore();
}

function getRotorSideCenters(
	width: number,
	height: number,
	origin: ProjectedPoint,
): {
	left: ProjectedPoint;
	right: ProjectedPoint;
} {
	const e1Tip = project(
		getScenePoint({ x: 1.04, y: 0, z: 0 }),
		width,
		height,
	);
	const dx = e1Tip.x - origin.x;
	const dy = e1Tip.y - origin.y;
	const length = Math.hypot(dx, dy);

	if (length < 0.000001 || Math.abs(dx) < 0.000001) {
		return {
			left: {
				x: ROTOR_ACTION_MARGIN + ROTOR_ACTION_RADIUS,
				y: origin.y,
			},
			right: {
				x: width - ROTOR_ACTION_MARGIN - ROTOR_ACTION_RADIUS,
				y: origin.y,
			},
		};
	}

	const direction = {
		x: dx / length,
		y: dy / length,
	};

	const leftX = ROTOR_ACTION_MARGIN + ROTOR_ACTION_RADIUS;
	const rightX = width - ROTOR_ACTION_MARGIN - ROTOR_ACTION_RADIUS;
	const leftT = (leftX - origin.x) / direction.x;
	const rightT = (rightX - origin.x) / direction.x;

	return {
		left: {
			x: leftX,
			y: clamp(
				origin.y + direction.y * leftT,
				ROTOR_ACTION_MARGIN + ROTOR_ACTION_RADIUS,
				height - ROTOR_ACTION_MARGIN - ROTOR_ACTION_RADIUS,
			),
		},
		right: {
			x: rightX,
			y: clamp(
				origin.y + direction.y * rightT,
				ROTOR_ACTION_MARGIN + ROTOR_ACTION_RADIUS,
				height - ROTOR_ACTION_MARGIN - ROTOR_ACTION_RADIUS,
			),
		},
	};
}

function drawRotorActionOrbits(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	origin: ProjectedPoint,
	angle: number,
	spin: Particle["spin"],
) {
	if (spin === 0) return;

	const { left, right } = getRotorSideCenters(width, height, origin);
	const halfAngle = angle / 2;
	const halfDegrees = Math.round((angle * 180) / Math.PI / 2);

	drawRotorGuide(ctx, left, origin, right);

	drawRotorActionOrbit(
		ctx,
		left,
		-halfAngle,
		"R",
		`−${halfDegrees}°`,
		"#a78bfa",
	);

	drawRotorActionOrbit(
		ctx,
		right,
		halfAngle,
		"R̃",
		`+${halfDegrees}°`,
		"#22d3ee",
	);
}

function getAngleLimit(spin: Particle["spin"]) {
	return spin === 0.5 ? Math.PI * 4 : Math.PI * 2;
}

function formatCoefficient(value: number) {
	if (Math.abs(value) < 0.005) return "0.00";

	const rounded = value.toFixed(2);

	return rounded === "-0.00" ? "0.00" : rounded;
}

function formatSpinorEquation(spin: Particle["spin"], angle: number) {
	if (spin === 0) {
		return "ψ = s";
	}

	if (spin === 1) {
		return "state angle = θ";
	}

	const scalar = Math.cos(angle / 2);
	const bivector = -Math.sin(angle / 2);
	const sign = bivector < 0 ? "−" : "+";

	return `ψ = ${formatCoefficient(scalar)} ${sign} ${formatCoefficient(
		Math.abs(bivector),
	)}B`;
}

function getSpinorCopy(spin: Particle["spin"], angle: number) {
	const degrees = Math.round((angle * 180) / Math.PI);

	if (spin === 0) {
		return {
			status: "s",
			substatus: "invariant",
			description: "Spin-0 has no spinor sign flip.",
			returnCopy: "scalar: unchanged by rotation",
		};
	}

	if (spin === 1) {
		return {
			status: "state",
			substatus: degrees >= 350 ? "returned" : "one turn",
			description:
				"This simplified spin-1 view returns after one 360° rotation.",
			returnCopy:
				degrees >= 350
					? "integer spin: returned after 360°"
					: "integer spin: 360° return",
		};
	}

	if (degrees >= 710) {
		return {
			status: "ψ ↑",
			substatus: "full return",
			description:
				"The spinor has returned to +ψ after two vector turns.",
			returnCopy: "spinor: full return at 720°",
		};
	}

	if (degrees >= 360) {
		return {
			status: "ψ ↓",
			substatus: "second sheet",
			description:
				"The vector repeats its orientation, but the spinor is on the −ψ sheet.",
			returnCopy: "spinor: second sheet",
		};
	}

	return {
		status: "ψ ↑",
		substatus: "first sheet",
		description: "The spinor is moving from +ψ toward −ψ.",
		returnCopy: "spinor: first sheet",
	};
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

		return rotorFromPlaneAngle(plane, angle);
	}, [angle, particle.spin, plane]);

	const rotatedVector = useMemo(() => {
		if (particle.spin === 0) {
			return referenceVector;
		}

		return rotateVector(referenceVector, rotor);
	}, [particle.spin, rotor]);

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
		const origin = project(
			getScenePoint({ x: 0, y: 0, z: 0 }),
			width,
			height,
		);

		currentContext.clearRect(0, 0, width, height);

		currentContext.save();
		const gradient = currentContext.createRadialGradient(
			width / 2,
			height / 2,
			20,
			width / 2,
			height / 2,
			Math.max(width, height) * 0.55,
		);
		gradient.addColorStop(0, "rgba(148, 163, 184, 0.1)");
		gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
		currentContext.fillStyle = gradient;
		currentContext.fillRect(0, 0, width, height);
		currentContext.restore();

		drawRotorActionOrbits(
			currentContext,
			width,
			height,
			origin,
			angle,
			particle.spin,
		);
		drawBivectorPlane(currentContext, width, height, "#a855f7");
		drawVectorOrbit(currentContext, width, height);
		drawAngleArc(currentContext, width, height, angle);

		const basis = [
			{ v: { x: 1.04, y: 0, z: 0 }, label: "e₁", color: "#8b5cf6" },
			{ v: { x: 0, y: 1.04, z: 0 }, label: "e₂", color: "#22d3ee" },
			{ v: { x: 0, y: 0, z: 1.04 }, label: "e₃", color: "#f97316" },
		];

		for (const item of basis) {
			drawArrow(
				currentContext,
				origin,
				project(getScenePoint(item.v), width, height),
				item.color,
				1.6,
				item.label,
				{ alpha: 0.64 },
			);
		}

		const axisTip = project(
			getScenePoint(scaleVector(axis, 0.86)),
			width,
			height,
		);

		drawArrow(
			currentContext,
			origin,
			axisTip,
			"rgba(244, 114, 182, 0.32)",
			1.5,
			"dual axis",
			{ alpha: 0.52 },
		);

		drawArrow(
			currentContext,
			origin,
			project(
				getScenePoint(scaleVector(referenceVector, 1.02)),
				width,
				height,
			),
			"rgba(248, 250, 252, 0.55)",
			1.9,
			"v₀",
			{ alpha: 0.54, dash: [5, 7] },
		);

		drawArrow(
			currentContext,
			origin,
			project(
				getScenePoint(scaleVector(rotatedVector, 1.02)),
				width,
				height,
			),
			particle.spin === 0.5
				? "#34d399"
				: particle.spin === 1
					? "#60a5fa"
					: "#f8fafc",
			3.8,
			particle.spin === 0 ? "s" : "v(θ)",
		);
	}, [angle, particle.spin, rotatedVector]);

	const degrees = Math.round((angle * 180) / Math.PI);
	const halfDegrees = Math.round(degrees / 2);
	const spinorCopy = getSpinorCopy(particle.spin, angle);
	const spinorEquation = formatSpinorEquation(particle.spin, angle);
	const rotorLabel =
		particle.spin === 0
			? "scalar invariant"
			: particle.spin === 1
				? "integer-spin representation returns after 360°"
				: formatMultivector(rotor);

	return (
		<section className="glass-panel spin-scene">
			<div className="scene-header">
				<div className="scene-title">
					<p className="eyebrow">Rotor sandwich</p>
					<h2>
						{particle.spin === 0.5
							? "Spinor double-cover"
							: particle.spin === 1
								? "Integer-spin return"
								: "Scalar invariance"}
					</h2>
				</div>

				<div className="spinor-equation-card">
					<span>Spinor state</span>
					<code>{spinorEquation}</code>
					<p>{spinorCopy.description}</p>
				</div>

				<div className="angle-badge">
					<span>{degrees}° rotation</span>
					<strong>{spinorCopy.status}</strong>
					<em>{spinorCopy.substatus}</em>
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

			<div className="sandwich-readout">
				<div
					className={`rotor-chip left ${particle.spin === 0 ? "scalar" : ""}`}
				>
					<span className="rotor-symbol">
						{particle.spin === 0 ? "s" : "R"}
					</span>
					<span className="rotor-angle">
						{particle.spin === 0 ? "scalar" : `−${halfDegrees}°`}
					</span>
				</div>

				<div className="vector-chip">
					<span className="rotor-symbol">
						{particle.spin === 0 ? "s" : "v(θ)"}
					</span>
					<span className="rotor-angle">
						{particle.spin === 0 ? "unchanged" : `${degrees}°`}
					</span>
				</div>

				<div
					className={`rotor-chip right ${particle.spin === 0 ? "scalar" : ""}`}
				>
					<span className="rotor-symbol">
						{particle.spin === 0 ? "s′" : "R̃"}
					</span>
					<span className="rotor-angle">
						{particle.spin === 0 ? "same" : `+${halfDegrees}°`}
					</span>
				</div>
			</div>

			<div className="spin-state-readout">
				<div>
					<span>Equation</span>
					<strong>
						{particle.spin === 0 ? "s′ = s" : "v(θ) = R v₀ R̃"}
					</strong>
				</div>
				<div>
					<span>Bivector</span>
					<strong>B = unit oriented plane</strong>
				</div>
				<div>
					<span>Return</span>
					<strong>{spinorCopy.returnCopy}</strong>
				</div>
			</div>

			<div className="formula-strip">
				<code>
					{particle.spin === 0
						? "s′ = s"
						: "ψ = R,   R = e^{-Bθ/2},   R̃ = e^{Bθ/2}"}
				</code>
				<span>{rotorLabel}</span>
			</div>
		</section>
	);
}
