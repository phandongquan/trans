import React, { Component } from 'react';
import {
    Route,
    Switch
} from 'react-router-dom'

import NotFound from './scenes/NotFound'
import Forbidden from './scenes/Forbidden'
class Errors extends Component {
    render() {
        return (
            <Switch>
                <Route exact path={`${this.props.match.url}/404`} component={NotFound}/>
                <Route exact path={`${this.props.match.url}/403`} component={Forbidden}/>
            </Switch>
        );
    }
}

export default Errors;