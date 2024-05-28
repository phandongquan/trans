import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import highcharts3d from 'highcharts/highcharts-3d';

highcharts3d(Highcharts);

class ChartPie extends Component {
    constructor(props){
        super(props)
    }

    render() {
        const { t, datas, title, subTitle } = this.props;
        const chartOptions= {
            title: { text: subTitle },
            tooltip: { pointFormat: "Total: ({point.y}) <b>{point.percentage:.1f}%</b>" },
            series: [{
                type: "pie",
                data: datas,
            }],
            chart: {
              type: "pie",
              options3d: { enabled: true, alpha: 45, beta: 0 }
            },
            plotOptions: {
              pie: {
                allowPointSelect: true,
                cursor: "pointer",
                depth: 35,
                dataLabels: {
                  enabled: true,
                  format: "{point.name}"
                }
              }
            },
        }

        return ( 
            <div className="card">
                <h4 style={{ padding: '10px', paddingBottom: '0' }}>{ title ? title :  t('Chart') }</h4>
                <div className="card-body">
                    <HighchartsReact options={chartOptions} highcharts={Highcharts}/>
                </div>
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

export default connect(mapStateToProps, null)(withTranslation()(ChartPie));