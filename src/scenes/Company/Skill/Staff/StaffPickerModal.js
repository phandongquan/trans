import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Button, Modal, Table, Form, Col, Row, Input, Collapse, Checkbox, Avatar } from "antd";
import { searchForDropdown } from "~/apis/company/staffSearchDropDown";
import { updateLevel } from '~/apis/company/staff/skill';
import Dropdown from "~/components/Base/Dropdown";
import { getFirstCharacter, showNotify, getThumbnailHR } from "~/services/helper";
import { skillStatus, levels } from '~/constants/basic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';

const { confirm } = Modal;
const { Panel } = Collapse;

/**
 * @propsType define
 */
const propTypes = {
    style: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onSearch: PropTypes.func,
    onClear: PropTypes.func,
    skill: PropTypes.object,
};
const defaultProps = {
    style: {},
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { },
    skill: {},
};

class StaffPickerModal extends Component {
    constructor(props) {
        super(props);
        this.formSearchRef = React.createRef();
        this.state = {
            datas: [],
            loading: false,
            staffIds: [],
            level: 0,
            showChildren: false,
            checkAllChild: false,
            childList: [],
        };

        this.getListSkill = debounce(this.onSubmit, 500);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.prepareSkillsUpdate();
    }

    /**
     * @lifecycle
     */
    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    /**
     * Prepare data upgrade level skill for staff
     */
    prepareSkillsUpdate() {
        let { skill, skill: { children = [] } } = this.props;
        let childList = children.map(child => child.id);
        if (childList.length) {
            this.setState({ showChildren: true });
        } else {
            this.setState({ childList: [skill.id] });
        }
    }

    /**
     * Handle filter staff
     */
    handleFilterStaff = async () => {
        this.setState({ loading: true });
        let params = this.formSearchRef.current.getFieldsValue();
        let response = await searchForDropdown({
            ...params,
            limit: 200,
            offset: 0,
            sort: "staff_id",
        });

        this.setState({ loading: false });
        if (response.status) {
            this.setState({ datas: response.data });
        }
    };

    /**
     * Event check all children
     * 
     * @param {*} e 
     */
    onCheckAllChild(e) {
        let checkAllChild = e.target.checked;
        let { skill: { children = [] } } = this.props;
        let childList = checkAllChild ? children.map(child => child.id) : [];
        this.setState({ childList, checkAllChild });
    }

    /**
     * Event child selected
     * 
     * @param {*} e 
     * @param {*} child 
     */
    onChildSelected(e, child = {}) {
        let childList = this.state.childList.slice();
        let checked = e.target.checked;
        if (checked) {
            childList.push(child.id)
        } else {
            childList = childList.filter(cId => cId != child.id);
        }
        this.setState({ checkAllChild: false, childList });
    }

    /**
     * Apply submit
     */
    onSubmit() {
        let { t } = this.props;
        let { staffIds, level, childList } = this.state;

        if (!childList.length) {
            showNotify(t('Notification'), 'Please select skill!', 'warning');
            return;
        }
        if (!staffIds.length) {
            showNotify(t('Notification'), 'Please select staff!', 'warning');
            return;
        }

        confirm({
            title: t('Confirm?'),
            icon: <ExclamationCircleOutlined />,
            content: `Update skill for staff with level = ${level}?`,
            maskStyle: { background: 'rgba(0, 0, 0, 0.1)' },
            onOk: async () => {
                this.setState({ loading: true });
                let data = {
                    skill_id: childList,
                    staff_ids: staffIds,
                    level,
                    _method: 'PUT'
                };
                let response = await updateLevel(data);
                if (response.status) {
                    showNotify(t('Notification'), t('Data has been updated!'));
                    this.setState({ loading: false, staffIds: [] });
                    this.props.onSubmitFinished();
                }
            },
            onCancel: () => { },
        });
    };

