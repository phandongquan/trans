export const digits = (value) => {
    if (!value) {
        return value
    }
    if (typeof value === 'number') {
        value = value.toString()
    }
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
}

export const resizeText = (text, length) => {
    if (!text) {
        return text
    }
    if (text.length > length) {
        return text.substring(0, length) + '...'
    }
    return text
}