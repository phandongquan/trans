import React, { Component } from 'react';
import HeadlinesPicker from './HeadlinesPicker';

class HeadlinesButton extends Component {
    onClick = () =>
        // A button can call `onOverrideContent` to replace the content
        // of the toolbar. This can be useful for displaying sub
        // menus or requesting additional information from the user.
        this.props.onOverrideContent(HeadlinesPicker);

    render() {
        return (
            <div className='headlineButtonWrapper'>
                <button onClick={this.onClick} className='headlineButton'>
                    H
                </button>
            </div>
        );
    }
}

export default (HeadlinesButton)