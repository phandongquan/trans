export default (str)=>{
    try {
        const obj = JSON.parse(str);
        if(obj && typeof obj === 'object'){
            return true
        }
    } catch (e) {
    }
    return false;
} 