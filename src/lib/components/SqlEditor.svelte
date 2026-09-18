<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorState, Compartment } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { sql, PostgreSQL, MySQL } from '@codemirror/lang-sql';
	import { autocompletion } from '@codemirror/autocomplete';
	import { linter, type Diagnostic } from '@codemirror/lint';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { oneDark } from '@codemirror/theme-one-dark';

	let {
		value = $bindable(''),
		dbms = 'postgres',
		tableNames = [],
		readOnly = false,
		onRun = () => {}
	}: {
		value: string;
		dbms?: 'postgres' | 'mysql';
		tableNames?: string[];
		readOnly?: boolean;
		onRun?: () => void;
	} = $props();

	let editorContainer: HTMLDivElement;
	let view: EditorView | null = null;
	let lintTimeout: ReturnType<typeof setTimeout> | null = null;
	const readOnlyCompartment = new Compartment();
	const editableCompartment = new Compartment();

	function createLinter() {
		return linter(async (view) => {
			const doc = view.state.doc.toString().trim();
			if (!doc) return [];

			return new Promise<Diagnostic[]>((resolve) => {
				if (lintTimeout) clearTimeout(lintTimeout);
				lintTimeout = setTimeout(() => {
					const diagnostics: Diagnostic[] = [];
					let singleQuoteOpen = false;
					let openParenCount = 0;

					for (let i = 0; i < doc.length; i++) {
						const char = doc[i];
						if (char === "'") singleQuoteOpen = !singleQuoteOpen;
						if (!singleQuoteOpen) {
							if (char === '(') openParenCount++;
							if (char === ')') openParenCount--;
						}
					}

					if (singleQuoteOpen) {
						diagnostics.push({
							from: 0,
							to: doc.length,
							severity: 'error',
							message: 'Unterminated string literal'
						});
					} else if (openParenCount !== 0) {
						diagnostics.push({
							from: 0,
							to: doc.length,
							severity: 'error',
							message: 'Unmatched parenthesis'
						});
					}

					resolve(diagnostics);
				}, 500);
			});
		});
	}

	onMount(() => {
		const dialect = dbms === 'postgres' ? PostgreSQL : MySQL;
		const schemaObj: Record<string, string[]> = {};
		tableNames.forEach((t) => {
			schemaObj[t] = [];
		});

		const runKeymap = keymap.of([
			{
				key: 'Ctrl-Enter',
				run: () => {
					if (!readOnly) onRun();
					return true;
				}
			},
			{
				key: 'Cmd-Enter',
				run: () => {
					if (!readOnly) onRun();
					return true;
				}
			}
		]);

		const state = EditorState.create({
			doc: value,
			extensions: [
				history(),
				keymap.of([...defaultKeymap, ...historyKeymap]),
				runKeymap,
				sql({ dialect, schema: schemaObj }),
				autocompletion(),
				createLinter(),
				oneDark,
				readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
				editableCompartment.of(EditorView.editable.of(!readOnly)),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						value = update.state.doc.toString();
					}
				})
			]
		});

		view = new EditorView({
			state,
			parent: editorContainer
		});
	});

	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: value }
			});
		}
	});

	$effect(() => {
		if (view) {
			view.dispatch({
				effects: [
					readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
					editableCompartment.reconfigure(EditorView.editable.of(!readOnly))
				]
			});
		}
	});

	onDestroy(() => {
		if (lintTimeout) clearTimeout(lintTimeout);
		if (view) view.destroy();
	});
</script>

<div class="border border-zinc-800 rounded-lg overflow-hidden bg-black text-sm {readOnly ? 'opacity-50 cursor-not-allowed' : ''}">
	<div bind:this={editorContainer} class="min-h-[160px] max-h-[300px] overflow-auto"></div>
</div>
