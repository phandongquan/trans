import { PageHeader } from '@ant-design/pro-layout'
import { Button, Col, Form, Input, Row, Table } from 'antd';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import { historyParams } from '~/services/helper';
import tabList from '~/scenes/Company/config/tabListSkill';
import Dropdown from '~/components/Base/Dropdown';
import { withTranslation } from 'react-i18next';
import { skillStatus } from '~/constants/basic';
import { getList as getListSkill, destroy as deleteSkill, importSkill } from '~/apis/company/skill';
import { skillBonusReportExport } from '~/apis/company/sheetSummary';
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import './config/skillcategory.css';

const FormItem = Form.Item;
export class SkillsCategory extends Component {
    /**
    * 
    * @param {*} props 
    */
    constructor(props) {
        super(props);
        this.state = {
            visibleConfirmUpload: false,
            loading: false,
            skillGroup: [],
            fileList: [],
            file: null,
        };
        this.formRef = React.createRef();
    }
    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getSkill();
    }
    /**
     * Get list skill
     * @param {} params 
     */
    getSkill = (params = {}) => {
        this.setState({ loading: true });
        let xhr = skillBonusReportExport({not_cost: 1});
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                let groupsSkill = []
                if (data.length) {
                    data.map((d) => {
                        if((d?.code && d?.code.length == 7) || this.checkSkillGroup(d.code)){
                            groupsSkill.push(d)
                        }else if(!d.parent_id){
                            let popCate = groupsSkill[groupsSkill?.length - 1];
                            if(popCate) {
                                if(typeof popCate['children'] == 'undefined') {
                                    popCate['children'] = [d]
                                }else{
                                    popCate['children'].push(d)
                                }
                            }
                        }else{
                            let popCate = groupsSkill[groupsSkill?.length - 1];
                            if(popCate) {
                                if(popCate['children']){
                                    let popParent = popCate['children'][popCate['children']?.length - 1]
                                    if(typeof popParent['children'] == 'undefined') {
                                        popParent['children'] = [d]
                                    }else{
                                        popParent['children'].push(d)
                                    }
                                }else{
                                    popCate['children'] = [d]
                                }
                            }
                        }
                    });
                }
                this.setState({
                    skillGroup: groupsSkill,
                    loading: false,
                });
            }
        });
    }
    /**
     * Check is skill group
     * @param {*} code 
     */
    checkSkillGroup(code) {
        if (!code || !(typeof code === 'string' || code instanceof String)) {
            return false;
        }
        let arrSplitted = code.split("-");
        return (arrSplitted.length == 3 && isNaN(arrSplitted[1]));
    }
  render() {
    let { t, baseData: { departments, divisions, positions, majors } } = this.props;
    const columns = [
        {
            title : ' ',
            render : r=> ' ',
            width: '10%'
        },
        {
            title : t('hr:skill_code'),
            render : r=> <strong>{r.code}</strong>,
            width: '20%'
        },
        {
            title : t('hr:skill_name'),
            render : r=> {
                let countSkillChild = ''
                if((r?.code && r?.code.length == 7) || this.checkSkillGroup(r.code)){
                    countSkillChild = r.children?.length ? r.children.length : '';
                }else if(!r.parent_id){
                    countSkillChild = r?.children?.length ? r.children.length : '';
                }
                return <><Link target='_blank' to={`/company/skill/${r.id}/edit`}>{r.name}</Link> <span style={{color : 'blue'}}>{countSkillChild ? `(${countSkillChild})` : ''}</span></>
            },
            width: '50%'
        },
        {
            title : t('hr:status'),
            render : r=> r.status && skillStatus[r.status],
            width: '20%'
        },
    ]
    return (
      <div>
        <PageHeader title={t('hr:category')}/>
        <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
        </Row>
        <Table 
            className='tb_category'
            columns={columns}
            dataSource={[...this.state.skillGroup]} 
            loading={this.state.loading}
            pagination={false}
            rowKey={'id'}
            
        />
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SkillsCategory));
