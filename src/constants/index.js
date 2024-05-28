export const WS_API = process.env.REACT_APP_ENV === 'production' ? 'https://ws.inshasaki.com/api' : (process.env.REACT_APP_ENV === 'staging' ? 'https://ws.inshasaki.com/api' : 'https://ws.inshasaki.com/api')
export const URL_HR = process.env.REACT_APP_ENV === 'production' ? 'https://wshr.hasaki.vn' : (process.env.REACT_APP_ENV === 'staging' ? 'https://wshr.inshasaki.com' : 'http://ws.hasaki.local')
export const WS_TUYENDUNG = process.env.REACT_APP_ENV === 'production' ? 'https://tuyendung.hasaki.vn/api' : (process.env.REACT_APP_ENV === 'staging' ? 'https://tuyendung-qc.inshasaki.com/api' : 'https://tuyendung-qc.inshasaki.com/api')
export const WS_API_WORK = process.env.REACT_APP_ENV === 'production' ? 'https://apiwork.hasaki.vn/api' : (process.env.REACT_APP_ENV === 'staging' ? 'https://testapiwork.hasaki.vn/api' : 'https://testapiwork.hasaki.vn/api');
export const URL_AI = "https://chatbot.gpu.rdhasaki.com/api";
export const URL_AI_V2 = "https://ocr.gpu.rdhasaki.com";
export const WS_HR = URL_HR + '/api';
export const MEDIA_URL_HR = process.env.REACT_APP_ENV === 'production' ? URL_HR + '/production/hr' : (process.env.REACT_APP_ENV === 'staging' ? URL_HR + '/development/hr' : URL_HR + '/development/hr');
export const URL_MEDIA_HR = process.env.REACT_APP_ENV === 'production' ? 'https://hr-media.hasaki.vn' : (process.env.REACT_APP_ENV === 'staging' ? 'https://wshr.inshasaki.com' : 'http://ws.hasaki.local');
export const URL_AI_HR = process.env.REACT_APP_ENV === 'production' ? 'https://ai.hasaki.vn' : (process.env.REACT_APP_ENV === 'staging' ? 'https://ai.hasaki.vn' : '');
export const WS_URL_TUYENDUNG = process.env.REACT_APP_ENV === 'production' ? 'https://tuyendung.hasaki.vn/' : (process.env.REACT_APP_ENV === 'staging' ? 'https://tuyendung-qc.inshasaki.com/' : 'https://tuyendung-qc.inshasaki.com/')
export const CHAT_API = "https://chatbot.gpu.rdhasaki.com/api"
export const UPLOAD_FILES = process.env.REACT_APP_ENV === "production" ? "https://wshr.hasaki.vn/api/v2/files" : process.env.REACT_APP_ENV === "staging" ? "https://wshr.inshasaki.com/api/v2/files" : "";

export const REACT_APP_VERSION = process.env.REACT_APP_VERSION
export const TOGGLE_LEFT_SIDEBAR = true;
export const TOGGLE_LEFT_SIDEBAR_KEY = 'toggle_left_sidebar';