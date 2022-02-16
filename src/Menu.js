import "./styles/Menu.css";
import { useState } from "react";
import Settings from "./Settings.js";

export default function Menu(props) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    return <div className="Menu">
        <nav>
            <div className="mainActions">
                <button onClick={props.actions.onNew}>🌟 New</button>
                <button onClick={props.actions.onOpen}>📂 Open</button>
                <button onClick={props.actions.onSave}>💾 Save</button>
                <button onClick={props.actions.onSaveAs}>📑 Save As</button>
                <button onClick={props.actions.onExport}>🚀 Export</button>
                <button onClick={setSettingsOpen}>⚙️ Settings</button>
                {
                    props.unseenChanges > 0 && props.viewMode !== "editor" &&
                    <button onClick={props.actions.onUpdate}>🔃 Update preview</button>
                }
            </div>
            <div className="viewModeActions">
                <button
                    className={props.viewMode === "editor" ? "selected" : undefined}
                    onClick={() => props.setViewMode("editor")}>
                    <span className="material-icons">edit</span>
                </button>
                <button
                    className={props.viewMode === "split" ? "selected" : undefined}
                    onClick={() => props.setViewMode("split")}>
                    <span className="material-icons">vertical_split</span>
                </button>
                <button
                    className={props.viewMode === "preview" ? "selected" : undefined}
                    onClick={() => props.setViewMode("preview")}>
                    <span className="material-icons">description</span>
                </button>
            </div>
        </nav>
        {settingsOpen && <Settings />}
        {props.debug &&
            <div className="debugger">
                <div>
                    <strong>General</strong>
                    <ul>
                        <li>filename: {props.filename}</li>
                        <li>props.viewMode: {props.viewMode}</li>
                        <li>unseenChanges: {props.unseenChanges}</li>
                    </ul>
                </div>
                <div>
                <strong>Current source text</strong><br />
                {props.currentSourceText.slice(0, 150)}
                {props.currentSourceText.length > 150 && '...'}
            </div>
            <div>
                <strong>Read source text</strong><br />
                {props.readSourceText.slice(0, 150)}
                {props.readSourceText.length > 150 && '...'}
            </div>
            <div>
                <strong>Preview source text</strong><br />
                {props.previewSourceText.slice(0, 150)}
                {props.previewSourceText.length > 150 && '...'}
            </div>
            </div>
        }
    </div>
}