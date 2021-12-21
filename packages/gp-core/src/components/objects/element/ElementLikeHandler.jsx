import React, { PropTypes, Component } from 'react';
import { withRouter } from 'react-router';
import { autobind } from 'core-decorators';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';
import Element from './Element';
import Breadcrumbs from '../common/Breadcrumbs';

@withRouter
@autobind
class ElementHandler extends Component {

  static propTypes = {
    element: PropTypes.object,
    router: PropTypes.shape({}),
    params: PropTypes.shape({}),
    actions: PropTypes.shape({
      getCurrentElement: PropTypes.func,
    }),
    path: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    elementProps: PropTypes.shape({}),
    ElementComponent: PropTypes.func,
  }

  componentDidMount() {
    this.props.actions.getCurrentElement();
  }

  componentWillReceiveProps(nextProps) {
    const props = this.props;
    const elementHasChanged = nextProps.params.splat !== props.params.splat;
    const dateHasChanged = nextProps.location.query.date !== props.location.query.date;
    if (elementHasChanged || dateHasChanged) {
      props.actions.changeElement();
    }
  }

  render() {
    const { element, path, isFetching } = this.props;
    const ElementComponent = this.props.ElementComponent || Element;

    return (
      <div className="element">
        <Breadcrumbs path={path} />
        {isFetching && <Preloader />}
        {!!element && !isFetching &&
          <ElementComponent
            {...this.props}
            {...(this.props.elementProps)}
          />
        }
      </div>
    );
  }

}

export default ElementHandler;
