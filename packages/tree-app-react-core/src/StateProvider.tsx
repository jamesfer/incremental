import {
  FC,
  default as React,
  useEffect,
  useReducer,
  useRef,
  useLayoutEffect,
  useMemo, createContext,
} from 'react';
import { State } from './state';

export interface StateProviderProps  {
  initialState: State;
  reducer: (state: State, action: any) => State;
  dispatchCallback?(dispatch: (action: any) => void): void;
}

export interface Store<T> {
  dispatch: (action: any) => void;
  subscribe: (callback: () => void) => () => void;
  getState: () => T;
}

export const StoreContext = createContext<Store<State> | undefined>(undefined);

export const StoreProvider: FC<StateProviderProps> = ({ children, initialState, reducer, dispatchCallback }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Pass the dispatch function to the parent
  useEffect(
    () => {
      if (dispatchCallback) {
        dispatchCallback(dispatch);
      }
    },
    [dispatchCallback, dispatch],
  );

  const subscribersRef = useRef<(() => void)[]>([]);
  useLayoutEffect(() => {
    subscribersRef.current.forEach(sub => sub());
  }, [state]);

  const stateRef = useRef<State>();
  stateRef.current = state;

  const store = useMemo<Store<State>>(
    () => ({
      dispatch,
      subscribe: (callback: () => void) => {
        subscribersRef.current.push(callback);
        return () => {
          subscribersRef.current = subscribersRef.current.filter(sub => sub !== callback);
        };
      },
      getState: () => stateRef.current!,
    }),
    [],
  );

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};
