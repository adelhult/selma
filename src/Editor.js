import "./styles/Editor.css";
import { useRef, useEffect } from "react";
import { default as MonacoEditor } from "@monaco-editor/react";
import configureEditor from "./configureEditor";
/**
 * A component housing everything related to the source text editor itself
 */
export default function Editor(props) {
    const editorRef = useRef(null);

    const registerActions = (editor, monaco) => {
        editor.addAction({
            id: 'save-file',
            label: 'File: Save',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'file',
            contextMenuOrder: 1,
            run: props.actions?.onSave ?? function () { alert("could not save") },
        });

        editor.addAction({
            id: 'save-as-file',
            label: 'File: Save as',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_S],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'file',
            contextMenuOrder: 1,
            run: props.actions?.onSaveAs ?? function () { alert("could not save as") },
        });

        editor.addAction({
            id: 'update-preview',
            label: 'Preview: update',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'preview',
            contextMenuOrder: 1,
            run: props.actions.onUpdate
        });

        editor.addAction({
            id: 'open-file',
            label: 'File: open',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_O],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'preview',
            contextMenuOrder: 1,
            run: props.actions?.onOpen ?? function () { alert("could not open file") },
        });

        editor.addAction({
            id: 'new-file',
            label: 'File: new',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_N],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'preview',
            contextMenuOrder: 1,
            run: props.actions?.onNew ?? function () { alert("could not create new file") },
        });

        editor.addAction({
            id: 'export-file',
            label: 'File: export',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_E],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'preview',
            contextMenuOrder: 1,
            run: props.actions?.onExport ?? function () { alert("could not export the file") },
        });

        editor.addAction({
            id: 'switch-view',
            label: 'Editor: switch view',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Tab],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'preview',
            contextMenuOrder: 1,
            run: props.actions?.onViewToggle ?? function () { alert("could not toggle view") },
        });

        editor.addAction({
            id: 'focos-mode',
            label: 'Editor: toggle focus mode',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_0],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'editor',
            contextMenuOrder: 1,
            run: props.actions?.onFocus ?? function () { alert("could not toggle focus") },
        });
    }


    function handleEditorDidMount(editor, monaco) {
        registerActions(editor, monaco);
        // here is another way to get monaco instance
        // you can also store it in `useRef` for further usage
        editorRef.current = editor;

        // recover the current state (this will happen if we switch from
        // editor to preview and then back to editor)
        if (props.currentSource) {
            editor.getModel().setValue(props.currentSource);
        }


    }

    // Update/set the content of the editor state based on the provided source text.
    // this function will be called when a new file is loaded.
    useEffect(() => {
        if (editorRef.current != null) {
            editorRef.current.getModel().setValue(props.readSource ?? "");
        }
        
    }, [props.readSource, editorRef]);

    return <div className="Editor">
        <MonacoEditor
            height="100%"
            width="100%"
            theme="myCoolTheme"
            defaultValue={props.readSource ?? ""}
            language="lambdanote"
            beforeMount={configureEditor}
            onChange={props.onChange}
            onMount={handleEditorDidMount}
            options={{
                renderLineHighlight: "none",
                fontFamily: "Cascadia Code",
                fontLigatures: true,
                selectOnLineNumbers: true,
                automaticLayout: true,
                wordWrap: true,
                overviewRulerBorder: false,
                lineNumbers: "on",
                fontSize: 16,
                padding: {top:12},
                mouseWheelZoom: true,
                minimap: {
                    enabled: false
                },
            }}
        />

    </div>
}
