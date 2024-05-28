import { isArray } from "lodash"

export const IMAGE_CATEGORIES = {
    0: {
        name: "Máy móc/Thiết bị",
        id: 0
    },
    1: {
        name: "Sản phẩm",
        id: 1
    },
    2: {
        name: "Tài liệu",
        id: 2
    },
}

export const SUGGESTION_TYPE = {
    0: {
        name: "Bảo trì",
        id: 0
    },
    1: {
        name: "Tư vấn",
        id: 1
    },
    2: {
        name: "Hướng dẫn sử dụng",
        id: 2
    },
}

export const CATEGORIES_SP = {
    1: {
        name: "Thiết bị IT",
        id: 1
    },
    2: {
        name: "Thiết bị phòng khám",
        id: 2
    },
    4: {
        name: "Thiết bị SPA",
        id: 4
    },
    8: {
        name: "Thiết bị nội thất",
        id: 8
    },
    16: {
        name: "Thiết bị điện - điện tử",
        id: 16
    },
    32: {
        name: "Phương tiện vận tải",
        id: 32
    },
    64: {
        name: "Phụ kiện kèm theo",
        id: 64
    },
}
export const MAJORS = {
    "0": {
        name: "Chưa xác định",
        id: "0"
    },
    "1": {
        name: "Điều dưỡng",
        id: "1"
    },
    "2": {
        name: "Bảo trì",
        id: "2"
    },
    "3": {
        name: "Kỹ thuật viên",
        id: "3"
    },
    "4": {
        name: "Người dùng",
        id: "4"
    },
    "5": {
        name: "Quản lý chất lượng",
        id: "5"
    },
    "6": {
        name: "QLCN",
        id: "6"
    },
    "7": {
        name: "Vận hành máy",
        id: "7"
    },
}
const skipsColumn = ['Data']
export const formatDataFileXLSX = (object) => {
    const dataImport = [];
    for (let key in object) {
        if (skipsColumn.includes(key)) {
            delete object[key]
        } else {
            for (let subKey in object[key]) {
                const document = {
                    sku: object[key][subKey]['SKU'] ? object[key][subKey]['SKU'].toString() : object[key][0]['SKU'].toString(),
                    product_name: object[key][subKey]['Tên máy'] ? object[key][subKey]['Tên máy'] : object[key][0]['Tên máy'],
                    error_code: object[key][subKey]['Mã lỗi'] ? object[key][subKey]['Mã lỗi'].toString() : "",
                    explaining: object[key][subKey]['Mô tả lỗi'] ? object[key][subKey]['Mô tả lỗi'] : "",
                    suggestion_action: object[key][subKey]['Cách xử lý'] ? object[key][subKey]['Cách xử lý'] : "",
                    major: object[key][subKey]['Trách nhiệm xử lý'] ? object[key][subKey]['Trách nhiệm xử lý'] : [],
                }
                if (!isArray(document.major)) {
                    const majors = document.major.split('/')
                    if (majors.length) {
                        document.major = majors.map(item => {
                            const id = Object.keys(MAJORS).find(key => MAJORS[key].name === item)
                            return id ? id : "0"
                        })
                    }
                }
                dataImport.push(document)
            }
        }
    }

    return dataImport
}