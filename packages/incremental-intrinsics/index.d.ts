declare namespace JSX {
  interface Reference<S> {
    path: (string | number)[];
  }

  export interface ComputedValue<S> {
    references: Reference<S>[];
    value: () => any;
  }

  interface InternalProps {
    key?: string;
  }

  interface StandardProps extends InternalProps {
    id?: ComputedValue<any> | string;
    onclick?: ComputedValue<any> | ((event: any) => void);
  }

  interface InputProps extends StandardProps {
    placeholder?: ComputedValue<any> | string;
    oninput?: ComputedValue<any> | ((event: any) => void);
    value?: ComputedValue<any> | string;
  }

  interface IntrinsicElements {
    div: StandardProps;
    ul: StandardProps;
    ol: StandardProps;
    li: StandardProps;
    strong: StandardProps;
    h1: StandardProps;
    h2: StandardProps;
    h3: StandardProps;
    p: StandardProps;
    input: InputProps;
    button: StandardProps;
  }
}
