import { Component } from 'react';
import { open, save } from '@tauri-apps/api/dialog';
import Workbench from './Workbench.js';
import './styles/App.css';
import { getConfig, saveConfig } from './config.js';
import { readTextFile, writeFile } from '@tauri-apps/api/fs';
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api';
import Menu from "./Menu.js";
import HotkeyHandler from "./HotkeyHandler.js";

class App extends Component {
	constructor(props) {
		super(props)
		this.actions = {
			"onNew": this.handleNewFile.bind(this),
			"onOpen": this.handleOpenFile.bind(this),
			"onExport": this.handleExportFile.bind(this),
			"onSave": this.handleSaveFile.bind(this),
			"onFocus": this.toggleFocusMode.bind(this),
			"onSaveAs": this.handleSaveAsFile.bind(this),
			"onUpdate": this.updatePreview.bind(this),
			"onViewToggle": this.toggleViewMode.bind(this),
		};

		this.state = {
			loaded: false,
		};	
	}

	componentDidMount() {
		document
			.getElementById('titlebar-minimize')
			.addEventListener('click', () => appWindow.minimize())
		document
			.getElementById('titlebar-maximize')
			.addEventListener('click', () => appWindow.toggleMaximize())
		document
			.getElementById('titlebar-close')
			.addEventListener('click', () => {
				// when to program is closed, store the state in the conf file first
				saveConfig(this.state).then(() => appWindow.close());
			})

		// get the config and stores it as the current state
		getConfig().then(config => {
			this.setState(config)
		});
		
		
		
	}

	handleEditorChange(value, event) {
		this.setState({
			currentSourceText: value,
			unseenChanges: this.state.unseenChanges + 1,
			unsavedChanges: this.state.unsavedChanges + 1,
		});

		if (this.state.unseenChanges > 100) this.updatePreview();
	}

	toggleFocusMode(e) {
		this.setState({ focusMode: !this.state.focusMode });
	}

	toggleViewMode() {
		const viewModes = ["editor", "split"/*,"preview" */];
		// TODO: re-add the preview option, can't currently do this since the hotkeys
		// are only available when the editor is present.
		const currentIndex = viewModes.indexOf(this.state.viewMode);
		this.setState({ viewMode: viewModes[(currentIndex + 1) % viewModes.length] });
	}

	setViewMode(viewMode) {
		this.setState({ viewMode: viewMode });
	}

	setDebug(debug) {
		this.setState({ debug: debug });
	}

	updatePreview() {
		if (this.state.viewMode === 'editor')
			return; // there is no need to update if we can't see it

		this.setState({
			previewSourceText: this.state.currentSourceText,
			unseenChanges: 0
		});
	}

	readFile(path) {
		readTextFile(path)
			.then(text => {
				// Reset contents first to ensure that the useEffect hook 
				// will be triggered even if the current readSourceText
				// is the same as the new text
				this.setState({ readSourceText: "" });
				this.setState({ readSourceText: text });
			})
			.catch(console.error);

	}

	handleOpenFile(event) {
		open({
			multiple: false,
			filters: [{ name: 'Lambda note', extensions: ['ln'] }]
		})
			.then(path => {
				this.setState({ filename: path, unsavedChanges: 0, });
				return path;
			})
			.then(this.readFile.bind(this))
			.catch(console.error);
	}

	handleExportFile(event) {
		save({
			defaultPath: (this.state.filename?.split(".")[0] ?? "notes") + ".html",
			filters: [{ name: 'HTML', extensions: ['html'] },
			{ name: 'LaTeX', extensions: ['tex'] },
			{ name: "Markdown (via Pandoc)", extensions: ["md"] },
			{ name: "PDF (via Pandoc)", extensions: ["pdf"] },
			{ name: "Word (via Pandoc)", extensions: ["docx"] },
			{ name: "Powerpoint (via Pandoc)", extensions: ["pptx"] }]
		})
			.then(path => {
				invoke('export', { "filename": path, 'source': this.state.currentSourceText })
			})
	}

