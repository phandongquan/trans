import { options_payment_types, options_payment_companys } from "./options"

export default (options)=>{
    const payment = options_payment_types.find(item=>item.value === options.type) || {}
    const company = options_payment_companys.find(item=>item.value === options.company_id) || {}
    let payment_name = payment.shortLabel || options.type
    let payment_amount = 0
    if(options.type === 8 && options.company_id){ //PAYMENT_METHOD_MOBILE_CODE
        payment_name = company.shortLabel || options.company_id;
    }
    if(options.note){
        try {
            const note = JSON.parse(options.note)
            if(options.type === 4){ //PAYMENT_METHOD_VOUCHER
                payment_name += `(${note.voucher_code})`
            }else if(options.type === 5){ //PAYMENT_METHOD_GIFTCARD
                payment_amount = note.original_price
            }
        } catch (error) {
            // payment_name += `(${note.voucher_code})`
        }
    }
    return {
        name: payment_name,
        amount: payment_amount
    }
}