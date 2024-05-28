import React, { PureComponent } from 'react';
import axios from 'axios';

const urlAI = 'https://ai.hasaki.vn/speech/'
class Audio extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            play: false,
            linkAudio: {},
        };

    }
    componentDidUpdate(prevProps, prevState) {
        if(this.props.dataFormat != prevProps.dataFormat) {
            this.setState({ play: false })
        }
    }

    /**
     * play audio
     * @param {Object} params 
     */
    getAudio = (params = {}) => {
        this.setState({ loading: true })
        axios.post(`${urlAI}get_sound?ID=${params}`)
            .then(response =>
                this.setState({ linkAudio: response.data.files, loading: false ,play : true })
            )
            .catch(error => console.log(error))
    }
    render() {
        let { play , linkAudio } = this.state;
        let {  nameAudio } = this.props;
        return (
            <div style={{justifyContent: 'center', alignItems: 'center' }}>
                {play ? (
                    <>
                        <p className='cursor-pointer' onClick={() => this.getAudio(nameAudio)} style={{ color:'#009aff'}}>{nameAudio}</p>
                        <audio style={{ height: '30px' }} autoPlay controls className="audio-element">
                            <source src={`${urlAI}${linkAudio}`}></source>
                        </audio>
                    </>
                ) : 
                (
                    <p className='cursor-pointer' onClick={() => this.getAudio(nameAudio)} style={{ color:'#009aff'}}>{nameAudio}</p>
                )}
            </div>
        )
    }
}

export default Audio
