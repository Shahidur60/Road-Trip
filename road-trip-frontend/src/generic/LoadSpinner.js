const LoadSpinner = () => {
    return (<div className="flex justify-center items-center">
        <div className="grid gap-2 m-3">
            <div className="flex items-center justify-center ">
                <div className="w-16 h-16 border-b-4 border-primary-1 rounded-full animate-spin"></div>
            </div>
        </div>
    </div>);
}

export default LoadSpinner;