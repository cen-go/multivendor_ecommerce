import { useEffect, useState } from "react";

// store: A function that takes a callback as an argument and
// calls it with the state of the store. The callback must return
// a value that will be the state to be retrieved from the store.
// This function acts as an interface to access the state of the store in the component.

// storeCallback: A function that takes the state of the store
// as an argument and returns the specific value to be retrieved from the state.
// This callback is responsible for extracting the desired value
// from the state of the store.

export default function useFromStore<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  storeCallback: (state: T) => F,
) {
  const [state, setState] = useState<F>();

  const stateOfStore = store(storeCallback) as F;

  useEffect(() => {
    setState(stateOfStore);
  }, [stateOfStore]);

  return state;
}
