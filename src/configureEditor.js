const getHoverMsg = e => `
# ${e.canonical_name} extension
${e.nickname.toUpperCase() != e.canonical_name.toUpperCase() ?
    `**(aliased as "${e.nickname}")**` : ''}

${e.description}

# Expression types
Supports
${e.supports_block ? "**block**" : ""}
${e.supports_inline && e.supports_block ? "and" : ""}
${e.supports_inline ? "**inline**" : ""}
expression.

# Safe mode
${e.is_safe ? "Trusted" : "**Not trusted**"} in safe mode.

# Metadata interests
${e.interests.length > 0 ? "" : "No interest in any metadata fields"}
${e.interests.map(m => `- \`${m}\``).join("\n")}
`;

export default function getConfig(monaco, extensionsInfoRef) {
    monaco.languages.register({ id: 'lambdanote' });

    monaco.languages.registerHoverProvider('lambdanote', {
        provideHover: function (model, position) {
            const word = model.getWordAtPosition(position).word;
            const extension = extensionsInfoRef.current.find(e => e.nickname == word);
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
            const extensions = extensionsInfoRef.current;
       
            var word = model.getWordUntilPosition(position);

            var range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            console.log(extensions);
            return { suggestions: 
                  extensions.map(e => ({
                        label: e.nickname,
                        kind: monaco.languages.CompletionItemKind.Property,
                        documentation: getHoverMsg(e),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        insertText: e.supports_block ? "\n---- " + e.nickname + " ----\n${1:}\n----\n" : 
                            e.supports_inline ? "|" + e.nickname + ",${1:}|" : "",
                        range: range
                  }))  
            }
        }
    });
}
