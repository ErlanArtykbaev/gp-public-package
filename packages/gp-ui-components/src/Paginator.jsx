import React from 'react';

export default class Paginator extends React.Component {

  constructor(props) {
    super(props);
    this.first = this.first.bind(this);
    this.previous = this.previous.bind(this);
    this.next = this.next.bind(this);
    this.last = this.last.bind(this);
  }

  setPage(i) {
    return (e) => {
      e.preventDefault();
      this.props.setPage(i);
    };
  }

  first(e) {
    e.preventDefault();
    this.props.setPage(0);
  }

  previous(e) {
    e.preventDefault();
    this.props.setPage(this.props.currentPage - 1);
  }

  next(e) {
    e.preventDefault();
    this.props.setPage(this.props.currentPage + 1);
  }

  last(e) {
    e.preventDefault();
    this.props.setPage(this.props.maxPage - 1);
  }

  render() {
    const { currentPage, maxPage } = this.props;

    if (maxPage === 1 || maxPage === 0) {
      return null;
    }

    let startIndex = Math.max(currentPage - 5, 0);
    const endIndex = Math.min(startIndex + 11, maxPage);

    if (maxPage >= 11 && (endIndex - startIndex) <= 10) {
      startIndex = endIndex - 11;
    }

    const options = [];

    if (currentPage && maxPage >= 3 && currentPage !== 0 && currentPage !== 1) {
      options.push(
        <li className="aui-nav-first" key="first">
          <a href="#" onClick={this.first}>Первая</a>
        </li>
      );
    }

    if (currentPage > 0) {
      options.push(
        <li className="aui-nav-previous" key="prev">
          <a href="#" onClick={this.previous}>Пред</a>
        </li>
      );
    }

    for (let i = startIndex; i < endIndex; i++) {
      const isSelected = currentPage === i;

      if (isSelected) {
        options.push(
          <li className="aui-nav-selected" key={i}>{i + 1}</li>
        );
      } else {
        options.push(
          <li key={i}>
            <a href="#" onClick={this.setPage(i)}>{i + 1}</a>
          </li>
        );
      }
    }

    if (currentPage < maxPage - 1) {
      options.push(
        <li className="aui-nav-previous" key="next">
          <a href="#" onClick={this.next}>След</a>
        </li>
      );
    }

    if (maxPage >= 3 && currentPage !== maxPage - 1 && currentPage !== maxPage - 2) {
      options.push(
        <li className="aui-nav-last" key="last">
          <a href="#" onClick={this.last}>Последняя</a>
        </li>
      );
    }

    return (
      <ol className="aui-nav aui-nav-pagination">
        {options}
      </ol>
    );
  }

}
