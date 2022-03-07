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

            return {
                suggestions:
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

    monaco.editor.defineTheme('editortheme', {
        base: 'vs',
        inherit: false,
        rules: [
            { token: 'modifier', foreground: 'c4c2bf'},
            { token: 'bold', fontStyle: 'bold' },
            { token: 'italic', fontStyle: 'italic' },
            { token: 'underline', fontStyle: 'underline' },
            { token: 'strikethrough', fontStyle: 'bold'},
            { token: 'superscript', fontStyle: 'bold'},
            { token: 'escape', foreground: 'e75e59'},
            { token: 'heading', fontStyle: 'bold'},
            { token: 'subscript', fontStyle: 'bold'},
            { token: 'name', foreground: '75b777', fontStyle:'bold'},
            { token: 'arguments', foreground: 'd66c74'}
        ],
        colors: {
            'editor.foreground': '#000000'
        }
    });


    monaco.languages.setMonarchTokensProvider('lambdanote', {
        defaultToken: 'text',
        tokenPostfix: '.ln',

        // escape codes
        control: /[\*\^/=~:\|_]/,
        specialchars: /(alpha|beta|[Gg]amma|[Dd]elta|(var)?epsilon|z?eta|[Tt]heta|vartheta|iota|kappa|[Ll]ambda|mu|nu|[Xx]i|[Pp]i|(var)?rho|[Ss]igma|tau|[Uu]psilon|[Pp]hi|varphi|chi|[Pp]si|[Oo]mega|endash|emdash|[Rr]ight|[Ll]eft|[Uu]p|[Dd]own)/,
        escapes: /\\(?:@control|@specialchars)/,

        tokenizer: {
            root: [
                // headers (with #)
                [/(#+)([ \t]+)(.+)/, ['modifier', 'whitespace', 'heading']],

                // github style code blocks (with backticks and language)
                [/^\s*```\s*((?:\w|[\/\-#])+)\s*$/, { token: 'string', next: '@codeblockgh', nextEmbedded: '$1' }],

                // github style code blocks (with backticks but no language)
                [/^\s*```\s*$/, { token: 'string', next: '@codeblock' }],
                
                // inline extensions
                [/(\|)([^,]*?)((?:,.*?)?(?<!\\))(\|)/, ['modifier', 'name', 'arguments', 'modifier']],

                // markup within lines
                { include: '@linecontent' },
            ],

            codeblock: [
                [/^\s*~~~\s*$/, { token: 'string', next: '@pop' }],
                [/^\s*```\s*$/, { token: 'string', next: '@pop' }],
                [/.*$/, 'variable.source'],
            ],

            // github style code blocks
            codeblockgh: [
                [/```\s*$/, { token: 'variable.source', next: '@pop', nextEmbedded: '@pop' }],
                [/[^`]+/, 'variable.source'],
            ],

            linecontent: [
                [/@escapes/, 'escape'],

                // subscript
                [/__([^\\_]|@escapes|_(?!_))+__/, 'subscript'],

                // superscript
                [/\^\^([^\\\^]|@escapes|\^(?!\^))+\^\^/, 'superscript'],

                // bold
                [/\*\*([^\\*]|@escapes|\*(?!\*))+\*\*/, 'bold'],

                // italic
                [/\/\/([^\\_]|@escapes|\/(?!\/))+\/\//, 'italic'],

                // strikethrough
                [/~~([^\\~]|@escapes|~(?!~))+~~/, 'strikethrough'],

                // underlined
                [/==([^\\=]|@escapes|=(?!=))+==/, 'underline'],
            ],
        }
    });
}
