export const GenericLabel = ({ fFor, children }) => {
    return (
        <label htmlFor={fFor} className="text-base text-secondary-4">{children}</label>
    );
}