import "./styles/Preview.css";
import { useEffect } from "react";

/**
 * The preview panel which displays the output of the lambda note translator.
 */
export default function Preview(props) {
    // create the url for what will be the src of the preview iframe
    const preview_filepath = props.configDir + "preview.html";
    const server_url = "http://localhost:5432/";
    const root_dir_path = (props.filename ?? "").split(/[\\/]/).slice(0, -1).join("/");
    const url_param = "?root=" + encodeURIComponent(root_dir_path);
    const preview_url = server_url + preview_filepath + url_param;
    const source = props.source;

    useEffect(() => {
        if (!props.configDir) return;
        
        const frame = document.getElementById("previewFrame");

        // and reload the iframe
        // since I don't want to reset the scroll position I need to use the **reload** method
        // which we sadly are not able to access due to cross origin issues. 
        // To solve this we use the postMessage API
        // thanks, https://stackoverflow.com/questions/25098021/securityerror-blocked-a-frame-with-origin-from-accessing-a-cross-origin-frame
        frame.contentWindow.postMessage("reload", "*")
    }, [source]);

    return props.configDir ? <div className="Preview">
        <iframe id="previewFrame" title="preview" src={preview_url}>
        </iframe>
    </div> : null;
}