import "./styles/Preview.css";
import { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api';

/**
 * The preview panel which displays the output of the lambda note translator.
 */
export default function Preview(props) {
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [isIssuesOpen, setIsIssuesOpen] = useState(false);

    // create the url for what will be the src of the preview iframe
    const preview_filepath = props.configDir + "preview.html";
    const server_url = "http://localhost:5432/";
    const root_dir_path = (props.filename ?? "").split(/[\\/]/).slice(0, -1).join("/");
    const url_param = root_dir_path ? "?root=" + root_dir_path : "";
    const preview_url = server_url + preview_filepath + url_param;

    useEffect(() => {
        if (!props.configDir) return;

        invoke('translate_preview', { 
            'source': props.source, 
            'filepath': preview_filepath,
            'safe': props.safeMode ?? true,
        })
            .then((output) => {
                // store the output in the state
                setErrors(output.errors);
                setWarnings(output.warnings);
                // and reload the iframe
                console.log("reloading preview")
                // since I don't want to reset the scroll position I need to use the **reload** method
                // which we sadly are not able to access due to cross origin issues. 
                // To solve this we use the postMessage API
                // thanks, https://stackoverflow.com/questions/25098021/securityerror-blocked-a-frame-with-origin-from-accessing-a-cross-origin-frame
                const frame = document.getElementById("previewFrame");
                frame.contentWindow.postMessage("reload", "*")
            });
    }, [props.source, preview_filepath, props.configDir]);

    return props.configDir ? <div className="Preview">
        {(errors.length > 0 || warnings.length > 0) &&
            <button className="issuesButton" onClick={() => setIsIssuesOpen(prev => !prev)}>
                <span class="material-icons">
                    {errors.length > 0 ? "error" : "warning"}
                </span>
            </button>
        }
        {isIssuesOpen &&
            <div className="Issues">
                {errors.length > 0 && <strong>Errors</strong>}
                {errors.map((error, index) => <p key={index}>{error}</p>)}
                {warnings.length > 0 && <strong>Warnings</strong>}
                {warnings.map((warn, index) => <p key={index}>{warn}</p>)}
            </div>
        }
        <iframe id="previewFrame" title="preview" src={preview_url}>
        </iframe>
    </div> : null;
}