import { compose, withHandlers } from 'recompose';

/**
 * Dispatch event with eventKey on callee function call
 * @param  {String} callee   name of a function that is passed as a prop
 * @param  {String} eventKey key of an event to dispatch
 * @example
 * callWithEvent('toggle', 'resize')(Component)
 * @return {HOC}
 */
export default (callee, eventKey) => compose(
  withHandlers({
    [callee]: props => (...args) => {
      const functionToCall = props[callee];
      setTimeout(() => window.dispatchEvent(new Event(eventKey)), 10);
      functionToCall(...args);
    },
  })
);
