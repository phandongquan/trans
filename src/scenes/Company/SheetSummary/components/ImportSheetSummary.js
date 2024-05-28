import { Button, DatePicker, Form, Modal, Row, Col } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Upload from '~/components/Base/Upload';
import { ImportOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { importSheetSummary as apiImport } from '~/apis/company/sheetSummary'
import { dateFormat } from '~/constants/basic';
import { showNotify } from '~/services/helper';

export const ImportSheetSummary = (props) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const formRef = useRef(null);
    const uploadRef = useRef(null);
  
    useEffect(() => {
        if(formRef.current && visible) {
            formRef.current.setFieldsValue({
                month: dayjs()
            });
        }
    }, [visible])

    /**
     * Submit form
     */
    const handleOk = () => {
        formRef.current
            .validateFields()
            .then((values) => {
                setLoading(true);
                let formData = new FormData();
                formData.append('month', values.month ? dayjs(values.month).format('YYYY-MM-01') : dayjs().format(dateFormat))
                formData.append('file', values.file[0])
                let xhr = apiImport(formData)
                xhr.then(res => {
                    setLoading(false);
                    if(res.status) {
                        showNotify('Notify', 'Import successfully!')
                        setVisible(false);
                    } else {
                        showNotify('Notify', res.message, 'error')
                    }
                })
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
    const {t} = props.translang;
    return <>
        <Button className='mr-3' type='primary' icon={<ImportOutlined />}
            onClick={() => setVisible(true)}>
            {t('import_file')}
        </Button>
        <Modal
            open={visible}
            onCancel={() => setVisible(false)}
            onOk={() => handleOk()}
        >
            <Form
                layout='vertical'
                className='p-2'
                ref={formRef}
            >
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name='month' label={t('month')} rules={[{required: true, message: t('hr:input_month')}]}>
                            <DatePicker picker="month" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='File' name={t('file')}  rules={[{required: true, message: t("hr:select_file")}]}>
                            <Upload
                                ref={uploadRef}
                                type={[
                                    'application/excel',
                                    'application/vnd.ms-excel',
                                    'application/x-excel',
                                    'application/x-msexcel',
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                ]}
                                accept='.xls,.xlsx'>
                                <Button icon={<UploadOutlined />}>{t('hr:click_upload')}</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    </>
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ImportSheetSummary)