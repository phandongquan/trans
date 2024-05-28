import React, { Component } from "react";
import { Modal } from "antd";
import ReactPlayer from "react-player";
class PopupPdfOrYoutube extends Component {
  /**
   * Render content
   */
  renderContent() {
    let { chapter } = this.props;
    if (chapter && chapter.type === "pdf")
      return <iframe width="100%" height={"700vh"} src={chapter?.link || ""} />;
    else
      return (
        <ReactPlayer
          url={chapter?.link || ""}
          playing
          width="100%"
          height={"600px"}
          controls={true}
        />
      );
  }
  render() {
    return (
      <Modal
        title="Title"
        open={this.props.visible}
        onCancel={this.props.hidePopup}
        width="65%"
      >
        {this.renderContent()}
      </Modal>
    );
  }
}

export default PopupPdfOrYoutube;
