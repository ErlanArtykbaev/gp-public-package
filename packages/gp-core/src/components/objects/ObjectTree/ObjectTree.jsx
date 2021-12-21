import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import assign from 'lodash/assign';

import SearchField from '@gostgroup/gp-ui-components/lib/SearchField';
import TreeNode from './TreeNode';

function groupShouldBeVisible(group, searchText, filter = () => true) {
  return filter(group);
}

function itemShouldBeVisible(item, searchText, filter = () => true) {
  return item.shortTitle.toLowerCase().indexOf(searchText) !== -1 && filter(item);
}

function nodeShouldBeVisible(node, searchText, filter = () => true) {
  if (node.type === 'group') {
    return groupShouldBeVisible(node, searchText, filter);
  }
  return itemShouldBeVisible(node, searchText, filter);
}

function filterTree(tree, searchText, filter = () => true) {
  const children = (tree.children || [])
    .filter(item => nodeShouldBeVisible(item, searchText, filter))
    .map(item => (
      item.type !== 'group'
        ? { ...item, hasSelection: !!searchText.length }
        : filterTree(item, searchText, filter)
    ));
  return assign({}, tree, { children });
}


class ObjectTree extends Component {

  static propTypes = {
    onClick: PropTypes.func,
    title: PropTypes.string,
    searchable: PropTypes.bool,
    filter: PropTypes.func,
    objectsTree: PropTypes.shape({}),
  }

  static defaultProps = {
    searchable: true,
    hideEmptyGroups: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
    };
  }

  render() {
    const { objectsTree = {}, onClick, filter, title } = this.props;
    const searchText = this.state.searchText.toLowerCase();
    const filteredTree = filterTree(objectsTree, searchText.trim(), filter);
    const isCollapsed = searchText.length === 0;

    return (
      <div>
        {this.props.searchable && (
          <SearchField
            searchText={searchText}
            onChange={t => this.setState({ searchText: t })}
          />
        )}

        <h3 className="tree-title">{title}</h3>

        <TreeNode
          item={filteredTree}
          root
          isCollapsed={isCollapsed}
          onClick={onClick}
        />
      </div>
    );
  }

}

export default connect(state => state.core.objects)(ObjectTree);
