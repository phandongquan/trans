export default function (props) {
    const { t } = props;
    
    let result =[{
        title:  t('audio_call'),
        route: '/audio-call',
    },
    {
        title: t('hr:audio_call_v2'),
        route: '/audio-call-v2',
    },
    {
        title: t('record_audio'),
        route: '/record-audio',
    },];

    return result;
}