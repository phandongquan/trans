import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { HR_LANGUAGE_KEY, HR_LANGUAGE_NS_DEFAULT, HR_LANGUAGE_NAMESPACES } from '~/constants/basic';
import LazyLoadPlugin from './LazyLoadPlugin';
import ChangeDetectorPlugin from './ChangeDetectorPlugin';

const currentLocale = localStorage.getItem(HR_LANGUAGE_KEY) || 'en';

i18n
    .use(ChangeDetectorPlugin)
    .use(LazyLoadPlugin)
    .use(initReactI18next)
    .init({
        debug: false, // Enable debug logs for development
        react: {
            useSuspense: false
        },
        lng: currentLocale,
        fallbackLng: false,
        ns: HR_LANGUAGE_NAMESPACES,
        defaultNS: HR_LANGUAGE_NS_DEFAULT,
        fallbackNS: HR_LANGUAGE_NS_DEFAULT,
        // saveMissing: true, // for missing key handler to fire
        // missingKeyHandler: function (lng, ns, key, fallbackValue) {
        //     console.log({key});
        // },
    });

export default i18n;