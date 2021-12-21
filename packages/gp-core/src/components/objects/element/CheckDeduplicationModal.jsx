import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { getLoadingState } from 'gp-core/lib/redux/selectors/element';
import { checkDeduplication } from 'gp-core/lib/redux/modules/element';

import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import s from './CheckDeduplicationModal.scss';

@connect(
  state => ({
    isLoading: getLoadingState(state, 'checkDeduplication'),
    data: state.core.element.deduplicationResults,
  }),
  { checkDeduplication }
)
@wrappedForm
export default class CheckDeduplicationModal extends Component {

  static propTypes = {
    onClose: PropTypes.func,
    element: PropTypes.shape({}),
    isLoading: PropTypes.bool,
    checkDeduplication: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.shape({})),
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    const { element } = this.props;
    const { absolutPath } = element;
    this.props.checkDeduplication(absolutPath);
  }

  render() {
    const { data = [], isLoading } = this.props;

    return (
      <Modal
        {...this.props}
        saveButton
        saveButtonTitle="Закрыть"
        isLoading={isLoading}
        onSubmit={this.props.onClose}
        onClose={this.props.onClose}
      >
        <div className="form-group">
          <table className={s.table} >
            <tbody>
              <tr>
                <th>Запись 1</th>
                <th>Запись 2</th>
                <th>Результат</th>
              </tr>
              {
                data.map(item => (
                  <tr key={item.uuid1 + item.uuid2}>
                    <td><a href={`/#/records/${item.duplicationEntry.absolutPath}`}>{item.duplicationEntry.title}</a></td>
                    <td><a href={`/#/records/${item.duplicationEntry2.absolutPath}`}>{item.duplicationEntry2.title}</a></td>
                    <td><span style={{ width: '3em' }}><mark style={{ backgroundColor: item.status === 'YELLOW' ? 'yellow' : 'red' }}> {item.deduplicationResult}</mark></span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </Modal>
    );
  }
}
