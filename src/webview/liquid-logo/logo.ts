import fragmentSource from '../vendor/liquid-logo/fragment-shader.glsl';
import vertexSource from '../vendor/liquid-logo/vertex-shader.glsl';

type LogoOptions = {
	text?: string;
	secondaryText?: string;
	speed?: number;
	iterations?: number;
	scale?: number;
};

// Tuned defaults derived from the "Glow" preset of collidingScopes/liquid-logo.
const DEFAULTS = {
	speed: 0.34,
	iterations: 15,
	scale: 3.11,
	dotFactor: 0.66,
	dotMultiplier: 0.36,
	vOffset: 6.0,
	intensityFactor: 0.1,
	expFactor: 1.8,
	noiseIntensity: 0.5,
	colorFactors: [-0.2, 0.0, 0.35] as [number, number, number],
	colorShift: 0.5,
	logoInteractStrength: 0.66,
};

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) {
		return null;
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.warn('[liquid-logo] shader compile failed', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createLogoTexture(text: string): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = 512;
	canvas.height = 512;
	const ctx = canvas.getContext('2d');

	if (ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = '900 210px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	}

	return canvas;
}

export function mountLiquidLogo(container: HTMLElement, options: LogoOptions = {}): () => void {
	const settings = { ...DEFAULTS, ...options };

	const canvas = document.createElement('canvas');
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	container.appendChild(canvas);

	const gl = canvas.getContext('webgl', {
		alpha: true,
		premultipliedAlpha: false,
		antialias: true,
	});

	if (!gl) {
		console.warn('[liquid-logo] WebGL unavailable');
		canvas.remove();
		return () => {};
	}

	const vertexShader = compile(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);

	if (!vertexShader || !fragmentShader) {
		canvas.remove();
		return () => {};
	}

	const program = gl.createProgram();
	if (!program) {
		canvas.remove();
		return () => {};
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.warn('[liquid-logo] program link failed', gl.getProgramInfoLog(program));
		canvas.remove();
		return () => {};
	}

	gl.useProgram(program);

	const quad = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quad);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	const uniforms = {
		resolution: gl.getUniformLocation(program, 'u_resolution'),
		time: gl.getUniformLocation(program, 'u_time'),
		speed: gl.getUniformLocation(program, 'u_speed'),
		iterations: gl.getUniformLocation(program, 'u_iterations'),
		scale: gl.getUniformLocation(program, 'u_scale'),
		dotFactor: gl.getUniformLocation(program, 'u_dotFactor'),
		vOffset: gl.getUniformLocation(program, 'u_vOffset'),
		intensityFactor: gl.getUniformLocation(program, 'u_intensityFactor'),
		expFactor: gl.getUniformLocation(program, 'u_expFactor'),
		colorFactors: gl.getUniformLocation(program, 'u_colorFactors'),
		colorShift: gl.getUniformLocation(program, 'u_colorShift'),
		dotMultiplier: gl.getUniformLocation(program, 'u_dotMultiplier'),
		noiseIntensity: gl.getUniformLocation(program, 'u_noiseIntensity'),
		logoTexture: gl.getUniformLocation(program, 'u_logoTexture'),
		logoOpacity: gl.getUniformLocation(program, 'u_logoOpacity'),
		logoScale: gl.getUniformLocation(program, 'u_logoScale'),
		logoAspectRatio: gl.getUniformLocation(program, 'u_logoAspectRatio'),
		logoInteractStrength: gl.getUniformLocation(program, 'u_logoInteractStrength'),
		logoBlendMode: gl.getUniformLocation(program, 'u_logoBlendMode'),
	};

	gl.uniform1f(uniforms.speed, settings.speed);
	gl.uniform1f(uniforms.iterations, settings.iterations);
	gl.uniform1f(uniforms.scale, settings.scale);
	gl.uniform1f(uniforms.dotFactor, settings.dotFactor);
	gl.uniform1f(uniforms.vOffset, settings.vOffset);
	gl.uniform1f(uniforms.intensityFactor, settings.intensityFactor);
	gl.uniform1f(uniforms.expFactor, settings.expFactor);
	gl.uniform3f(uniforms.colorFactors, ...settings.colorFactors);
	gl.uniform1f(uniforms.colorShift, settings.colorShift);
	gl.uniform1f(uniforms.dotMultiplier, settings.dotMultiplier);
	gl.uniform1f(uniforms.noiseIntensity, settings.noiseIntensity);
	gl.uniform1f(uniforms.logoOpacity, 1.0);
	gl.uniform1f(uniforms.logoScale, 1.0);
	gl.uniform1f(uniforms.logoInteractStrength, settings.logoInteractStrength);
	gl.uniform1i(uniforms.logoBlendMode, 0);

	const logoTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, logoTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.uniform1i(uniforms.logoTexture, 0);

	const paintLogo = () => {
		const logoCanvas = createLogoTexture(options.text ?? 'RR');
		gl.bindTexture(gl.TEXTURE_2D, logoTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logoCanvas);
	};

	paintLogo();

	const dpr = Math.min(window.devicePixelRatio || 1, 2);

	const resize = () => {
		const width = Math.max(container.clientWidth, 1);
		const height = Math.max(container.clientHeight, 1);
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
		gl.uniform1f(uniforms.logoAspectRatio, canvas.width / canvas.height);
	};

	resize();

	const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
	observer?.observe(container);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearColor(0, 0, 0, 0);

	const start = performance.now();
	let frame = 0;

	const render = () => {
		const elapsed = (performance.now() - start) / 1000;
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(uniforms.time, elapsed);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		frame = requestAnimationFrame(render);
	};

	render();

	return () => {
		cancelAnimationFrame(frame);
		observer?.disconnect();
		gl.deleteTexture(logoTexture);
		gl.deleteBuffer(quad);
		gl.deleteProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		canvas.remove();
	};
}