	handleSaveFile(event) {
		if (!this.state.filename) {
			this.handleSaveAsFile(event);
			return;
		}
		this.setState({ unsavedChanges: 0 });
		this.updatePreview();
		writeFile({ contents: this.state.currentSourceText, path: this.state.filename });
	}

	handleSaveAsFile(event) {
		save({
			defaultPath: this.state.filename,
			filters: [{ name: 'Lambda note', extensions: ['ln'] }]
		})
			.then(savefilePath => {
				this.setState({ filename: savefilePath, unsavedChanges: 0 });
				this.updatePreview();
				writeFile({ contents: this.state.currentSourceText, path: savefilePath })
			})
	}

	handleNewFile(event) {
		this.setState({ filename: null, readSourceText: "", unseenChanges: 0 });
	}

	componentDidUpdate(prevProps, prevState) {
		// When we read a new source text we need to update the currentSourceText
		// and the previewSourceText
		if (this.state.readSourceText !== prevState.readSourceText) {
			this.setState({
				currentSourceText: this.state.readSourceText,
				previewSourceText: this.state.readSourceText,
				unseenChanges: 0,
			});
		}


		// When the the view mode changes, update the preview
		if (this.state.viewMode !== prevState.viewMode) {
			this.updatePreview();
		}
	}

	render() {
		return <>
			<div 
				data-tauri-drag-region 
				className="titlebar" 
				style={{ background: this?.state?.focusMode ? "white" : "#f9f5f1" }}
			>
				<div>
					<div className="titlebar-button" onClick={this.toggleFocusMode.bind(this)}>
						<span className="material-icons-outlined">{this?.state?.focusMode ? "expand_more" : "expand_less"}</span>
					</div>
					<div className="titlebar-button" onClick={() => alert("todo")}>
						<span className="material-icons-outlined">help_outline</span>
					</div>
					<div
						className={"titlebar-button" + (this?.state?.safeMode ? " active" : "")}
						onClick={() => this.setState({ safeMode: !this.state.safeMode })}
					>
						<span className="material-icons-outlined">
							{this?.state?.safeMode ? "lock" : "lock_open"}
						</span>
					</div>
				</div>
				<div className="filename">
					{(this?.state?.filename?.split(/[/\\]/)?.pop() ?? "unsaved file") + (this?.state?.unsavedChanges > 0 ? "*" : "")}
				</div>
				<div>
					<div className="titlebar-button" id="titlebar-minimize">
						<span className="material-icons-outlined">remove</span>
					</div>
					<div class="titlebar-button" id="titlebar-maximize">
						<span className="material-icons-outlined">crop_square</span>
					</div>
					<div class="titlebar-button exit-button" id="titlebar-close">
						<span className="material-icons-outlined">close</span>
					</div>
				</div>
			</div>
			{this.state.loaded ? <div className="App">
				<HotkeyHandler actions={this.actions} />
				{!this.state.focusMode &&
					<Menu
						filename={this.state.filename}
						actions={this.actions}
						debug={this.state.debug}
						previewSourceText={this.state.previewSourceText}
						currentSourceText={this.state.currentSourceText}
						readSourceText={this.state.readSourceText}
						setDebug={this.setDebug.bind(this)}
						setViewMode={this.setViewMode.bind(this)}
						viewMode={this.state.viewMode}
						unseenChanges={this.state.unseenChanges}
					/>
				}
				<Workbench
					safeMode={this.state.safeMode}
					filename={this.state.filename}
					actions={this.actions}
					filename={this.state.filename}
					readSource={this.state.readSourceText}
					currentSource={this.state.currentSourceText}
					previewSource={this.state.previewSourceText}
					onEditorChange={this.handleEditorChange.bind(this)}
					mode={this.state.viewMode}
					configDir={this.state.configDir}
				/>
			</div> : null}
		</>;
	}
}

export default App;