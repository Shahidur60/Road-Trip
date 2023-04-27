export const BasicInputField = ({ type, value, fFor, onChangeFunc, placeholder, minLen = 0, ...props }) => {
    return (
        <input  type={type}
                value={(value) ? value : ""}
                htmlFor={fFor}
                onChange={onChangeFunc}
                placeholder={placeholder}
                className={`border border-secondary-1 p-2 text-secondary-4 rounded rounded-3 
                            focus:ring focus:outline-none focus:border-primary-1 w-16 md:w-fit ${props.className}`}
                minLength={minLen} />
    )
}

export const BasicTextBox = ({ type, value, fFor, onChangeFunc, placeholder, minLen = 0 }) => {
    return (
        <textarea   type={type}
                    value={(value) ? value : ""}
                    htmlFor={fFor}
                    onChange={onChangeFunc}
                    placeholder={placeholder}
                    className="border border-secondary-1 p-2 text-secondary-4 rounded rounded-3 
                            focus:ring focus:outline-none focus:border-primary-1 mb-3 text-base w-full resize-none"
                    minLength={minLen} />
    )
}

export const UnmodifiableInputField = ({ type, value, fFor }) => {
    return (
        <input  type={type}
                value={(value) ? value : ""}
                htmlFor={fFor}
                className="border border-secondary-1 p-2 text-secondary-4 rounded rounded-3 
                            focus:ring focus:outline-none focus:border-primary-1 mb-3 text-base bg-secondary-2" readOnly />
    )
}

export const GenericCheckBox = ({ fFor, changeEvent, isChecked }) => {
    return (
        <input  type="checkbox"
                htmlFor={fFor}
                className="mr-1"
                onChange={changeEvent}
                checked={isChecked} />
    )
}

export const HoverField = ({ value }) => {
    return (
        <div className="absolute px-2 rounded-md bg-secondary-1 opacity-90 text-secondary-4">
            {value}
        </div>
    )
}