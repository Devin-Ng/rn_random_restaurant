export type NativeMessage = Record<string, unknown>;

type MessageHandler = (message: NativeMessage) => void;

const handlers: MessageHandler[] = [];

export function postToNative(payload: NativeMessage): void {
	const bridge = (window as unknown as { ReactNativeWebView?: { postMessage: (data: string) => void } })
		.ReactNativeWebView;

	if (bridge) {
		bridge.postMessage(JSON.stringify(payload));
	} else if (typeof console !== 'undefined') {
		console.log('[webview -> native]', payload);
	}
}

export function onNativeMessage(handler: MessageHandler): void {
	handlers.push(handler);
}

function dispatch(raw: string): void {
	try {
		const message = JSON.parse(raw) as NativeMessage;
		handlers.forEach(handler => handler(message));
	} catch (error) {
		console.warn('[webview] failed to parse native message', error);
	}
}

// Android delivers messages on document, iOS on window.
document.addEventListener('message', (event: Event) => {
	dispatch((event as unknown as { data: string }).data);
});

window.addEventListener('message', (event: MessageEvent) => {
	if (typeof event.data === 'string') {
		dispatch(event.data);
	}
});

// Called by React Native via injectJavaScript.
(window as unknown as { __rrReceive: (message: NativeMessage) => void }).__rrReceive = message => {
	handlers.forEach(handler => handler(message));
};
