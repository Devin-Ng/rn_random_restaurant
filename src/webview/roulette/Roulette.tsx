import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type RouletteProps = {
	names: string[];
	spinning: boolean;
	onSpun: () => void;
};

const CARD_WIDTH = 2;
const CARD_HEIGHT = 1;
const RING_RADIUS = 4.3;

function roundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	centerX: number,
	centerY: number,
	maxWidth: number,
	lineHeight: number,
): void {
	const words = text.split(' ');
	const lines: string[] = [];
	let line = '';

	words.forEach(word => {
		const candidate = line ? `${line} ${word}` : word;
		if (ctx.measureText(candidate).width > maxWidth && line) {
			lines.push(line);
			line = word;
		} else {
			line = candidate;
		}
	});

	if (line) {
		lines.push(line);
	}

	const visible = lines.slice(0, 3);
	const startY = centerY - ((visible.length - 1) * lineHeight) / 2;
	visible.forEach((entry, index) => {
		ctx.fillText(entry, centerX, startY + index * lineHeight);
	});
}

function createLabelTexture(text: string): THREE.CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 320;
	const ctx = canvas.getContext('2d');

	if (ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		roundedRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 42);

		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, 'rgba(124, 231, 255, 0.34)');
		gradient.addColorStop(1, 'rgba(255, 143, 214, 0.34)');
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.lineWidth = 5;
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
		ctx.stroke();

		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = '700 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		wrapText(ctx, text, canvas.width / 2, canvas.height / 2, canvas.width - 80, 54);
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

function Ring({ names, spinning, onSpun }: RouletteProps) {
	const group = useRef<THREE.Group>(null);
	const speed = useRef(0);
	const settled = useRef(true);
	const textures = useMemo(() => names.map(createLabelTexture), [names]);

	useEffect(() => {
		return () => {
			textures.forEach(texture => texture.dispose());
		};
	}, [textures]);

	useEffect(() => {
		if (spinning && names.length > 0) {
			speed.current = 0.3 + Math.random() * 0.12;
			settled.current = false;
		}
	}, [spinning, names]);

	useFrame((_state, delta) => {
		const node = group.current;
		if (!node) {
			return;
		}

		if (!settled.current) {
			speed.current *= 0.983;
			if (speed.current < 0.0016) {
				speed.current = 0;
				settled.current = true;
				onSpun();
			}
		} else {
			speed.current = 0.0026;
		}

		node.rotation.y += speed.current * delta * 60;
	});

	const count = Math.max(names.length, 1);

	return (
		<group ref={group} rotation={[0.34, 0, 0]}>
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[RING_RADIUS, 0.035, 16, 120]} />
				<meshBasicMaterial color="#7ce7ff" transparent opacity={0.5} />
			</mesh>
			{textures.map((texture, index) => {
				const angle = (index / count) * Math.PI * 2;
				return (
					<mesh
						key={`${names[index]}-${index}`}
						position={[Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS]}
						rotation={[0, angle, 0]}>
						<planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
						<meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
					</mesh>
				);
			})}
		</group>
	);
}

export function Roulette(props: RouletteProps) {
	return (
		<Canvas
			dpr={[1, 1.8]}
			camera={{ position: [0, 3.1, 11.6], fov: 42 }}
			gl={{ antialias: true, alpha: true }}>
			<Ring {...props} />
		</Canvas>
	);
}
