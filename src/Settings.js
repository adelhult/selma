import "./styles/Settings.css";
import { invoke } from '@tauri-apps/api';

function Theme({name, description, file}) {
    return <div className="Theme">
        <div className="description">{description}</div>
        The theme file is defined in: <br/> 
        <a 
            className="path" 
            onClick={() => invoke("open_editor", {filename: file})}>
                <code>{file}</code>
        </a>
    </div>
}

export default function Settings(props) {
    let currentTheme = props.currentTheme;

    const themeButtons = props.themes.map(theme => 
            <button 
                key={theme.name}
                className={theme.file === currentTheme ? "active" : undefined}
                onClick={() => props.onThemeChange(theme.file)}>
                    {theme.name}
            </button>
    );
    return <div className="Settings">
        <h1>Document settings</h1>
        <strong>Theme</strong><br/>
        {themeButtons}
        <Theme {...props.themes.find(t => t.file === currentTheme)} />
    </div>
}