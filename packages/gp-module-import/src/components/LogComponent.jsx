import React, { PropTypes, Component } from 'react';

export default class LogComponent extends Component {

  static propTypes = {
    rowData: PropTypes.shape({
      id: PropTypes.number,
      logtext: PropTypes.string,
    }),
    metadata: PropTypes.shape({
      showRowLog: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);

    this.showRowLog = this.showRowLog.bind(this);
  }

  showRowLog() {
    const { id, logtext } = this.props.rowData;

    this.props.metadata.showRowLog(id, logtext);
  }

  render() {
    return (
      <div>
        <a className="aui-blue pointer" title="Показать журнал" onClick={this.showRowLog}>Показать</a>
      </div>
    );
  }

}