    render() {
        let { t, skill = {}, baseData: { departments, majors, locations, positions }, } = this.props;
        let { staffIds, showChildren, childList, checkAllChild } = this.state;

        const columns = [
            {
                title: t("Staff Info"),
                render: (r) => {
                    let deptFound = departments.find((d) => d.id == r.staff_dept_id);
                    let majorFound = majors.find((m) => m.id == r.major_id);
                    let locFound = locations.find((l) => l.id == r.staff_loc_id);
                    return (
                        <div className="block_info_staff_fillter">
                            <div className="float-left mr-2 pt-1">
                                {r?.avatar ?
                                    <Avatar src={getThumbnailHR(r.avatar, '40x40')} />
                                    : <Avatar style={{ backgroundColor: 'rgb(245, 106, 0)' }}>{getFirstCharacter(r.staff_name)}</Avatar>
                                }
                            </div>
                            <div className="text_name_staff">
                                <strong>{r.staff_name} </strong>
                                <small> #{r.code}</small>
                            </div>
                            <div className="text_name_location">{`${deptFound?.name} / ${majorFound?.name} / ${locFound?.name}`}</div>
                        </div>
                    );
                },
            },
        ];

        return (
            <Modal keyboard={false}
                // style={{ top: 20, }}
                bodyStyle={{ paddingTop: '3px', paddingBottom: '3px' }}
                open={this.props.visible}
                onCancel={() => this.props.toggleModal(false)}
                footer={[
                    // <Button type="primary" style={{ float: 'left' }}>{t('Children skill')}</Button>,
                    <Dropdown key="level" datas={{ 0: 'Level 0', ...levels }} value={this.state.level} defaultOption={'Level 0'}
                        onChange={(level) => this.setState({ level })}
                        className={'mr-2'} style={{ width: '10%', textAlign: 'left' }} />,
                    <Button key="submit" type="primary" className="" disabled={this.state.loading}
                        onClick={() => this.onSubmit()} >
                        {t('Submit')}
                    </Button>,
                ]}
                title={<><strong>{skill.name}</strong></>}
                forceRender
                width='80%'
            >
                {showChildren ? (
                    <Collapse expandIcon={() => <></>} className="mb-2" style={{ backgroundColor: '#fff' }} bordered={false}
                        collapsible='disabled' defaultActiveKey='children' key={'children-skill'}>
                        <Panel
                            header={
                                <Row style={{ cursor: 'auto' }}>
                                    <Checkbox onChange={(e) => this.onCheckAllChild(e)} checked={checkAllChild}>
                                        <strong>{t('Select all children')}</strong>
                                    </Checkbox>
                                </Row>
                            }
                            key="children" >
                            <Row>
                                {skill.children && skill.children.map(child => {
                                    return (
                                        <Col span={6} key={`children-skill-${child.id}`}>
                                            <Checkbox onChange={(e) => this.onChildSelected(e, child)} checked={childList.includes(child.id)}>
                                                {child.name}
                                            </Checkbox>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Panel>
                    </Collapse>
                ) : null}

                <Form ref={this.formSearchRef} layout="vertical" onFinish={() => this.handleFilterStaff()} >
                    <Row gutter={24}>
                        <Col span={5}>
                            <Form.Item name="q">
                                <Input placeholder={t('Staff name, code, email...')} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="department_id">
                                <Dropdown datas={departments} defaultOption="--- All Departments ---" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="location_id">
                                <Dropdown datas={locations} defaultOption="--- All Locations ---" mode='multiple' />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="major_id">
                                <Dropdown datas={majors} defaultOption="--- All Majors ---" mode='multiple' />
                            </Form.Item>
                        </Col>

                        <Col span={1}>
                            <Button className="btn_search_fillter_staff" htmlType="submit" type="primary" icon={<FontAwesomeIcon icon={faSearch} />} />
                        </Col>
                    </Row>
                </Form>
                <Table loading={this.state.loading}
                    columns={columns}
                    dataSource={this.state.datas}
                    pagination={false}
                    scroll={{ y: '45vh' }}
                    rowSelection={{
                        selectedRowKeys: staffIds,
                        onChange: (staffIds, selectedStaff) => {
                            this.setState({ staffIds })
                        },
                        columnWidth: '50px'
                    }}
                    rowKey={(r) => r.staff_id}
                />
            </Modal>
        );
    }
}

StaffPickerModal.propTypes = propTypes;
StaffPickerModal.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffPickerModal));
