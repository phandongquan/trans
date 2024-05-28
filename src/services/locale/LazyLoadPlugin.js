import { BackendModule } from 'i18next';
import axios from 'axios';
import { HR_LANGUAGE_KEY, HR_LANGUAGE_NAMESPACES } from '~/constants/basic';
import { MEDIA_URL_HR } from '~/constants';

const LazyLoadPlugin = {
    type: 'backend',
    init: function (services, backendOptions, i18nextOptions) {

    },
    read: function (language, namespace, callback) {
        if (!HR_LANGUAGE_NAMESPACES.includes(namespace)) {
            return;
        }
        let url_trans = MEDIA_URL_HR.replace('/hr', '');

        /**
         * @harcode connect production if is dev mode
         */
        if(process.env.REACT_APP_ENV !== 'production' && process.env.REACT_APP_ENV !== 'staging' ){
            url_trans = 'https://wshr.hasaki.vn/production';
        }

        let fileUrl = url_trans + `/files/translators/${language}/${namespace}.json`;
        axios.get(fileUrl).then(response => {
            // console.log({ response: response.data })
            callback(null, response.data);
        });
    },
    save: function (language, namespace, data) {
    },

    create: function (languages, namespace, key, fallbackValue) {
        /* save the missing translation */
    },
};

export default LazyLoadPlugin;