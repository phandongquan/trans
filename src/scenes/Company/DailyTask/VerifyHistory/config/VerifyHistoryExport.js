const typeIs_valid = {
    1 : 'Hợp lệ',
    2 : 'Không hợp lệ'
}

export const header = {
    name: "Tên Bước",
    staff_name: "Nhân viên",
    code : 'Code',
    created_at : 'Thời gian tạo',
    verify_name: "Người đánh giá",
    verify_code : 'Verify Code',
    verify_date : 'Thời gian đánh giá',
    is_valid: "Kết quả đánh giá",
    verify_note: "Ghi chú",
    is_valid2 : 'Kết quả đánh giá lần 2',
    verify_name2 : 'Người đánh giá lần 2',
    verify2_date : 'Thời gian đánh giá lần 2',
    verify2_note : 'Ghi chú lần 2'
};

export function getHeader() {
    let result = [];
    Object.keys(header).map((key) => {
        result.push(header[key]);
    });
    return [result];
}
export function formatData(datas) {
    let result = [];
    datas.map((record, index) => {
        let row = [];
        Object.keys(header).map((key) => {
            switch (key) {
                case "is_valid":
                    row.push(typeIs_valid[record.is_valid]);
                    break;
                case "verify_note":
                    let resultVerify_note = ((JSON.parse(record?.verify_note))?.filter(Boolean))?.toString()
                    row.push(resultVerify_note);
                    break;
                case 'verify_name2':
                    row.push(record.verify2_by > 0 ? record.verify_name2 : '')
                    break;
                case "is_valid2":
                    row.push(typeIs_valid[record.is_valid2]);
                    break;
                default:
                    row.push(record[key]);
                    break;
          }
      });
      result.push([...row]);
    });
    return result;
  }