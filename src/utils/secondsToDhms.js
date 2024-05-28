export default (seconds)=> {
    seconds = Number(seconds);
    if(seconds < 1){
        return 0
    }
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + (d == 1 ? " day" : " days") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
    const sDisplay = s > 0 && seconds <= 60 ? s + (s == 1 ? " second" : " seconds") : "";
    return [dDisplay, hDisplay, mDisplay, sDisplay].filter(item=>!!item).map((item, i, arr)=> {
        if(i < arr.length - 1){
            return item + ', '
        }
        return item
    }).join('')
}