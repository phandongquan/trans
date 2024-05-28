import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Tabs } from "antd";

class Tab extends Component {

    /**
     * Render tablist
     */
    getItems = () => {
        let { tabs, t } = this.props;
        if (typeof tabs == 'function') {
            tabs = tabs();
        }
        let tabList = [];
        if (tabs && tabs.length) {
            tabs.map((tab, i) => {
                tabList.push({
                    label: t(tab.title),
                    key: tab.route,
                    disable: tab.disable ? true : false
                });
            });
        }
        return tabList;
    }

    /**
     * @event change Tab
     * @param {String} key 
     */
    changeTab = key => {
        this.props.history.push(`${key}`)
    }

    render() {
        let { match } = this.props;
        return <Tabs activeKey={match.url} onChange={this.changeTab} size="large" items={this.getItems()} />
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info
    }
}
const mapDispatchToProps = () => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withRouter(Tab)));