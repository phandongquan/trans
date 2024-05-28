export const header = {
    'id' : 'Id',
    'name' : 'Name',
    'total_task' : 'Total Task',
    'totalVerify' : 'Total Verify 1',
    'totalNotVerify' : 'Total Not Verify 1',
    'totalVerify2' : 'Total Verify 2',
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
                case "totalNotVerify":
                    row.push(record.total_task - record.totalVerify);
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