import React, { PropTypes } from 'react';
// import AuiButton from './buttons/AuiButton';
import styles from './searchField.scss';

export default class SearchField extends React.Component {

  static propTypes = {
    searchText: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    placeholder: PropTypes.string,
    withButton: PropTypes.bool,
  }

  static defaultProps = {
    placeholder: 'Поиск',
  }

  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmit();
  }

  onChange(e) {
    const value = e.target.value;
    this.props.onChange(value);
  }

  render() {
    const { searchText, placeholder,
      // withButton,
    } = this.props;

    return (
      <form className={styles.searchField} onSubmit={this.onSubmit}>
        <div className={styles.container}>
          <input
            className={styles.input}
            type="text"
            placeholder={placeholder}
            value={searchText}
            onChange={this.onChange}
          />
          <i className={styles.icon} />
        </div>
        {/* {withButton && <AuiButton type="button" onClick={this.onSubmit}>Найти</AuiButton>} */}
      </form>
    );
  }

}
