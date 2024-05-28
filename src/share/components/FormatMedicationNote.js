import React from 'react'
import isJSON from '~/utils/isJSON'

export const FormatMedicationNote = ({ note, inline }) => {
    let note_str = ''
    let cach_dung = ''
    let unit = 'lần'
    // let luu_y = ''

    if(isJSON(note)){
        const node_obj = JSON.parse(note)
        if(node_obj.cach_dung === 'Uống'){
            unit = 'viên'
        }

        note_str = node_obj.cach_dung ? ` - Cách dùng: ${node_obj.cach_dung}` : ''
        note_str += node_obj.sang ? ` - Sáng: ${node_obj.sang} ${unit}` : ''
        note_str += node_obj.trua ? ` - Trưa: ${node_obj.trua} ${unit}` : ''
        note_str += node_obj.chieu ? ` - Chiều: ${node_obj.chieu} ${unit}` : ''
        note_str += node_obj.toi ? ` - Tối: ${node_obj.toi} ${unit}` : ''
        note_str += node_obj.luu_y ? ` - Lưu ý: ${node_obj.luu_y}` : ''

        // luu_y = node_obj.luu_y ? node_obj.luu_y : ''

    }else if(typeof note === 'string'){ // OLD format
        const arr_note = String(note).split('-')
        for (let index = 0; index < arr_note.length; index++) {
            const element = arr_note[index];
            if(element.indexOf('Cách dùng') > -1){
                cach_dung = element.split(':')[1].trim()

                note_str += ` - Cách dùng: ${cach_dung}`
                if(cach_dung == 'Uống'){
                    unit = 'viên'
                }
            }
            if(element.indexOf('Sáng') > -1){
                note_str += ` - Sáng: ${element.split(':')[1].trim()} ${unit}`
            }
            if(element.indexOf('Trưa') > -1){
                note_str += ` - Trưa: ${element.split(':')[1].trim()} ${unit}`
            }
            if(element.indexOf('Chiều') > -1){
                note_str += ` - Chiều: ${element.split(':')[1].trim()} ${unit}`
            }
            if(element.indexOf('Tối') > -1){
                note_str += ` - Tối: ${element.split(':')[1].trim()} ${unit}`
            }
            if(element.indexOf('Lưu ý') > -1){
                note_str += ` - Lưu ý: ${element.replace('Lưu ý:', '').trim()}`
            }
        }
    }
    note_str = note_str.trim().replace(/^-+|-+$/g, '')
    return (
        <span>
            {inline ? note_str : <span dangerouslySetInnerHTML={{__html: String(note_str).replace(' - Lưu ý', '<br/>Lưu ý')}}/>}
        </span>
    )
}
