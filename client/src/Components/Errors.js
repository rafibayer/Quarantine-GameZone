import React from 'react';

const Errors = ({ error, setError }) => {
    switch (error) {
        case "":
            return <></>
        default:
            return <div className="error">
                <span className="error-hide" onClick={() => setError("")}>x</span>
                Error: {error}
            </div>
    }
}

export default Errors;