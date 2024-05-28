import { Card } from 'antd';
import React from 'react';
import './index.css';

const renderTotal = (total) => {
  if (!total && total !== 0) {
    return null;
  }

  let totalDom;

  switch (typeof total) {
    case 'undefined':
      totalDom = null;
      break;

    case 'function':
      totalDom = <div className={'total'}>{total()}</div>;
      break;

    default:
      totalDom = <div className={'total'}>{total}</div>;
  }

  return totalDom;
};

class ChartCard extends React.Component {
  renderContent = () => {
    const { contentHeight, title, avatar, action, total, footer, children, loading } = this.props;

    if (loading) {
      return false;
    }

    return (
      <div className={'chartCard '}>
        <div className={'chartTop'}>
          {/*<div className={'avatar'}>{avatar}</div>*/}
          <div className={'metaWrap'}>
            <div className={'meta'}>
              <span className={'title'}>{title}</span>
              <span className={'action'}>{action}</span>
            </div>
            {renderTotal(total)}
          </div>
        </div>
        {children && (
          <div
            className={'content'}
            style={{
              height: contentHeight || 'auto',
            }}
          >
            <div className={contentHeight && 'contentFixed'}>{children}</div>
          </div>
        )}
        {footer && (
          <div className={'footer'}>
            {footer}
          </div>
        )}
      </div>
    );
  };

  render() {
    const {
      wrapperClassname,
      loading = false,
      contentHeight,
      title,
      avatar,
      action,
      total,
      footer,
      children,
      ...rest
    } = this.props;
    return (
      <Card
        loading={loading}
        bodyStyle={{
          padding: '20px 24px 8px 24px',
        }}
        {...rest}
      >
        {this.renderContent()}
      </Card>
    );
  }
}

export default ChartCard;
