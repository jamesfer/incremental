import { useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { State } from './state';
import { StoreContext } from './StateProvider';

export function useSelector<T>(selector: (state: State) => T): T {
  const [, forceUpdate] = useReducer(x => !x, true);
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('Missing StoreContext');
  }

  const selectedState = selector(store.getState());
  const currentStateRef = useRef(selectedState);
  currentStateRef.current = selectedState;

  // Compares the new selected state against the previous and updates the component if needed
  const checkForUpdates = useCallback(
    () => {
      // Reselect the state and see if it changed
      const newState = selector(store.getState());
      if (newState !== currentStateRef.current) {
        forceUpdate(null);
      }
    },
    [store, selector, forceUpdate],
  );

  // Subscribe to the store for updates
  useEffect(
    () => store.subscribe(checkForUpdates),
    [store, checkForUpdates],
  );

  return currentStateRef.current;
}
