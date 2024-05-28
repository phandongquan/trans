import { CHAT_API } from '~/constants';
const prefix = '/parser-cv';

class EventSourceSingleton {
    constructor() {
        this.instance = null;
    }

    getInstance({ url }) {
        if (!this.instance) {
            this.instance = new EventSource(CHAT_API + prefix + `?url=${encodeURIComponent(url)}`);
        }
        return this.instance;
    }

    removeInstance() {
        if (this.instance) {
            this.instance.close();
            this.instance = null;
        }
    }
}

export default new EventSourceSingleton();