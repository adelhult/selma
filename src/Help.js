import "./styles/Help.css";

export default function Help(props) {
    return <div className="Help">
        <div className="mainContent">
            <h1>
                Hello!
            </h1>
            <p>
            I'm <strong>Selma</strong>. A minimal text editor that's designed for the Ξ»note markup language.</p>
            <strong>Let's get started</strong>
            <button onClick={props.onGuide}>π©βπ Read the intro guide</button>
            <button onClick={props.onNew}>π Create new document</button>
            <a href="https://www.github.com/adelhult/selma" target="_blank">
                <button>π οΈ Visit Github repository</button>
            </a>
        </div>
    </div>
}