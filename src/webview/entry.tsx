import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { onNativeMessage, postToNative } from './bridge';
import { mountGlassButtons } from './home/GlassButtons';
import { mountLiquidLogo } from './liquid-logo/logo';
import { Roulette } from './roulette/Roulette';

// liquid-glass-js (vendored) samples the page with html2canvas.
(window as unknown as { html2canvas: typeof html2canvas }).html2canvas = html2canvas;

// @shadergradient/react declares preserveDrawingBuffer but its published build
// never applies it, so html2canvas cannot read the gradient canvas. Force the
// attribute on every WebGL context this page creates.
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function patchedGetContext(
	this: HTMLCanvasElement,
	type: string,
	attributes?: unknown,
) {
	if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
		return originalGetContext.call(this, type as 'webgl', {
			...(attributes as object | undefined),
			preserveDrawingBuffer: true,
		});
	}
	return originalGetContext.call(
		this,
		type as '2d',
		attributes as CanvasRenderingContext2DSettings,
	);
} as typeof HTMLCanvasElement.prototype.getContext;

type Mode = 'home' | 'pick';

function GradientBackdrop() {
	return (
		<ShaderGradientCanvas
			style={{ position: 'absolute', inset: 0 }}
			pixelDensity={1.5}
			fov={45}
			preserveDrawingBuffer>
			<ShaderGradient
				control="props"
				type="plane"
				animate="off"
				uSpeed={0.1}
				uStrength={1.1}
				uDensity={0.8}
				uFrequency={2}
				uAmplitude={0.5}
				color1="#0d1420"
				color2="#131a2b"
				color3="#05070f"
				brightness={0.5}
				grain="off"
				reflection={0}
			/>
		</ShaderGradientCanvas>
	);
}

function HomeLayer() {
	const logoHost = useRef<HTMLDivElement>(null);
	const glassHost = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!logoHost.current) {
			return;
		}
		return mountLiquidLogo(logoHost.current, { text: 'RR' });
	}, []);

	useEffect(() => {
		postToNative({ type: 'ready' });
	}, []);

	useEffect(() => {
		if (!glassHost.current) {
			return;
		}
		// Delay so the gradient canvas has painted before the glass snapshot runs.
		const timer = window.setTimeout(() => mountGlassButtons(glassHost.current as HTMLDivElement), 900);
		return () => window.clearTimeout(timer);
	}, []);

	return (
		<div className="home">
			<div>
				<div className="logo-wrap" ref={logoHost} />
				<div className="home-kicker">Hong Kong</div>
				<div className="home-sub">
					Filter by district, cuisine and rating, then let the wheel decide where you eat tonight.
				</div>
			</div>
			<div className="glass-host" ref={glassHost} />
		</div>
	);
}

function PickLayer() {
	const [names, setNames] = useState<string[]>([]);
	const [winner, setWinner] = useState<string | null>(null);
	const [spinning, setSpinning] = useState(false);
	const [spun, setSpun] = useState(false);
	const [display, setDisplay] = useState('');

	useEffect(() => {
		onNativeMessage(message => {
			if (message.type !== 'candidates') {
				return;
			}
			const list = Array.isArray(message.names) ? (message.names as string[]) : [];
			setNames(list);
			setWinner(typeof message.winner === 'string' ? message.winner : null);
			setSpun(false);
			setDisplay('');
			window.setTimeout(() => setSpinning(true), 400);
		});

		postToNative({ type: 'ready' });
	}, []);

	useEffect(() => {
		if (!spinning || names.length === 0) {
			return;
		}
		let index = 0;
		const timer = window.setInterval(() => {
			setDisplay(names[index % names.length]);
			index += 1;
		}, 95);
		return () => window.clearInterval(timer);
	}, [spinning, names]);

	const handleSpun = () => {
		setSpinning(false);
		setSpun(true);
		if (winner) {
			setDisplay(winner);
		}
		postToNative({ type: 'spinComplete', winner });
	};

	return (
		<div className="pick">
			<div className="pick-canvas">
				<Roulette names={names} spinning={spinning} onSpun={handleSpun} />
			</div>
			<div className="pick-kicker">{spun ? 'Tonight you are eating at' : 'Picking your restaurant'}</div>
			<div
				className={`pick-name ${spinning ? 'is-spinning' : ''} ${spun ? 'is-winner' : ''}`}>
				{display}
			</div>
			{spun ? null : <div className="pick-hint">Good things are spinning into place</div>}
		</div>
	);
}

function App() {
	const mode: Mode = (window as unknown as { __RR_MODE__?: string }).__RR_MODE__ === 'pick' ? 'pick' : 'home';

	return (
		<>
			<GradientBackdrop />
			{mode === 'home' ? <HomeLayer /> : <PickLayer />}
		</>
	);
}

const container = document.getElementById('root');

if (container) {
	createRoot(container).render(<App />);
}
