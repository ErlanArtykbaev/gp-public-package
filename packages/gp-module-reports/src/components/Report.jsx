import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';

export default class BaseReport extends Component {

  static propTypes = {
    reports: PropTypes.arrayOf(
      PropTypes.shape({})
    ),
    getReports: PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      reports: props.reports,
    };
  }

  componentDidMount() {
    const dateStart = createValidDate(moment());
    const dateEnd = createValidDate(moment());
    this.props.getReports({ dateStart, dateEnd });
  }

  componentWillReceiveProps(props) {
    this.setState({
      reports: props.reports,
    });
  }

  render() {
    return <div />;
  }


}
