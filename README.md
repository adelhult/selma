# Selma
Selma is simple text editor that uses my own, human friendly, markup language [λnote](https://www.github.com/adelhult/lambda-note). This software is written in React and Rust and built on the Monaco editor (the same that VS Code uses).

![banner](banner.png)

## Installation
The project is very much a work in progress, however feel free to play around with it yourself.
Note that you are required to have both node and the rust toolchain installed. 
```
git clone https://github.com/adelhult/selma.git
cd selma
npm install
npm run tauri dev

or...
npm run tauri build
```

## TODOs
- [ ] Syntax highlighting
- [ ] Hover suggestions
- [ ] File tree
- [ ] Settings menu
- [ ] Remember the previous opened file etc.
- [ ] Nicer GUI
