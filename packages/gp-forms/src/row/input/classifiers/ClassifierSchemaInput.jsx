import React, { PropTypes } from 'react';
import get from 'lodash/get';
import Select from 'react-select';
import { autobind } from 'core-decorators';
import {
  RecordService,
} from '@gostgroup/gp-api-services/lib/services';
import Button from 'react-bootstrap/lib/Button';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import SchemaEditorModal from './SchemaEditorModal';
import { mergeSchema, unmergeSchema } from './helpers';

function getActionString(parent, readOnly) {
  if (readOnly) {
    return 'Просмотреть';
  }
  if (parent) {
    return 'Редактировать';
  }
  return 'Редактировать';
}

@withModal
@autobind
export default class ClassifierSchemaInput extends React.Component {

  static propTypes = {
    data: PropTypes.any,
    onDataChange: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    references: PropTypes.shape({}),
    modalIsOpen: PropTypes.bool,
    closeModal: PropTypes.func,
    openModal: PropTypes.func,
    element: PropTypes.object,
    queryReferencesForEdit: PropTypes.func,
    queryReferencesForView: PropTypes.func,
    readOnly: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      // сюда помещаются последние найденные результаты
      reference: [],
      references: [],
      options: [],
      referenceData: null,
      isLoading: false,
      parent: null,
      parentSchema: null,
    };
  }

  componentDidMount() {
    const { data, readOnly } = this.props;
    if (readOnly) {
      const parentId = get(data, 'extends');
      if (parentId && Number(parentId)) {
        this.loadParent(Number(parentId));
      }
    } else {
      this.loadReferenceData();
    }
  }

  loadReferenceData() {
    const { data = '', element, queryReferencesForEdit } = this.props;
    // const key = config.config.key;
    const absolutPath = element.element.absolutPath || element.absolutPath;

    queryReferencesForEdit(absolutPath, absolutPath, undefined, data).then((referenceData) => {
      const options = referenceData.map(r => ({ id: r.id, ...r.version })).map(({ id, title }) => ({ value: id, label: title }));
      this.setState({ options });
    });
  }

  loadParent(parentId) {
    const { element, queryReferencesForView } = this.props;
    const absolutPath = element.element.absolutPath || element.absolutPath;

    queryReferencesForView(absolutPath, absolutPath, undefined, parentId).then((referenceData) => {
      const options = referenceData.map(({ id, title }) => ({ value: id, label: title }));
      this.setState({ options });
      this.handleParentChange(parentId);
    });
  }

  handleChange(value) {
    let finalValue = value;
    if (this.props.onDataChange) {
      if (this.state.parent) {
        finalValue = Object.assign({}, unmergeSchema(value, this.state.parentSchema), {
          extends: this.state.parent,
        });
      }
      this.props.onDataChange(finalValue);
      this.props.closeModal();
    }
  }

  handleParentChange(value) {
    this.setState({ parent: value });
    const { config, element } = this.props;
    const absolutPath = element.element.absolutPath || element.absolutPath;

    RecordService.path(absolutPath, value).get().then((parentData) => {
      const schema = get(parentData, `version.object.${config.id}`);
      this.setState({ parentSchema: schema });
    });
  }

  render() {
    const { element, readOnly, data } = this.props;
    const { parent, parentSchema, isLoading } = this.state;
    const schema = mergeSchema(data, parentSchema);

    const actionString = getActionString(parent, readOnly);

    return (
      <div>
        <div style={{ height: 50 }}>
          <Select
            className="Ref-Select"
            options={this.state.options}
            isLoading={isLoading}
            value={parent}
            onChange={this.handleParentChange}
            placeholder={'Выберите схему для расширения'}
            noResultsText={'Ничего не найдено'}
            searchPromptText={'Введите строку для поиска'}
            searchingText={'Поиск'}
            clearValueText={'Очистить'}
            disabled={readOnly || isLoading}
          />
        </div>
        <div>
          <Button onClick={this.props.openModal}>{actionString} схему классификатора</Button>
        </div>
        <SchemaEditorModal
          isOpen={this.props.modalIsOpen}
          onClose={this.props.closeModal}
          onSubmit={this.handleChange}
          schema={schema}
          element={element}
          readOnly={readOnly}
        />
      </div>
    );
  }
}
