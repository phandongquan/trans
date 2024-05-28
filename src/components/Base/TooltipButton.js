import React from 'react';
import { Button, Tooltip } from 'antd';

export default function (props) {
    let extendProps = { ...props };
    delete extendProps['title'];
    return (
        <Tooltip title={props.title}>
            <Button {...extendProps} />
        </Tooltip>
    );
}