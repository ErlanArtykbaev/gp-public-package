import React, { PropTypes, Component } from 'react';

export default class ActionComponent extends Component {

  static propTypes = {
    rowData: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    metadata: PropTypes.shape({
      onRemoveClick: PropTypes.func,
      editElement: PropTypes.func,
      runElement: PropTypes.func,
      showElementLog: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);

    this.runElement = this.runElement.bind(this);
    this.editElement = this.editElement.bind(this);
    this.removeElement = this.removeElement.bind(this);
    this.showElementLog = this.showElementLog.bind(this);

    this.state = {
      loading: false,
      processes: [],
    };
  }

  runElement() {
    const { id, name } = this.props.rowData;

    this.props.metadata.runElement(id, name);
  }

  editElement() {
    const { id } = this.props.rowData;

    this.props.metadata.editElement(id);
  }

  removeElement() {
    const { id, name } = this.props.rowData;

    this.props.metadata.onRemoveClick(id, name);
  }

  showElementLog() {
    const { id } = this.props.rowData;

    this.props.metadata.showElementLog(id);
  }

  render() {
    return (
      <div>
        <button type="button" title="Запустить" style={{ marginLeft: -26 }} onClick={this.runElement}><i className="fa fa-power-off aui-green" /></button>
        <button type="button" title="Изменить" onClick={this.editElement}><i className="fa fa-pencil aui-blue" /></button>
        <button type="button" title="Удалить" onClick={this.removeElement}><i className="fa fa-times aui-red" /></button>
        <button type="button" title="Показать журнал" onClick={this.showElementLog}><i className="fa fa-info" /></button>
      </div>
    );
  }

}
