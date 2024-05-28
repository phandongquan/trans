import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Typography } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { detail as apiDetail, getStaffsByCommunication as apiGetStaffsByCommunication } from '~/apis/company/communication'
import ExportXLSButton from '~/components/Base/ExportXLSButton';
import iconChecked from './config/checked.png'
import dayjs from 'dayjs';
import { header, formatViewConfirm } from './config/exportCommunicationViewConfirm';
import { screenResponsive } from '~/constants/basic';
const { Text } = Typography;
export class CommunicationViewConfirm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      staffs: [],
      communication: null,
      confirmInteracts: {},
      notClearInteracts: {}
    }
  }

  componentDidMount() {
    let { params } = this.props.match;
    if (params.id) {
      this.getStaffsByCommunication(params.id)
      this.getDetailCommunication(params.id)
    }
  }

  getStaffsByCommunication = (id) => {
    let xhr = apiGetStaffsByCommunication(id)
    xhr.then(response => {
      if (response.status) {
        this.setState({ staffs: response.data })
      }
    })
  }

  getDetailCommunication = async (id) => {
    let response = await apiDetail(id)
    if (response.status) {
      let { detail } = response.data;
      let confirmInteracts = {};
      if (Array.isArray(detail.confirm_interacts)) {
        confirmInteracts = detail.confirm_interacts.reduce((start, cur) => ({ ...start, [cur.user_id]: cur }), {});
      }
      let notClearInteracts = {};
      if (Array.isArray(detail.not_clear_interacts)) {
        notClearInteracts = detail.not_clear_interacts.reduce((start, cur) => ({ ...start, [cur.user_id]: cur }), {});
      }
      this.setState({ communication: detail, confirmInteracts, notClearInteracts })
    }
  }

  /**
   * Export skillList to XLS
   */
  formatExportCell() {
    let { staffs, confirmInteracts, notClearInteracts } = this.state;
    let headerFormat = [];
    /**
     * Set default header
     */
    Object.keys(header).map((key, i) => {
      headerFormat.push(header[key]);
    });

    let dataFormat = formatViewConfirm(staffs, this.state.communication, confirmInteracts, notClearInteracts);
    return [...[headerFormat], ...dataFormat];
  }

  render() {
    let { communication, staffs, confirmInteracts, notClearInteracts } = this.state;
    let { t } = this.props;
    let staffSorted = [];
    let staffViews = [];
    let staffNotViews = [];

    if (Array.isArray(staffs) && staffs.length) {
      staffs.map(s => {
        if (communication?.views.indexOf(String(s.user_id)) > -1) {
          staffViews.push(s)
        } else {
          staffNotViews.push(s)
        }
      })
    }
    staffSorted = [...staffViews, ...staffNotViews]
    let { baseData: { departments, divisions, locations } } = this.props
    const columns = [
      {
        title: "No.",
        render: (r) => staffSorted.indexOf(r) + 1,
      },
      {
        title:t('hr:staff'),
        render: (r) => (
          <span>
            {r.staff_name} <strong>#{r.code}</strong>
          </span>
        ),
      },
      {
        title:t('hr:dept') + "/" +t('hr:sec') + "/"+ t('hr:location'),
        render: (r) => {
          let deparment = departments.find((d) => r.staff_dept_id == d.id);
          let deptName = deparment ? deparment.name : "NA";
          let division = divisions.find((d) => r.division_id == d.id);
          let divName = division ? division.name : "NA";
          let location = locations.find((l) => r.staff_loc_id == l.id);
          let locName = location ? location.name : "NA";
          return (
            <>
              <strong>{deptName}</strong> /{divName} /{locName}
            </>
          );
        },
      },
      {
        title:t('hr:view'),
        render: (r) =>
          communication?.views?.includes(String(r.user_id)) ||
            communication?.views?.includes(Number(r.user_id)) ? (
            <img src={iconChecked} width={30} height={25} alt='' />
          ) : (
            ""
          ),
        align: "center",
      },
      {
        title: t('hr:confirm'),
        render: (r) => {
          let conformedAt = communication?.DocumentInteractive?.find((i) => i.user_id == r.user_id)?.created_at;
          return communication?.confirms?.includes(String(r.user_id)) ||
            communication?.confirms?.includes(Number(r.user_id)) ? (
            <>
              <img src={iconChecked} width={30} height={25} alt='' />
              <div>
                <small>{confirmInteracts[r.user_id]?.created_at}</small>
                {conformedAt ? <small>{dayjs(conformedAt).format('YYYY-MM-DD HH:mm')}</small> : null}
              </div>
            </>
          ) : null;
        },
        align: "center",
      },
      {
        title: t('not_clear'),
        render: (r) =>
          communication?.not_clears?.includes(String(r.user_id)) ||
            communication?.not_clears?.includes(Number(r.user_id)) ? (
            <>
              <img src={iconChecked} width={30} height={25} alt='' />
              <div>
                <small>{notClearInteracts[r.user_id]?.created_at}</small>
              </div>
            </>
          ) : (
            ""
          ),
        align: "center",
      },
    ];
    return (
      <>
        <PageHeader title={this.state.communication?.title}
          tags={[
            <ExportXLSButton key="export-skill"
              dataPrepare={this.formatExportCell.bind(this)}
              fileName={`Communication-confirm-view-${dayjs().format('YYYY-MM-DD')}`}
              autofit={1} type="primary"
            > &nbsp;{t('hr:export')}</ExportXLSButton>
          ]}
        />
        {window.innerWidth < screenResponsive ?
          <div className='block_scroll_data_table'>
            <div className='main_scroll_table'>
              <Table
                columns={columns}
                dataSource={staffSorted}
                rowKey='staff_id'
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} />
                    <Table.Summary.Cell index={1} />
                    <Table.Summary.Cell index={2} />
                    <Table.Summary.Cell align='center' index={3}><Text>{communication?.views?.length}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell align='center' index={4}><Text>{communication?.confirms?.length}</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                pagination={false}>
              </Table>
            </div>
          </div>
          :
          <Table
            columns={columns}
            dataSource={staffSorted}
            rowKey='staff_id'
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} />
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell align='center' index={3}><Text>{communication?.views?.length}</Text></Table.Summary.Cell>
                <Table.Summary.Cell align='center' index={4}><Text>{communication?.confirms?.length}</Text></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            pagination={false}
          />
        }
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(CommunicationViewConfirm)
