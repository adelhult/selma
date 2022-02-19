import Editor from "./Editor.js";
import Preview from "./Preview.js";
import "./styles/Workbench.css"
import Split from 'react-split'
import { useState, useRef } from "react";

/**
 * The main display area which holds the editor and the preview panel. This is the part of the program
 * that stores the state of the source text and keeps track of when to reload the editor.
 * 
 * This component is also responsible for loading the content of the given file (props.filename).
*/
export default function Workbench(props) {
    const extensionsInfoRef = useRef([]);
    const setExtensionsInfo = (info) => extensionsInfoRef.current = info;
    return <div className="Workbench">
        {
            props.mode === "editor" ?
                <div className="full">
                    <Editor
                        extensionsInfoRef={extensionsInfoRef}
                        actions={props.actions}
                        onChange={props.onEditorChange}
                        readSource={props.readSource}
                        currentSource={props.currentSource}
                    />
                </div>
                : props.mode === "preview" ?
                    <div className="full">
                        <Preview
                            setExtensionsInfo={setExtensionsInfo}
                            safeMode={props.safeMode}
                            filename={props.filename}
                            configDir={props.configDir}
                            source={props.previewSource}
                        />
                    </div>
                    :
                    <Split
                        className="split"
                        gutterSize={5}
                        minSize={300}
                        dragInterval={1}
                    >
                        <Editor
                            extensionsInfoRef={extensionsInfoRef}
                            actions={props.actions}
                            onChange={props.onEditorChange}
                            readSource={props.readSource}
                            currentSource={props.currentSource}
                        />
                        <div className="previewContainer">
                            <Preview
                                setExtensionsInfo={setExtensionsInfo}
                                safeMode={props.safeMode}
                                filename={props.filename}
                                configDir={props.configDir}
                                source={props.previewSource}
                            />
                        </div>
                    </Split>
        }
    </div>
}