import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { detail as detailStaff } from '~/apis/company/staff';
import Barcode from 'react-barcode';
import logo from '~/assets/images/logo_180x47.svg';

class StaffPrint extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            staff: {}
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        if (id) {
            let xhr = detailStaff(id);
            xhr.then((response) => {
                if (response.status) {
                    let { staff } = response.data;
                    this.setState({ staff });
                }
            });
        }
    }

    /**
     * Print staff content
     * @param {*} e 
     */
    printStaff = (e) => {
        e.stopPropagation();
        var content = document.getElementById("printStaffContent");
        var pri = document.getElementById("ifmPrintStaff").contentWindow;
        pri.document.open();
        pri.document.write(content.innerHTML);
        pri.document.close();
        pri.focus();
        setTimeout(() => { pri.print(); }, 500);
    }

    /**
     * @rennder image || barcode
     * @param {*} type 
     */
    renderContent = (type = 'image') => {
        let { staff } = this.state;
        if (!staff.staff_id) {
            return [];
        }
        let row = 12, col = 3;
        let colComponent = [], template = [];
        for (let j = 1; j <= col; j++) {
            colComponent.push(
                type == 'image' ? (
                    <td key={j} style={{ border: '1px solid #ccc', textAlign: 'center' }}>
                        <img src={logo} alt="logo" className="base_logo" style={{ height: '41px' }} /><br />
                        <strong style={{ fontSize: '13px', display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                            {`NVTV: ${staff.staff_name}`}
                        </strong>
                    </td>
                ) : (<td key={j} style={{ borderTop: '1px solid #ccc', textAlign: 'center' }}><Barcode value={staff.code} height={40} fontSize={13} /></td>)

            );
        }
        for (let i = 1; i <= row; i++) {
            template.push(
                <tr key={`${i}`} style={{ border: '1px solid #ccc', textAlign: 'center', padding: '8px', verticalAlign: 'middle', width: '217px', height: '81px', margin: 0 }}>
                    {colComponent}
                </tr>
            );
        }
        return template;
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        return (
            <div>
                <PageHeader title={t('Staff Print')}
                    tags={[
                        <Button key="create-staff" onClick={(e) => this.printStaff(e)} type="primary" icon={<FontAwesomeIcon icon={faPrint} />}>&nbsp;{t('Print Name')}</Button>
                    ]}
                >
                </PageHeader>
                <Row className="card pl-3 pr-3 pt-3 mb-3" id="printStaffContent">
                    <table key="img_content" style={{ width: '650px' }} >
                        <tbody>
                            {this.renderContent('image')}
                        </tbody>
                    </table>
                    <table key="barcode_content" style={{ width: '650px' }} >
                        <tbody>
                            {this.renderContent('barcode')}
                        </tbody>
                    </table>
                </Row>
                <iframe id="ifmPrintStaff" style={{ display: 'none' }} title="Staff Print" />
            </div>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffPrint));
