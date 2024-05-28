import React, { Component } from "react";
import { Modal } from "antd";

class PopupFile extends Component {
  /**
   * Render content
   */
  renderContent() {
    function isFullUrl(url) {
      try {
        new URL(url);
        return true;
      } catch (error) {
        return false;
      }
    }
    let { chapter } = this.props;
    let file = chapter.link.split(".").pop();
    if (chapter && file != "pdf" && file != "mp4")
      return (
        <iframe
          width="100%"
          height={"700vh"}
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${
            isFullUrl(chapter?.link) ? chapter?.link : chapter + chapter?.link
          }` || ""}
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

export default PopupFile;
