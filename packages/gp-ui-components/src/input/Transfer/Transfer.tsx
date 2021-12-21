import * as React from 'react';
import cx from 'classnames';
import {
  Button,
} from 'react-bootstrap';
import { sortBy } from 'lodash';

import Preloader from '../../Preloader';
import TransferItem from './TransferItem';
import {
  differenceFilter,
  intersectionFilter,
} from './utils';
import {
  TTransferProps,
  TTransferState,
  ListItem,
} from './types.d';

const styles = require('./Transfer.scss');

class Transfer extends React.Component<TTransferProps, TTransferState> {
  state: TTransferState = {
    sourceList: [],
    destinationList: [],
    selectedSourceListIndexes: [],
    selectedDestinationListIndexes: [],
  };
  cachedSourceList: ListItem[]  = null;
  sourceListNode: HTMLSelectElement = null;
  destinationListNode: HTMLSelectElement = null;
  selectItemClickCouter: number = 0;

  static defaultProps = ({
    selectItemTitleKey: 'title',
    readOnly: false,
    sorted: false,
  });

  componentDidMount() {
    this.setSourceList(this.props);
  }
  componentWillReceiveProps(nextProps: TTransferProps) {
    if (this.cachedSourceList !== nextProps.sourceList && this.cachedSourceList !== null) {
      this.setSourceList(nextProps);
    }
  }
  setSourceList(props) {
    this.cachedSourceList = props.sourceList || [];

    this.setState({
      sourceList: props.sourceList,

      destinationList: [],
      selectedSourceListIndexes: [],
      selectedDestinationListIndexes: [],
    });
    this.disableSelectNodeItems('sourceListNode');
    this.disableSelectNodeItems('destinationListNode');
  }
  handleListSelect = (selectedListKey, { target: { selectedOptions } }) => {
    if (selectedOptions.length === 0) {
      this.setState({
        [selectedListKey]: [],
      });

      return;
    }

    const selectedItemIndexes = [];

    for (let i = 0; i < selectedOptions.length; ++i) {
      selectedItemIndexes.push(parseInt(selectedOptions[i].value, 10));
    }

    this.setState({
      [selectedListKey]: selectedItemIndexes,
    });
  }
  handleSingleItemMove = (srcKey?, dstKey?, selectedKey?) => {
    if (this.state[selectedKey].length === 0) {
      return;
    }

    this.setState((state) => {
      this.disableSelectNodeItems(`${srcKey}Node`);

      const sourceList = differenceFilter(state[srcKey], state[selectedKey]);
      const destinationList = [...state[dstKey], ...intersectionFilter(state[srcKey], state[selectedKey])];

      if (dstKey === 'destinationList') {
        this.props.onChange(destinationList);
      }

      if (dstKey === 'sourceList') {
        this.props.onChange(sourceList);
      }

      return {
        [srcKey]: sourceList,
        [dstKey]: destinationList,
        [selectedKey]: [],
      };
    });
  }
  handleAllItemsMove = (srcKey?, dstKey?, selectedKey?) => {
    if (this.state[srcKey].length === 0) {
      return;
    }

    this.setState((state) => {
      this.disableSelectNodeItems(`${srcKey}Node`);

      const sourceList = [];
      const destinationList = [...state[dstKey], ...state[srcKey]];

      if (dstKey === 'destinationList') {
        this.props.onChange(destinationList);
      }

      if (dstKey === 'sourceList') {
        this.props.onChange(sourceList);
      }

      return {
        [srcKey]: sourceList,
        [dstKey]: destinationList,
      };
    });
  }
  extractRef = (nodeKey, node) => {
    this[nodeKey] = node;
  }
  /**
   * ⚠️ Мутируем DOM по-взрослому. ⚠️
   * Если так не сделать, то дефолтное поведение выбранного элемента select работает не так как нужно.
   * Выбираю элемент, потом перемещаю его в другой список и выделение в исходном списке ставится на первый оставшийся элемент.
   * И получается что элемент выделен, но не щелчком, и поэтому индекс выделенного элемента не попадёт в стейт, как после клика.
   * И в итоге единичное перемещение не произойдёт.
   */
  disableSelectNodeItems(nodeKey) {
    try {
      this[nodeKey].selectedIndex = -1;
    } catch (error) {
      console.log('Transfer widget error:', error);
    }
  }
  handleDoubleClick(callback, delay = 200) {
    this.selectItemClickCouter++;

    setTimeout(() => {
      if (this.selectItemClickCouter > 1) {
        this.selectItemClickCouter = 0;
        callback();
      } else {
        this.selectItemClickCouter = 0;
      }
    }, delay);
  }
  handleSelectItemClick = (itemId, listMoveParameters) => {
    this.handleDoubleClick(() => {
      this.handleSingleItemMove(...listMoveParameters);
    });
  }
  renderItems(list = [], listMoveParameters) {
    const items = list.map((item, i) => (
      <TransferItem
        data={item}
        titleKey={this.props.selectItemTitleKey}
        index={i}
        key={i}
        onClick={() => this.handleSelectItemClick(item.id, listMoveParameters)}
      />
    ));

    return items;
  }
  render() {
    const {
      sourceListHeaderComponent = null,
      destinationListHeaderComponent = null,
      isSourceListLoading,
      readOnly = false,
      sorted,
    } = this.props;

    const sourceList = sorted ? sortBy(this.state.sourceList, [this.props.selectItemTitleKey]) : this.state.sourceList;
    const destinationList = sorted ? sortBy(this.state.destinationList, [this.props.selectItemTitleKey]) : this.state.destinationList;

    const sourceListMoveParameters = ['sourceList', 'destinationList', 'selectedSourceListIndexes'];
    const destinationListMoveParameters = ['destinationList', 'sourceList', 'selectedDestinationListIndexes'];

    const sourceListOptions = this.renderItems(sourceList, sourceListMoveParameters);
    const destinationListOptions = this.renderItems(destinationList, destinationListMoveParameters);

    const selectDisabledClassname = {
      [styles.notAllowed]: readOnly,
    };

    return (
      <div className={cx('', styles.wrapper)}>
        <div className={cx('', styles.listWrapper, styles.sourceListWrapper)}>
          <div className={cx('', styles.listHeader)}>{sourceListHeaderComponent}</div>
          <div className={cx('', selectDisabledClassname, styles.listLoaderWrapper)}>
            <select
              disabled={readOnly}
              ref={node => this.extractRef('sourceListNode', node)}
              className={cx('', styles.sourceListSelect)}
              onChange={e => this.handleListSelect('selectedSourceListIndexes', e)}
              multiple
            >
              {sourceListOptions}
            </select>
            {isSourceListLoading && <Preloader faded />}
          </div>
        </div>
        <div className={cx('', styles.listControls)}>
          <Button
            disabled={readOnly}
            onClick={() => this.handleSingleItemMove(...sourceListMoveParameters)}
          >{'>'}</Button>
          <Button
            disabled={readOnly}
            onClick={() => this.handleSingleItemMove(...destinationListMoveParameters)}
          >{'<'}</Button>
          <Button
            disabled={readOnly}
            onClick={() => this.handleAllItemsMove(...sourceListMoveParameters)}
          >{'>>'}</Button>
          <Button
            disabled={readOnly}
            onClick={() => this.handleAllItemsMove(...destinationListMoveParameters)}
          >{'<<'}</Button>
        </div>
        <div className={cx('', styles.listWrapper, styles.destinationListWrapper)}>
          <div className={cx('', styles.listHeader)}>{destinationListHeaderComponent}</div>
          <div className={cx('', selectDisabledClassname, styles.listLoaderWrapper)}>
            <select
              disabled={readOnly}
              ref={node => this.extractRef('destinationListNode', node)}
              className={cx('', styles.destinationListSelect)}
              onChange={e => this.handleListSelect('selectedDestinationListIndexes', e)}
              multiple
            >
              {destinationListOptions}
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default Transfer;
