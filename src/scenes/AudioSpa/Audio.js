import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faFileDownload } from '@fortawesome/free-solid-svg-icons'

class Audio extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            play: false
        };

    }
    render() {
        let { play } = this.state;
        let { source } = this.props;
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {play ? (
                    <audio style={{ height: '30px' }} autoPlay controls className="audio-element">
                        <source src={source}></source>
                    </audio>
                ) : (
                    <Tooltip title="Play recorder">
                        <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.setState({ play: true })}
                            style={{ fontSize: 25, color: '#1890ff', cursor: 'pointer' }} />
                    </Tooltip>
                )}
                {/* <Tooltip title="Download file">
                    <a href={source}target="_blank">
                        <FontAwesomeIcon icon={faFileDownload} style={{ fontSize: 25, color: '#1890ff', marginLeft: 10, cursor: 'pointer' }} />
                    </a>
                </Tooltip> */}
            </div>
        )
    }
}

export default Audio
