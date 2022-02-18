import { appDir } from "@tauri-apps/api/path";
import { createDir, writeFile, readTextFile } from '@tauri-apps/api/fs';

const defaultConfig = {
    viewMode: "split",
    focusMode: false,
    filename: null,
    debug: false,
    safeMode: false,
};

export async function getConfig() {
    const dir = await appDir();
    let config = defaultConfig;

    console.log("config dir:" + dir);
    await createDir(dir, { recursive: true });
    try {
        const rawFile = await readTextFile(dir + "/config.json");
        config = JSON.parse(rawFile);
    } catch {   
        // if we failed to read or parse the config file, create a new default
        writeFile({
            path: dir + "/config.json",
            contents: JSON.stringify(defaultConfig, null, 2)});
    }
    config.configDir = dir;
    config.loaded = true;
    config.previewSourceText =  "";
    config.readSourceText =  "";
    config.unseenChanges = 0;
    config.unsavedChanges = 0;

    // set the read source text field if we previously had a file open
    if (config.filename) {
        config.readSourceText = await readTextFile(config.filename);
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
    };
    
    await writeFile({
        path: state.configDir + "/config.json",
        contents: JSON.stringify(config, null, 2)});
}