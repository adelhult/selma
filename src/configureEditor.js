const getHoverMsg = e => `
#### ${e.canonical_name} extension
${e.nickname.toUpperCase() != e.canonical_name.toUpperCase() ?
    `**(aliased as "${e.nickname}")**` : ''}

${e.description}

#### Expression types
Supports
${e.supports_block ? "**block**" : ""}
${e.supports_inline && e.supports_block ? "and" : ""}
${e.supports_inline ? "**inline**" : ""}
expression.

#### Safe mode
${e.is_safe ? "Trusted" : "**Not trusted**"} in safe mode.

#### Metadata interests
${e.interests.length > 0 ? "" : "No interest in any metadata fields"}
${e.interests.map(m => `- \`${m}\``).join("\n")}
`;

export default function getConfig(monaco, extensionsInfoRef) {
    monaco.languages.register({ id: 'lambdanote' });

    monaco.languages.registerHoverProvider('lambdanote', {
        provideHover: function (model, position) {
            const word = model.getWordAtPosition(position).word;
            const extensions = extensionsInfoRef.current;
            const extension = extensions.find(e => e.nickname == word);
            if (!extension) return {};
            return {
                contents: [
                    { value: getHoverMsg(extension) }
                ]
            };
        }
    });

    monaco.languages.registerCompletionItemProvider('lambdanote', {
        provideCompletionItems: function (model, position) {
            // find out if we are completing a property in the 'dependencies' object.
            var textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            let line = model.getLineContent(position.lineNumber);
                
            var word = model.getWordUntilPosition(position);
            console.log(word);
            var range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            return {
                suggestions: [
                    {
                        label: '"lodash"',
                        kind: monaco.languages.CompletionItemKind.Function,
                        documentation: 'The Lodash library exported as Node.js modules.',
                        insertText: '"lodash": "*"',
                        range: range
                    },
                    {
                        label: '"express"',
                        kind: monaco.languages.CompletionItemKind.Function,
                        documentation: 'Fast, unopinionated, minimalist web framework',
                        insertText: '"express": "*"',
                        range: range
                    },
                    {
                        label: '"mkdirp"',
                        kind: monaco.languages.CompletionItemKind.Function,
                        documentation: 'Recursively mkdir, like <code>mkdir -p</code>',
                        insertText: '"mkdirp": "*"',
                        range: range
                    },
                    {
                        label: '"my-third-party-library"',
                        kind: monaco.languages.CompletionItemKind.Function,
                        documentation: 'Describe your library here',
                        insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                    }
                ]
            };
        }
    });
}
