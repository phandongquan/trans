import { LanguageDetectorModule } from 'i18next';
import { HR_LANGUAGE_KEY, HR_LANGUAGE_NAMESPACES } from '~/constants/basic';

const ChangeDetectorPlugin = {
    type: 'languageDetector',
    async: true,
    detect: (cb) => {
        // Case 1: The user chose his preferred language setting.
        const preferredLang = localStorage.getItem(HR_LANGUAGE_KEY);
        if (preferredLang) {
            return cb(preferredLang);
        }
        // Case 2: return the default language
        return cb('en');
    },
    init: () => {},
    cacheUserLanguage: () => { },
};

export default ChangeDetectorPlugin;