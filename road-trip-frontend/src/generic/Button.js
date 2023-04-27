export const StandardButton = ({ clickEvent, current, filled, children }) => {
    let colors = "text-secondary-4 hover:text-primary-2";
    if (filled) {
        colors = "text-white hover:text-secondary-1 bg-gradient-to-r from-primary-2 via-primary-1 to-primary-1"
    }

    return (
        <button className={`block py-2 pr-4 pl-3 rounded-sm p-1 ${colors}`} onClick={clickEvent} aria-current={current}>
            {children}
        </button>);
}

export const StandardNavButton = ({ url, current, filled, children }) => {
    return (<a href={url}>
        <StandardButton filled={filled} current={current}>
            {children}
        </StandardButton>
    </a>);
}

export const StandardLink = ({ url, children }) => {
    return (<a className="block py-2 text-secondary-3 hover:text-secondary-2" href={url}>
        {children}
    </a>);
}

export const SubmitButton = () => {
    return (
        <input type="submit" className="block py-2 pr-4 pl-3 text-white rounded bg-gradient-to-r from-primary-2 via-primary-1 to-primary-1
        outline outline-offset-2 outline-1 outline-primary-1 p-1 hover:text-secondary-2 hover:from-primary-1 hover:to-primary-1" />
    );
}

export const SaveButton = () => {
    return (
        <input type="submit" value="Save" className="block py-2 pr-4 pl-3 text-white rounded bg-gradient-to-r from-primary-2 via-primary-1 to-primary-1
        outline outline-offset-2 outline-1 outline-primary-1 p-1 hover:text-secondary-2 hover:from-primary-1 hover:to-primary-1" />
    );
}

export const SpotifyGenreButton = ({ bgNdx, genre, onclick }) => {
    const bgColors = ["bg-green-500", "bg-red-500", "bg-rose-400", "bg-blue-500"]

    return (
        <button className={"p-12 rounded-md text-white w-32 " + bgColors[bgNdx]} onClick={onclick}>{genre}</button>
    );
}

export const StopButton = ({ onclick, children }) => {
    return (
        <button
            className="bg-sky-100 hover:bg-sky-200 text-black min-w-full block text-left px-4 py-2 text-sm"
            onClick={onclick}
            id="type">
            {children}</button>
    );
}