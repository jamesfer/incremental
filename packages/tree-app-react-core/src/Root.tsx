import * as React from 'react';
import { FC, memo } from 'react';
import { State } from './state';
import { StoreProvider } from './StateProvider';
import Tree from './Tree';

export interface RootProps {
  initialState: State;
  reducer: (state: State, action: any) => State;
  dispatchCallback?(dispatch: (action: any) => void): void;
}

const Root: FC<RootProps> = memo((props) => {
  return (
    <StoreProvider {...props}>
      <Tree id="1" />
    </StoreProvider>
  );
});

export default Root;
