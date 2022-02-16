import {React, useState} from 'react';
import { monaco } from 'react-monaco-editor';
import MonacoEditor from 'react-monaco-editor';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import './App.css';


// Register a new language
monaco.languages.register({ id: 'mySpecialLanguage' });

// Register a tokens provider for the language
monaco.languages.setMonarchTokensProvider('mySpecialLanguage', {
	tokenizer: {
		root: [
			[/\[error.*/, 'custom-error'],
			[/\[notice.*/, 'custom-notice'],
			[/\[info.*/, 'custom-info'],
			[/\[[a-zA-Z 0-9:]+\]/, 'custom-date']
		]
	}
});

// Define a new theme that contains only rules that match this language
monaco.editor.defineTheme('myCoolTheme', {
	base: 'vs',
	inherit: false,
	rules: [
		{ token: 'custom-info', foreground: '808080' },
		{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
		{ token: 'custom-notice', foreground: 'FFA500' },
		{ token: 'custom-date', foreground: '008800' }
	],
	colors: {
		'editor.foreground': '#000000'
	}
});

// Register a completion item provider for the new language
monaco.languages.registerCompletionItemProvider('mySpecialLanguage', {
	provideCompletionItems: () => {
		var suggestions = [
			{
				label: 'simpleText',
				kind: monaco.languages.CompletionItemKind.Text,
				insertText: 'simpleText'
			},
			{
				label: 'testing',
				kind: monaco.languages.CompletionItemKind.Keyword,
				insertText: 'testing(${1:condition})',
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
			},
			{
				label: 'ifelse',
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertText: ['if (${1:condition}) {', '\t$0', '} else {', '\t', '}'].join('\n'),
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				documentation: 'If-Else Statement'
			}
		];
		return { suggestions: suggestions };
	}
});



export default function App(props) {
	const [code, setCode] = useState("");
	const [output, setOutput] = useState("");
	const [filepath, setFilepath] = useState();
	
  	const editorDidMount = (editor, monaco) => {
    	console.log('editorDidMount', editor);
    	editor.focus();
  	};

	const readFile = (path) => {
		setFilepath(path);
		invoke('read_file', {'filepath': path})
			.then(setCode);
	};

	const saveFile = (path) => {
		invoke('save_file', {'filepath': path}).then(ok => {
			if (!ok) alert("attans!");
		})
	};

  	const update = (newValue, e) => {
		setCode(newValue);
		invoke('translate', {'source': newValue})
			.then(setOutput);
  	}

	const options = {
		language: 'mySpecialLanguage',
		theme: 'myCoolTheme',
		lineNumbers: 'off',
		roundedSelection: false,
		scrollBeyondLastLine: true,
		readOnly: false,
		fontSize: "20px",
		renderLineHighlight: "none",
		fontFamily: "Arial",
		wordWrap: true,
		automaticLayout: true,
	}

	return (
		<div className="App">
			<button onClick={() => {	
					open({multiple:false}).then(readFile);
				}}>
				pick file
			</button>
			<button onClick={() => {
					saveFile(filepath);
				}}>
				save
			</button>
			<div className="editor">
				<MonacoEditor
					value={code}
					options={options}
					onChange={update}
					editorDidMount={editorDidMount}
				/>
			</div>
			<div className="preview" dangerouslySetInnerHTML={{__html: output}}>
			</div>
		</div>
	);
}