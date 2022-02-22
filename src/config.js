import { appDir } from "@tauri-apps/api/path";
import { invoke } from '@tauri-apps/api';
import guideText from "./introGuide.js";

const defaultConfig = {
    viewMode: "split",
    focusMode: false,
    filename: null,
    debug: false,
    showHelp: true,
    safeMode: false,
};


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
        config = defaultConfig;   
        // if we failed to read or parse the config file, create a new default
        invoke("write_file", {
            path: dir + "/config.json",
            contents: JSON.stringify(defaultConfig, null, 2)});
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