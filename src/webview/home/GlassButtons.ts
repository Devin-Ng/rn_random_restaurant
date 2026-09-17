import { postToNative } from '../bridge';

type GlassElement = { element: HTMLElement };

type ContainerCtor = new (options: Record<string, unknown>) => GlassElement & {
	addChild: (child: GlassElement) => void;
};

type ButtonCtor = new (options: Record<string, unknown>) => GlassElement;

// Container and Button are provided by the vendored liquid-glass-js scripts
// (dashersw/liquid-glass-js) exposed as window globals by the build step.
export function mountGlassButtons(host: HTMLElement): () => void {
	const scope = window as unknown as { Container?: ContainerCtor; Button?: ButtonCtor };
	const Container = scope.Container;
	const Button = scope.Button;

	if (!Container || !Button) {
		console.warn('[liquid-glass] vendored globals missing');
		return () => {};
	}

	try {
		const container = new Container({
			type: 'pill',
			borderRadius: 28,
			tintOpacity: 0.26,
		});

		const pickButton = new Button({
			text: 'Pick a restaurant',
			size: 15,
			type: 'pill',
			tintOpacity: 0.42,
			warp: true,
			onClick: () => postToNative({ type: 'action', action: 'pick' }),
		});

		const filterButton = new Button({
			text: 'Filters',
			size: 15,
			type: 'pill',
			tintOpacity: 0.24,
			onClick: () => postToNative({ type: 'action', action: 'filters' }),
		});

		container.addChild(pickButton);
		container.addChild(filterButton);
		host.appendChild(container.element);

		return () => {
			container.element.remove();
		};
	} catch (error) {
		console.warn('[liquid-glass] failed to mount buttons', error);
		return () => {};
	}
}
