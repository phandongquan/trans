import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Modal, Table, Text } from 'antd';

class FailImport extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        let { t } = this.props;
        const datas = this.props.datas
        let datasFail = []
        let firstKey
        if (datas.fail_result) {
            let objKeyData = Object.keys(datas.fail_result)
            objKeyData.forEach((element, i) => {
                if (i == 0) {
                    firstKey = element
                }
                datasFail.push({ [element]: datas.fail_result[element] }
                )
            });
        }
        const columns = [
            {
                title: t('Dòng lỗi trên file'),
                render: r => Object.keys(r),
                width: 100
            },
            {
                title: t('Thông tin lỗi'),
                render: r => Object.values(r),
                width: 280
            }
        ]
        return (
            <>
                <Modal
                    title={'Thông tin import'}
                    forceRender
                    open={this.props.visible}
                    onCancel={() => this.props.togglePopup()}
                    onOk={() => this.props.togglePopup()}
                >
                    {datasFail.length ? <Table
                        rowKey={r => r.id}
                        columns={columns}
                        dataSource={datasFail}
                        pagination={false}
                    /> : <b>{this.props.datas.message}</b>}
                </Modal>
            </>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FailImport));