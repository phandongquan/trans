import { uniqueId } from "lodash";
export const REG_MENTION = /@\[([^\]]+?)\]\(user_id:([^\]]+?)\)/gim;
const REG_HASHTAG = /(#[A-Za-z0-9_\d-\[\]]+)/gi;
const REG_LINK = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]*[-A-Z0-9+&@#\/%=~_|]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]*[-A-Z0-9+&@#\/%=~_|]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]*[-A-Z0-9+&@#\/%=~_|]{2,}|www\.[a-zA-Z0-9]+\.[^\s]*[-A-Z0-9+&@#\/%=~_|]{2,})/gim;

const getIndicesOf = (searchStr, str, caseSensitive) => {
    let tempStr = str;
    let tempSearchStr = searchStr;
    const searchStrLen = tempSearchStr.length;
    if (searchStrLen === 0) {
        return [];
    }
    let startIndex = 0;
    let index;
    const indices = [];
    if (!caseSensitive) {
        tempStr = tempStr.toLowerCase();
        tempSearchStr = tempSearchStr.toLowerCase();
    }

    while ((index = tempStr.indexOf(tempSearchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
};

const getEntityRanges = (text, mentionName, mentionKey) => {
    const indices = getIndicesOf(mentionName, text);
    if (indices.length > 0) {
        return indices.map(offset => ({
            key: mentionKey,
            length: mentionName.length,
            offset: offset
        }));
    }

    return null;
};

/**
 * Create mention entity for draftjs
 * 
 * @param {*} rawContent 
 * @param {*} tags 
 * @returns 
 */
export const createMentionEntities = (rawContent, tags = []) => {

    rawContent.blocks = rawContent.blocks.map((block, i) => {
        const ranges = [];
        tags.forEach((tag, index) => {
            let key = uniqueId('men_');
            const entityRanges = getEntityRanges(block.text, `@${tag.name}`, key);
            if (entityRanges) {
                rawContent.entityMap[key] = {
                    type: 'mention',
                    mutability: 'IMMUTABLE',
                    data: { mention: { id: tag.id, name: tag.name, link: `/profile/${tag.id}` } }
                };
                ranges.push(...entityRanges);
            }
        });

        if(typeof rawContent.blocks[i].entityRanges == 'undefined') {
            rawContent.blocks[i].entityRanges = [];
        }
        return { ...block, entityRanges:  [...rawContent.blocks[i].entityRanges, ...ranges] };
    });
    return rawContent;
};

/**
 * Create hashtag entity for draftjs
 * 
 * @param {*} rawContent 
 * @param {*} tags 
 * @returns 
 */
export const createHashtagEntities = (rawContent, tags = []) => {
    rawContent.blocks = rawContent.blocks.map((block, i) => {
        if(typeof rawContent.blocks[i].entityRanges == 'undefined') {
            rawContent.blocks[i].entityRanges = [];
        }

        const ranges = [];
        tags.forEach((tag, index) => {
            let key = uniqueId('hash_');
            const entityRanges = getEntityRanges(block.text, tag.name, key);
            if (entityRanges) {
                rawContent.entityMap[key] = {
                    type: '#mention',
                    mutability: 'IMMUTABLE',
                    data: { mention: { name: tag.name, link: `/hashtag/${tag.name.replace('#', '')}` } }
                };
                ranges.push(...entityRanges);
            }
        });

        if(typeof rawContent.blocks[i].entityRanges == 'undefined') {
            rawContent.blocks[i].entityRanges = [];
        }
        return { ...block, entityRanges: [...rawContent.blocks[i].entityRanges, ...ranges] };
    });
    return rawContent;
};

/**
 * Create link entity for draftjs
 * 
 * @param {*} rawContent 
 * @param {*} tags 
 * @returns 
 */
export const createLinkEntities = (rawContent, links = []) => {
    rawContent.blocks = rawContent.blocks.map((block, i) => {
        const ranges = [];
        links.forEach((link, index) => {
            let key = uniqueId('link_');
            const entityRanges = getEntityRanges(block.text, link.url, key);
            if (entityRanges) {
                rawContent.entityMap[key] = {
                    type: 'LINK',
                    mutability: 'MUTABLE',
                    data: { url: link.url, href: link.url }
                };
                ranges.push(...entityRanges);
            }
        });

        if(typeof rawContent.blocks[i].entityRanges == 'undefined') {
            rawContent.blocks[i].entityRanges = [];
        }
        return { ...block, entityRanges: [...rawContent.blocks[i].entityRanges, ...ranges] };
    });
    return rawContent;
};


export const generateMention = (mention) => `@[${mention.name}](user_id:${mention.id})`;

export const replacePattern = (text, pattern, mentionList) => {
    if (!text) {
        return '';
    }
    const splitText = text.split(pattern);
    const matches = text.match(pattern);
    if (splitText.length <= 1) {
        return text;
    }
    return splitText.reduce((arr, element) => {
        if (!element) return arr;
        if (matches.includes(element)) {
            return [...arr, mentionList[element]];
        }
        return [...arr, element];
    }, []).join('');
};

/**
 * Both Mentions and Selections are 0-th index based in the strings
 * meaning their indexes in the string start from 0
 * findMentions finds starting and ending positions of mentions in the given text
 * @param val string to parse to find mentions
 * @returns list of found mentions
 */
export const findMentions = val => {
    let indexes = [];
    let match;
    while ((match = REG_MENTION.exec(val))) {
        indexes.push({
            start: match.index,
            end: REG_MENTION.lastIndex - 1,
            match: match[0],
            name: match[1],
            id: match[2],
            type: 'mention',
            link: ''
        });
    }
    return indexes;
};

/**
 * @param val 
 * @returns list 
 */
export const findHashtags = val => {
    let indexes = [];
    let match;
    while ((match = REG_HASHTAG.exec(val))) {
        indexes.push({
            start: match.index,
            end: REG_HASHTAG.lastIndex - 1,
            match: match[0],
            hashtag: match[1],
            name: match[1],
            type: '#mention',
            link: ''
        });
    }
    return indexes;
};

/**
 * @param val 
 * @returns list 
 */
export const findLinks = val => {
    let indexes = [];
    let match;
    while ((match = REG_LINK.exec(val))) {
        indexes.push({
            start: match.index,
            end: REG_LINK.lastIndex - 1,
            match: match[0],
            href: match[1],
            url: match[1],
            type: 'link'
        });
    }
    return indexes;
}

export default {
    createMentionEntities,
    createHashtagEntities,
    createLinkEntities,
    findMentions,
    findHashtags,
    findLinks,
    generateMention,
    replacePattern,
};