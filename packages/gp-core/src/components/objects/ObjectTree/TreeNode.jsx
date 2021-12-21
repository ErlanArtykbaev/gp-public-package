import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import cx from 'classnames';
import getRouteNameByType from '@gostgroup/gp-utils/lib/getRouteNameByType';
import ItemNode from '../ItemNode';

const getCurrentAbsolutePath = () =>
  window.location.hash
    .replace('#', '')
    .replace('/groups/', '')
    .replace('/elements/', '')
    .replace('/items/', '');

const LEVEL_OFFSET = 10;

class GroupNode extends Component {

  static defaultProps = {
    isRoot: false,
    level: 0,
  }

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.state = {
      isCollapsed: true,
    };
  }

  onClick(e) {
    e.preventDefault();
    if (!this.props.isCollapsed) return;
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  renderChildren(items, level, isCollapsed) {
    return (
      <div>
        {(items || []).map(item => (
          <TreeNode
            key={item.key}
            item={item}
            level={level}
            isCollapsed={isCollapsed}
            onClick={this.props.onClick}
          />
        ))}
      </div>
    );
  }

  render() {
    const { item } = this.props;
    const props = this.props;
    const isRoot = this.props.root;
    const level = this.props.level;
    const isCollapsed = this.state.isCollapsed && props.isCollapsed;

    // NOTE если в ObjectTree отправлена функция onClick, мы перестаем использовать
    // ObjectTree для перехода по ссылкам и вызываем эту функцию
    const manualClick = typeof this.props.onClick === 'function';

    const paddingLeft = LEVEL_OFFSET * level;
    const classes = cx({
      'gost-tree-node': true,
      'gost-tree-node-group': true,
      'gost-tree-node-selected': getCurrentAbsolutePath() === item.absolutPath,
    });

    return (
      <div>
        {!isRoot && (
          <div style={{ paddingLeft }} className={classes}>
            <i
              onClick={this.onClick}
              className={`fa fa-angle-${isCollapsed ? 'right' : 'down'} gost-tree-icon`}
            />
            {manualClick
              ? <a style={{ cursor: 'pointer' }} onClick={this.onClick}>{item.shortTitle}</a>
              : <Link to={`/${getRouteNameByType(item.type)}s/${item.absolutPath}`}>{item.shortTitle}</Link>
            }
          </div>
        )}
        {(isRoot || !isCollapsed) &&
          this.renderChildren(item.children, level + 1, props.isCollapsed)
        }
      </div>
    );
  }

}

GroupNode.propTypes = {
  onClick: PropTypes.func,
  item: PropTypes.shape({}),
  root: PropTypes.bool,
  level: PropTypes.number,
  isCollapsed: PropTypes.bool,
};


const TreeNode = (props) => {
  const { item } = props;

  if (item.type === 'group') {
    return <GroupNode {...props} />;
  }
  console.log(item.type);
  return <ItemNode {...props} />;
};

TreeNode.propTypes = {
  item: PropTypes.object.isRequired,
};

export default TreeNode;
