import React, { PropTypes, Component } from 'react';

export default class ActionSettingsComponent extends Component {

  static propTypes = {
    rowData: PropTypes.shape({}),
    metadata: PropTypes.shape({
      editElement: PropTypes.func,
      removeElement: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      processes: [],
    };
  }

  editElement() {
    this.props.metadata.editElement(this.props.rowData);
  }

  removeElement() {
    this.props.metadata.removeElement(this.props.rowData);
  }

  render() {
    return (
      <div>
        <button type="button" title="Изменить" onClick={() => this.editElement()}><i className="fa fa-pencil aui-blue" /></button>
        <button type="button" title="Удалить" onClick={() => this.removeElement()}><i className="fa fa-times aui-red" /></button>
      </div>
    );
  }
}
