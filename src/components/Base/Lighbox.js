import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// import Lightbox from "react-image-lightbox";
import { getThumbnailHR, getURLHR } from "~/services/helper";
import { uniqueId } from "lodash";
import LazyLoad from "react-lazy-load";
import { URL_HR, URL_MEDIA_HR } from '~/constants';
import Lightbox from "rhino-react-image-lightbox-rotate";
import './config/lightbox.css'

/**
 * @propsType define
 */
const propTypes = {
  datas: PropTypes.array,
  captions: PropTypes.array,
  isFullPath : PropTypes.bool,
  width : PropTypes.number,
  height : PropTypes.number,
  pathUrl : PropTypes.string,
  isThumbnail : PropTypes.bool,
};
const defaultProps = {
  datas: [],
  captions: [],
  isFullPath : false,
  width : 240, 
  height : 360,
  pathUrl : '/production/hr/',
  isThumbnail : false
};

export class Lighbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photoIndex: 0,
      toggler: false,
    };
  }
  getThumbnailHRCustom(url = '', size = `${this.props.width}x${this.props.height}`) {
    let { pathUrl } = this.props
    if (!url) {
        return '';
    }

    let path = URL_MEDIA_HR + '/thumbnail/'
    return path + size + pathUrl + url;
}
  /**
   * Render images
   * @returns
   */
  renderImages = () => {
    let { datas, isFullPath } = this.props;
    let result = [];
    datas.map((img, index) =>
      result.push(
        <LazyLoad className={'item-image-shop'} key={uniqueId(index)}>
          <div style={{ width: '100', height: '80', marginRight: 5 }}>
            <img
              key={uniqueId("_images")}
              className="ml-1 mb-1 cursor-pointer"
              style={{ objectFit: "cover" }}
              // width={100}
              // height={80}
              src={isFullPath ? img : this.getThumbnailHRCustom(img)}
              onClick={() => this.setState({ toggler: true, photoIndex: index  })}
            />
          </div>
        </LazyLoad>
      )
    );
    return result;
  };

  render() {
    let { datas, captions, isFullPath , isImgAI, pathUrl , isThumbnail } = this.props;
    let { toggler, photoIndex } = this.state;
    let arrFullUrl = [];
    datas.map(d => {
      if(typeof d != 'undefined'){
        let arrStr = d.split('/x0.35')
        let resultStr = arrStr.join('')
        if(pathUrl) {
          if (isThumbnail) {
            let urlThumbnail = d 
            let url = urlThumbnail.replace('/thumbnail/100x80','')
            arrFullUrl.push(url)
          } else {
            arrFullUrl.push(URL_MEDIA_HR + pathUrl + d)
          }
        } else {
            arrFullUrl.push((isFullPath && isImgAI) ? resultStr : getURLHR(d))
        }
      }
    })
    return (
      <>
        {this.renderImages()}
        {toggler ? (
          <Lightbox
            mainSrc={arrFullUrl[photoIndex]}
            nextSrc={arrFullUrl[(photoIndex + 1) % arrFullUrl.length]}
            prevSrc={arrFullUrl[(photoIndex + arrFullUrl.length - 1) % arrFullUrl.length]}
            onCloseRequest={() => this.setState({ toggler: false })}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex:
                  photoIndex == 0
                    ? 0
                    : (photoIndex + arrFullUrl.length - 1) % arrFullUrl.length,
              })
            }
            onMoveNextRequest={() =>
              {
              this.setState({
                photoIndex:
                  photoIndex == arrFullUrl.length - 1
                    ? arrFullUrl.length - 1
                    : (photoIndex + 1) % arrFullUrl.length,
              })}
            }
            // imageCaption={captions[photoIndex]}
          />
        ) : (
          ""
        )}
      </>
    );
  }
}

Lighbox.propTypes = propTypes;
Lighbox.defaultProps = defaultProps;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Lighbox);
