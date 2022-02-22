import Editor from "./Editor.js";
import Preview from "./Preview.js";
import "./styles/Workbench.css";
import HotkeyHandler from "./HotkeyHandler.js";
import Split from 'react-split';
import {invoke} from '@tauri-apps/api';
import { useState, useRef, useEffect } from "react";

/**
 * The main display area which holds the editor and the preview panel. This is the part of the program
 * that stores the state of the source text and keeps track of when to reload the editor.
 * 
 * This component is also responsible for loading the content of the given file (props.filename).
*/
export default function Workbench(props) {
    const extensionsInfoRef = useRef([]);
    const [readSource, setReadSource] = useState("");
    const [previewSource, setPreviewSource] = useState("");

    const setExtensionsInfo = (info) => extensionsInfoRef.current = info;
    
    const handleUpdate = () => {
        setPreviewSource(props.sourceRef.current);
        props.onUpdate();
    }

    let actions = props.actions;
    actions.onUpdate = handleUpdate;

    // load the file every time we get a new one
    useEffect(() => {
        // we created a new empty file
        if (!props.filename) {
            setReadSource("");
            return;
        }
        
        invoke('read_file', {"path": props.filename})
            .then(setReadSource)
            .catch(console.error);
    }, [props.filename]);

    const editor = <Editor
        onUpdate={handleUpdate}
        extensionsInfoRef={extensionsInfoRef}
        actions={props.actions}
        onChange={props.onEditorChange}
        readSource={readSource}
        currentSourceRef={props.sourceRef}
    />;

    const preview = <Preview
        setExtensionsInfo={setExtensionsInfo}
        safeMode={props.safeMode}
        filename={props.filename}
        configDir={props.configDir}
        source={previewSource}
    />;

    return <div className="Workbench">
        <HotkeyHandler actions={actions} />
        <div className="actions">
            <button className="updateButton" onClick={handleUpdate}>
                <span class="material-icons-outlined">refresh</span>
            </button>
        </div>
        {props.mode === "split" ?
            <Split
                className="split"
                gutterSize={5}
                minSize={300}
                dragInterval={1}
            >
                {editor}
                <div className="previewContainer">
                    {preview}
                </div>
            </Split>
            : <div className="full">
                {props.mode === "editor" ? editor : preview}
            </div>
        }
    </div>
}