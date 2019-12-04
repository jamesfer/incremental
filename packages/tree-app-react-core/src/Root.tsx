import * as React from 'react';
import { FC, useReducer, useEffect } from 'react';
import { State, StateContext } from './state';
import Tree from './Tree';

export interface RootProps {
  initialState: State;
  reducer: (state: State, action: any) => State;
  dispatchCallback?(dispatch: (action: any) => void): void;
}

const Root: FC<RootProps> = ({ initialState, reducer, dispatchCallback }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(
    () => {
      if (dispatchCallback) {
        dispatchCallback(dispatch);
      }
    },
    [dispatchCallback, dispatch],
  );

  return (
    <StateContext.Provider value={state}>
      <Tree id="1" />
    </StateContext.Provider>
  );
};

export default Root;
