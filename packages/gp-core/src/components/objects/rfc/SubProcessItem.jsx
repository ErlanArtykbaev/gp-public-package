import React from 'react';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import SubProcessHistoryLinkComponent from './SubProcessHistoryLinkComponent';

export default class SubProcessItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { subProcess } = this.props;

    return (
      <Div>
        <form className="aui top-label">
          <Div className="field-group top-label" hidden={typeof subProcess.processName === 'undefined'}>
            <label>Наимемнование процесса:</label>
            <span>{subProcess.processName}</span>
          </Div>
          <Div className="field-group top-label" hidden={typeof subProcess.currentTaskName === 'undefined'}>
            <label>Текущая задача:</label>
            <span>{subProcess.currentTaskName}</span>
          </Div>
          <Div className="field-group top-label" hidden={typeof subProcess.currentAssignement === 'undefined'}>
            <label>Ответственный за этап:</label>
            <span>{subProcess.currentAssignement}</span>
          </Div>
          <Div className="field-group top-label" hidden={typeof subProcess.startDate === 'undefined'}>
            <label>Дата начала:</label>
            <FormattedDate>{subProcess.startDate}</FormattedDate>
          </Div>
          <Div className="field-group top-label" hidden={typeof subProcess.endDate === 'undefined'}>
            <label>Дата завершения:</label>
            <FormattedDate>{subProcess.endDate}</FormattedDate>
          </Div>
          <Div className="field-group top-label" hidden={typeof subProcess.statusName === 'undefined'}>
            <label>Статус:</label>
            <span className={`aui-lozenge aui-lozenge-${subProcess.statusClass}`}>{subProcess.statusName}</span>
          </Div>
          <Div className="field-group top-label" hidden={typeof subProcess.id === 'undefined'}>
            <h4 className="link-hand-cursor">
              <SubProcessHistoryLinkComponent
                name="Посмотреть историю процесса"
                processId={subProcess.id}
              />
            </h4>
          </Div>
        </form>
        {this.props.children}
      </Div>
    );
  }
}
