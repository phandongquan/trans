import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { timeFormatStandard } from '~/services/helper';

dayjs.locale('vi')
export const DateFromNow = (props) => {
    if(typeof props.date == 'undefined') {
        return [];
    }

    const timeFormat = timeFormatStandard(props.date, 'HH:mm DD/MM/YYYY');
    let result;
    if(dayjs().diff(dayjs(props.date), 'hours') > 21) {
        result = timeFormat;
    } else {
        result = dayjs(props.date).fromNow();
    }

    return (
        <Tooltip title={timeFormat}>
            {result} 
            <CalendarOutlined className='ml-1'/>
        </Tooltip>
    )
}

DateFromNow.defaultProps = {
    date: '',
}

export default DateFromNow
