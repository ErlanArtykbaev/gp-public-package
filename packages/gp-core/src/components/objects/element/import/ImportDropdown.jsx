import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import ImportModal from './ImportModal';

@withModal
@autobind
export default class ImportDropdown extends React.Component {

  static propTypes = {
    element: PropTypes.shape({
      element: PropTypes.shape({
        absolutPath: PropTypes.string,
      }),
    }),
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    modalIsOpen: PropTypes.bool,
  }

  handleImportSubmit(file) {
    const { closeModal } = this.props;
    FileAPI.upload({
      url: `rest/ref-import-raw/${this.props.element.element.absolutPath}`,
      files: { file: file.file },
      complete(err) {
        if (err) {
          global.NOTIFICATION_SYSTEM.notify('Информация', 'Ошибка формата файла. Файл должен быть с разделителем | и в кодировке windows-1251', 'error');
        } else {
          global.NOTIFICATION_SYSTEM.notify('Информация', 'Заявка отправлена на утверждение.', 'info');
          closeModal();
        }
      },
    });
  }

  render() {
    return (
      <div className="inline-block">
        <DropdownButton pullRight id="import-dropdown" className="sh-btn" title={'Импорт'}>
          <MenuItem onClick={this.props.openModal}>Импорт данных CSV</MenuItem>
        </DropdownButton>

        <ImportModal
          isOpen={this.props.modalIsOpen}
          onClose={this.props.closeModal}
          onSubmit={this.handleImportSubmit}
        />
      </div>
    );
  }

}
