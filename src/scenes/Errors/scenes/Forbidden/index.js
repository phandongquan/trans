import React from 'react';
import { Result } from 'antd';
import { Link } from 'react-router-dom';

const Forbidden = () => {
    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={<Link to="/" className="btn btn-primary">Back Home</Link>}
        />
    );
};

export default Forbidden;