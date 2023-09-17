
export const settingGetDataByTable = (data_, table) => {
    let data = data_;
    if (table == 'deposits') {
        for (var i = 0; i < data.content.length; i++) {
            let col = data.content[i];
            if (col.type == 0) {
                data.content[i].type_str = '추가건';
            } else if (col.type == 1) {
                data.content[i].type_str = '감소건';
            }
            if (col.method_type == 0) {
                data.content[i].method_type_str = '결제';
            } else if (col.method_type == 1) {
                data.content[i].method_type_str = '관리자 수정';
            } else if (col.method_type == 2) {
                data.content[i].method_type_str = '발송';
            }
        }
    }
    if (table == 'senders') {
        for (var i = 0; i < data.content.length; i++) {
            let col = data.content[i];
            if (col.status == 0) {
                data.content[i].status_str = '정상';
            } else if (col.status == 1) {
                data.content[i].status_str = '검토중';
            } else if (col.status == 2) {
                data.content[i].status_str = '차단됨';
            }

        }
    }
    return data;
}