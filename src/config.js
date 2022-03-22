import { appDir } from "@tauri-apps/api/path";
import { invoke } from '@tauri-apps/api';
import guideText from "./introGuide.js";

const defaultConfig = dir => ({
    viewMode: "split",
    focusMode: false,
    filename: null,
    debug: false,
    showHelp: true,
    safeMode: false,
    currentTheme: dir + "default.html",
    themes: [{
        name: "default",
        description: "A light and minimal theme. Works great for everyday notes and school assignments.",
        file: dir + "default.html",
    }]
});


export async function getConfig() {
    const dir = await appDir();
    console.log(dir);

    let config = {};

    await invoke("create_dir", {path: dir});
    try {
        const rawFile = await invoke("read_file", {path: dir + "/config.json"});
        config = JSON.parse(rawFile);

        if (!config) throw new Error("Failed to parse json");
    
    } catch (error) {
        config = defaultConfig(dir);   
        // if we failed to read or parse the config file, create a new default
        invoke("write_file", {
            path: dir + "/config.json",
            contents: JSON.stringify(defaultConfig, null, 2)});
        
        // we  must also create a new file for the default theme
        invoke("write_file", {
            path: dir + "default.html",
            contents: DEFAULT_THEME});
    }
    
    config.configDir = dir;
    config.loaded = true;
    
    // set the read source text field if we previously had a file open
    if (config.filename) {
        config.readSourceText = await invoke("read_file", {path: config.filename});
    } else {
        config.currentSourceText = "";
    }
    return config;
}

// takes in the current state of the application and saves it to
// the config object
export async function saveConfig(state) {
    const config = {
        viewMode: state.viewMode,
        focusMode: state.focusMode,
        filename: state.filename,
        debug: state.debug,
        safeMode: state.safeMode,
        showHelp: state.showHelp,
        themes: state.themes,
        currentTheme: state.currentTheme,
    };

    await invoke("write_file", {
        path: state.configDir + "/config.json",
        contents: JSON.stringify(config, null, 2)});
}

export async function getGuidePath() {
    const dir = await appDir();
    const filename = dir + "/intro_guide.ln";

    let text = await invoke("read_file", {path: filename});
    if (!text) {
        // if no guide file exists, create a new one
        await invoke("write_file", {
            path: filename,
            contents: guideText});
    }
    return filename;
}

const DEFAULT_THEME = `\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@700&display=swap" rel="stylesheet">
    <style>
        html {
            scroll-behavior: smooth;
        }
        
        *::-moz-selection, *::selection {
            background: #E2705B;
            color:white;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Poppins', sans-serif;
        }

        h1 {
            font-size: 1.7rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        body, p {
            font-family: 'PT Serif', serif;
        }

        .content {
            box-sizing: border-box;
            padding:0.8rem;
            margin-top:2rem;
            margin-bottom:4rem;
            margin-left:auto;
            margin-right:auto;
            max-width:750px;
        }

        img {
            max-width:100%;
        }

        pre {
            border-radius:0.3rem;
            padding:0.8rem;
            font-family: 'Fira Code', monospace;
            box-sizing:border-box;
            font-size:0.9rem;
            overflow-x:auto;
        }

        hr {
            margin-top:2rem;
            margin-bottom:2rem;
        }

        @media print {
            hr { 
                page-break-after: always;
                visibility: hidden;
                margin:0;
                padding:0;
            }

            .content {
                padding:0;
            }
        }
    </style>
    <title>{{title|Document}}</title>
    {{imports}}
</head>
<body>
    {{top}}
    <div class="content">
        {{content}}
    </div>
    {{bottom}}
</div>
</body>
</html>
`;