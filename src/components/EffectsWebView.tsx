import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import { HOME_HTML, PICK_HTML } from '../generated/effectsHtml';

export type WebViewPayload = Record<string, unknown>;

type Props = {
	mode: 'home' | 'pick';
	onMessage?: (payload: WebViewPayload) => void;
	style?: StyleProp<ViewStyle>;
};

export type EffectsWebViewHandle = {
	send: (payload: WebViewPayload) => void;
};

export const EffectsWebView = forwardRef<EffectsWebViewHandle, Props>(
	({ mode, onMessage, style }, ref) => {
		const webViewRef = useRef<React.ComponentRef<typeof WebView>>(null);

		const send = useCallback((payload: WebViewPayload) => {
			const script = `window.__rrReceive(${JSON.stringify(payload)}); true;`;
			webViewRef.current?.injectJavaScript(script);
		}, []);

		useImperativeHandle(ref, () => ({ send }), [send]);

		const handleMessage = useCallback(
			(event: WebViewMessageEvent) => {
				try {
					onMessage?.(JSON.parse(event.nativeEvent.data) as WebViewPayload);
				} catch {
					// Ignore malformed payloads from the effects layer.
				}
			},
			[onMessage],
		);

		return (
			<WebView
				ref={webViewRef}
				style={[styles.webview, style]}
				source={{ html: mode === 'home' ? HOME_HTML : PICK_HTML, baseUrl: 'about:blank' }}
				originWhitelist={['*']}
				javaScriptEnabled
				domStorageEnabled
				scrollEnabled={false}
				bounces={false}
				overScrollMode="never"
				androidLayerType="hardware"
				setSupportMultipleWindows={false}
				onMessage={handleMessage}
			/>
		);
	},
);

EffectsWebView.displayName = 'EffectsWebView';

const styles = StyleSheet.create({
	webview: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});
