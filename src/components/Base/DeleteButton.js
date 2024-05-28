import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import TooltipButton from './TooltipButton';

export default function (props) {
    const { t } = useTranslation();

    return (
        <Popconfirm title={t('Confirm delete selected item?')}
            placement="topLeft"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            {...props}
        >
            <TooltipButton title={t('Delete')}
                danger
                size='small'
                icon={<FontAwesomeIcon icon={faTrashAlt} />} />
        </Popconfirm>
    );
}