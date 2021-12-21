import React, { PropTypes } from 'react';

import { connect } from 'react-redux';

import { withRouter } from 'react-router';
import SimpleConfirmModal from '@gostgroup/gp-ui-components/lib/SimpleConfirmModal';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';
import isEqual from 'lodash/isEqual';
import { Network, DataSet } from 'vis';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import styles from './graph.scss';
import * as graphActions from '../redux/modules/graph';
import { getLoadingState } from '../redux/selectors/graph';

@connect(
  state => ({
    isLoading: getLoadingState(state, 'makeGetGraph', 'drawingProcess'),
    ...state.core.graph,
  }),
  graphActions,
)
@withRouter
export default class GraphHandler extends React.Component {

  static propTypes = {
    graph: PropTypes.shape({
      metas: PropTypes.shape({}),
      nodes: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    getAllGraph: PropTypes.func,
    getGraphById: PropTypes.func,
    initDrawingProcess: PropTypes.func,
    finishDrawingProcess: PropTypes.func,
    params: PropTypes.shape({}),
    isLoading: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      confirmModal: null,
    };
  }

  componentDidMount() {
    const { getAllGraph, getGraphById } = this.props;
    const { params } = this.props;
    const { splat = '' } = params;

    if (splat.length) {
      getGraphById(splat);
    } else {
      getAllGraph();
    }
  }

  componentWillReceiveProps(props) {
    const graphHasChanged = !isEqual(this.props.graph, props.graph);
    if (graphHasChanged && props.graph !== null) {
      this.createGraph(props.graph);
    }
  }

  onNetworkClick(params) {
    const nodeId = params.nodes[0];
    if (nodeId) {
      this.openModal(nodeId);
    }
  }

  openModal(refId) {
    const refInfo = this.props.graph.metas[refId];

    let outputLinks = refInfo.links.map((linkMeta, i) =>
      <p key={i}>{linkMeta.meta}</p>
    );
    if (refInfo.links.length === 0) {
      outputLinks = <p>Ссылок нет</p>;
    }
    // TODO переделать механизм, так передавать не варик
    this.setState({
      confirmModal: {
        content: (
          <span>
            <h3>{`Справочник «${refInfo.title}»`}</h3>
            <a href={`#/elements/${refInfo.path}`}>Перейти к справочнику</a>
            <br />
            <AuiButton link onClick={() => this.filterByElement(refId)}>
              Отфильтровать граф
            </AuiButton>
            <h4>Ссылки</h4>
            {outputLinks}
          </span>
        ),
        onAccept: () => {
          this.setState({ confirmModal: null });
        },
      },
    });
  }

  resetFilter = () => {
    const { getAllGraph } = this.props;
    this.setState({ confirmModal: null });
    getAllGraph();
    window.location = '/#/graph';
  }

  filterByElement(refId) {
    const { getGraphById } = this.props;
    this.setState({ confirmModal: null });
    getGraphById(refId);
    window.location = `/#/graph/${refId}`;
  }

  createGraph(graph) {
    this.props.initDrawingProcess();

    graph.nodes.forEach((node) => {
      node.shape = 'box';
    });
    graph.edges.forEach((node) => {
      node.length = 250;
    });
    const nodes = new DataSet(graph.nodes);
    const edges = new DataSet(graph.edges);
    const container = document.getElementById('ref-graph');
    const data = {
      nodes,
      edges,
    };
    const options = {
      layout: {
        improvedLayout: false,
      },
    };
    const network = new Network(container, data, options);
    network.on('click', this.onNetworkClick.bind(this));
    network.on('afterDrawing', this.afterDrawing.bind(this));
  }

  afterDrawing() {
    const { isLoading } = this.props;
    if (isLoading) {
      this.props.finishDrawingProcess();
    }
  }

  render() {
    const { params, graph, isLoading } = this.props;
    const { splat = '' } = params;
    let refName = '';
    if (splat.length && graph) {
      if (graph.metas[splat]) {
        refName = `, отфильтрованная по справочнику «${graph.metas[splat].title}»`;
      }
    }
    return (
      <div className={styles.container}>
        {isLoading && <Preloader faded />}
        <div>
          <h1>{`Визуализация связей справочников НСИ${refName}`}</h1>
          {refName.length > 0 ?
            <AuiButton onClick={this.resetFilter}>Сбросить фильтр</AuiButton>
          : null}
          <div id="ref-graph" className={styles.graph} />
          <SimpleConfirmModal
            isOpen={!!this.state.confirmModal}
            infoOnly
            {...this.state.confirmModal}
          />
        </div>
      </div>
    );
  }

}
