import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { StepCount } from './form-steps';

type NextFormStepHandler = () => Promise<void>;
const nextFormStepHandlersAtom = atom<Map<StepCount, NextFormStepHandler>>(
  new Map()
);

export function useNextFormStepHandler(currentStepCount: StepCount) {
  const [nextFormStepHandlers, setNextFormStepHandlers] = useAtom(
    nextFormStepHandlersAtom
  );

  const nextFormStepHandler = nextFormStepHandlers.get(currentStepCount);
  const setNextFormStepHandler = (handler: NextFormStepHandler) => {
    nextFormStepHandlers.set(currentStepCount, handler);

    setNextFormStepHandlers(nextFormStepHandlers);
  };
  const removeNextFormStepHandler = () => {
    nextFormStepHandlers.delete(currentStepCount);

    setNextFormStepHandlers(nextFormStepHandlers);
  };
  return {
    nextFormStepHandler,
    setNextFormStepHandler,
    removeNextFormStepHandler,
  };
}

export function useSetNextFormStepHandler(
  stepCount: StepCount,
  handler: NextFormStepHandler
) {
  const { setNextFormStepHandler, removeNextFormStepHandler } =
    useNextFormStepHandler(stepCount);

  useEffect(() => {
    setNextFormStepHandler(handler);

    return () => removeNextFormStepHandler();
  }, []);
}
