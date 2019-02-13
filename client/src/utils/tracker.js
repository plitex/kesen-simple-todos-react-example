import { track } from 'kesen';

export function getTrackerLoader(reactiveMapper, client) {
  return (props, onData, env) => {
    let trackerCleanup = null;
    const dispose = track(subscribe => {
      // assign the custom clean-up function.
      trackerCleanup = reactiveMapper(subscribe, props, onData, env);
    }, client);

    return () => {
      if (typeof trackerCleanup === 'function') trackerCleanup();
      return dispose();
    };
  };
}
