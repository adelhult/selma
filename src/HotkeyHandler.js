import { useHotkeys } from 'react-hotkeys-hook';

/*
Used to add hotkeys to the program
Note that the monaco editor itself also registers these
hotkeys but we also want them to work when the focus is not
set on the editor.
*/
export default function HotkeyHandler(props) {
    useHotkeys('ctrl+s', props.actions.onSave);
    useHotkeys('ctrl+o', props.actions.onOpen);
    useHotkeys('ctrl+n', props.actions.onNew);
    useHotkeys('ctrl+enter', props.actions.onUpdate);
    useHotkeys('ctrl+shift+s', props.actions.onSaveAs);
    useHotkeys('ctrl+e', props.actions.onExport);
    useHotkeys('ctrl+0', props.actions.onFocus);
    return null;
}