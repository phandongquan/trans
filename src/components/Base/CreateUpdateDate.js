import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { parseIntegertoTime, timeFormatStandard } from '~/services/helper';
import { connect } from 'react-redux';

const dateTimeFormat = 'YYYY-MM-DD HH:mm'

/**
 * @propsType define
 */
const propTypes = {
    record: PropTypes.object,
};
const defaultProps = {
    record: {},
}

class Editor extends Component {

    render() {
        let { record, baseData: { users } } = this.props;

        return (
            <>
                { 
                    <small> 
                        {
                            typeof record.created_at == 'string' && record.created_at != '-0001-11-30 00:00:00' ? 
                            `Created: ${timeFormatStandard(record.created_at, dateTimeFormat)}` : 
                            record.created_at && (record.created_at > 0) ? 
                            `Created: ${parseIntegertoTime(record.created_at, dateTimeFormat)}` : ''
                        }
                    </small>
                }
                { 
                    record.created_by > 0 &&
                    <small> 
                        &nbsp;By { record.created_by_user ? record.created_by_user.name : ''} #<strong>{record.created_by}</strong>
                    </small> 
                }
                { 
                    <small> 
                        <br/> 
                        {
                            typeof record.updated_at == 'string' && record.updated_at != '-0001-11-30 00:00:00' ? 
                            `Modified: ${timeFormatStandard(record.updated_at, dateTimeFormat)}` : 
                            record.updated_at && (record.updated_at > 0) ? 
                            `Modified: ${parseIntegertoTime(record.updated_at, dateTimeFormat)}` : ''
                        }
                    </small>
                }
                { 
                    record.updated_by > 0 &&
                    <small>
                        &nbsp;By { record.updated_by_user ? record.updated_by_user.name : '' } #<strong>{record.updated_by}</strong>
                    </small>
                }
            </>
        );
    }
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)