import Editor from "./Editor.js";
import Preview from "./Preview.js";
import "./styles/Workbench.css";
import HotkeyHandler from "./HotkeyHandler.js";
import Split from 'react-split';
import { invoke } from '@tauri-apps/api';
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
    const [warnings, setWarnings] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isIssuesOpen, setIsIssuesOpen] = useState(false);
    const [previewSource, setPreviewSource] = useState("");
    const sourceRef = props.sourceRef

    const setExtensionsInfo = (info) => extensionsInfoRef.current = info;

    const handleUpdate = () => {
        console.log("handle update");
        props.onUpdate();
        setPreviewSource(props.sourceRef.current);
    }

    let actions = props.actions;
    actions.onUpdate = handleUpdate;

    // load the file every time we get a new one
    useEffect(() => {
        // we created a new empty file
        if (!props.filename) {
            setReadSource("");
            sourceRef.current = "";
            handleUpdate();
            return;
        }

        invoke('read_file', { "path": props.filename })
            .then(text => {
                setReadSource(text);
                sourceRef.current = text;
            })
            .then(handleUpdate)
            .catch(console.error);

    }, [props.filename, sourceRef]);

    // if we set a new preview source, use it and compile the documents
    useEffect(() => {
        if (!props.configDir) return;
        
        const preview_filepath = props.configDir + "preview.html";
        const server_url = "http://localhost:5432/";
        const root_dir_path = (props.filename ?? "").split(/[\\/]/).slice(0, -1).join("/");
        const url_param = "?root=" + encodeURIComponent(root_dir_path);
        const preview_url = server_url + preview_filepath + url_param;

        invoke('translate_preview', { 
            'source': previewSource, 
            'filepath': preview_filepath,
            'safe': props.safeMode ?? true,
        })
            .then(output => {
                console.log("compiled!", props.filename);
                console.log({filepath: preview_url, source: props.source})
                let issues = output[0];
                let extensionInfo = output[1];
                setExtensionsInfo(extensionInfo);
                setErrors(issues.errors);
                setWarnings(issues.warnings);

            });
    }, [previewSource]);

    useEffect(handleUpdate, [props.viewMode]);

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
        setWarnings={setWarnings}
        setErrors={setErrors}
        filename={props.filename}
        configDir={props.configDir}
        source={previewSource}
    />;

    const issuesView = <div className="Issues">
        {errors.length > 0 && <strong>Errors</strong>}
        {errors.map((error, index) => <p key={index}>{error}</p>)}
        {warnings.length > 0 && <strong>Warnings</strong>}
        {warnings.map((warn, index) => <p key={index}>{warn}</p>)}
        {errors.length === 0 && warnings.length === 0 &&
            <p>Great! I could not find any issues with the document :)</p>
        }
    </div>

    return <div className="Workbench">
        <HotkeyHandler actions={actions} />
        {isIssuesOpen && issuesView}
        <div className="actions">
            {(errors.length > 0 || warnings.length > 0 || isIssuesOpen) &&
                <button className="issuesButton" onClick={() => setIsIssuesOpen(prev => !prev)}>
                    <span class="material-icons">
                        {isIssuesOpen ? "close" : errors.length > 0 ? "error" : "warning"}
                    </span>
                </button>
            }
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