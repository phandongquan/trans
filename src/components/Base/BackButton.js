import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function (props) {
    const { t } = useTranslation();
    let url = props.url || '';
    let extendProps = { ...props };
    delete extendProps['url'];
    return (
        <Link to={url}>
            <Button icon={<FontAwesomeIcon icon={faReply} />} {...extendProps}>
                &nbsp;{t('hr:back')}
            </Button>
        </Link>
    );
}