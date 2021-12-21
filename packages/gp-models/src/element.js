import Immutable from 'immutable';
import get from 'lodash/get';

export default function createElement(data) {
  const property = new Immutable.Map({});
  // const property = factory(existingPropertiesList);

  const extra = Immutable.fromJS({
    type: get(data, 'type', 'element'),
    processDefenitionId: get(data, 'processDefenitionId'),
    processDefenitionUsers: get(data, 'processDefenitionUsers', {}),
    assignedUserTasks: get(data, 'assignedUserTasks', {}),
    status: get(data, 'status', 'develop'),
    key: get(data, 'key', ''),
    shortTitle: get(data, 'shortTitle', ''),
    dateStart: get(data, 'dateStart'),
    dateEnd: get(data, 'dateEnd'),
    fullTitle: get(data, 'fullTitle', ''),
    config: get(data, 'config', {}),
  });

  return property.merge(extra).toJS();
}
