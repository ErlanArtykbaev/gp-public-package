import React, { PropTypes } from 'react';
import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';
import { autobind } from 'core-decorators';

// TODO move to utils
function getOffset(elem) {
  function getWindow(elem) {
    function isWindow(obj) {
      const toString = Object.prototype.toString.call(obj);
      return toString === '[object global]' || toString === '[object Window]' || toString === '[object DOMWindow]';
    }
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }

  if (!elem) {
    return null;
  }

  const rect = elem.getBoundingClientRect();

    // Make sure element is not hidden (display: none) or disconnected
  if (rect.width || rect.height || elem.getClientRects().length) {
    const doc = elem.ownerDocument;
    const win = getWindow(doc);
    const docElem = doc.documentElement;

    return {
      top: (rect.top + win.pageYOffset) - docElem.clientTop,
      left: (rect.left + win.pageXOffset) - docElem.clientLeft,
    };
  }

  return null;
}

export default class ContextMenuContainer extends React.Component {

  static contextTypes = {
    container: React.PropTypes.object.isRequired,
  }

  static propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    actions: PropTypes.arrayOf(PropTypes.shape({})),
  }

  static defaultProps = {
    actions: [],
  }

  state = {
    contextMenuVisible: false,
    x: 0,
    y: 0,
  };

  componentDidMount() {
    document.addEventListener('click', this.hideContextMenu);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.hideContextMenu);
  }

  @autobind
  onClick(e) {
    e.preventDefault();

    if (this.state.contextMenuVisible) return;

    const x = e.pageX - getOffset(this.node).left;
    const y = e.pageY - getOffset(this.node).top;

    this.setState({ x, y, contextMenuVisible: true });
  }

  @autobind
  hideContextMenu() {
    this.setState({ contextMenuVisible: false });
  }

  render() {
    const menuStyle = {
      width: 0,
      height: 0,
      position: 'absolute',
      top: this.state.y,
      left: this.state.x,
    };
    const dropdownStyle = {
      textShadow: 'none',
      display: this.state.contextMenuVisible ? 'block' : 'none',
    };
    const doAndClose = action => () => {
      this.hideContextMenu();
      action.handler();
    };

    return (<div
      ref={node => (this.node = node)}
      className={this.props.className}
      onClick={this.props.onClick}
      onContextMenu={this.onClick}
    >
      {this.props.children}
      <div style={menuStyle}>
        <ul className="dropdown-menu" style={dropdownStyle}>
          {this.props.actions.map(action => (
            <li key={action.key}>
              <ButtonLink onClick={doAndClose(action)}>
                {action.icon} {action.title}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </div>
    </div>);
  }
}
