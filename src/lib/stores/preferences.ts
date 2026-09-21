import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'sqlek_hide_syntax_pattern';

function getInitialValue(): boolean {
	try {
		if ((browser || typeof window !== 'undefined') && typeof localStorage !== 'undefined') {
			return localStorage.getItem(STORAGE_KEY) === 'true';
		}
	} catch {
		// Ignore storage errors in restricted contexts
	}
	return false;
}

export const hideSyntaxPattern = writable<boolean>(getInitialValue());

hideSyntaxPattern.subscribe((value) => {
	try {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, String(value));
		}
	} catch {
		// Ignore storage errors in restricted contexts
	}
});

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
	window.addEventListener('storage', (event) => {
		if (event.key === STORAGE_KEY) {
			hideSyntaxPattern.set(event.newValue === 'true');
		}
	});
}

export function toggleHideSyntaxPattern(): void {
	hideSyntaxPattern.update((value) => !value);
}

export function setHideSyntaxPattern(value: boolean): void {
	hideSyntaxPattern.set(value);
}
