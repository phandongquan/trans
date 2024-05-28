import React from 'react'
import convertVITovi from "./convertVITovi";
import getIndicesOf from "./getIndicesOf";

export default ({searchStr='', str=''})=>{
    if(!searchStr || !str){
        return str
    }

    const arr_index = getIndicesOf(convertVITovi(searchStr), convertVITovi(str))
    const result = arr_index.reduce((acc, cur, i)=>{
        const word = str.substring(cur, cur + searchStr.length);
        if(acc.search(`<b>${word}</b>`) != -1){
            return acc
        }
        acc = acc.replaceAll(word, `<b>${word}</b>`)
        return acc
    }, str)
    return <span dangerouslySetInnerHTML={{__html: result}}/>
}