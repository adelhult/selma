import "./styles/Menu.css";

export default function Menu(props) {
    return <div className="Menu">
        <nav>
            <div className="mainActions">
                <button onClick={props.actions.onNew}>🌟 New</button>
                <button onClick={props.actions.onOpen}>📂 Open</button>
                <button onClick={props.actions.onSave}>💾 Save</button>
                <button onClick={props.actions.onSaveAs}>📑 Save As</button>
                <button onClick={props.actions.onExport}>🚀 Export</button>
                <button 
                    className={props.showSettings ? "active" : null} 
                    onClick={props.actions.onSettings}>
                        ⚙️ Settings
                </button>
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
    </div>
}