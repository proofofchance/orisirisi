import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { StepCount } from './form-steps';

type GoToNextFormStepHandler = () => Promise<void>;
const goToNextFormStepHandlersAtom = atom<
  Map<StepCount, GoToNextFormStepHandler>
>(new Map());

export function useGoToNextFormStepHandler(currentStepCount: StepCount) {
  const [goToNextFormStepHandlers, setGoToNextFormStepHandlers] = useAtom(
    goToNextFormStepHandlersAtom
  );

  const goToNextFormStepHandler =
    goToNextFormStepHandlers.get(currentStepCount);
  const setGoToNextFormStepHandler = (handler: GoToNextFormStepHandler) => {
    goToNextFormStepHandlers.set(currentStepCount, handler);

    setGoToNextFormStepHandlers(goToNextFormStepHandlers);
  };
  const removeGoToNextFormStepHandler = () => {
    goToNextFormStepHandlers.delete(currentStepCount);

    setGoToNextFormStepHandlers(goToNextFormStepHandlers);
  };
  return {
    goToNextFormStepHandler,
    setGoToNextFormStepHandler,
    removeGoToNextFormStepHandler,
  };
}

export function useSetGoToNextFormStepHandler(
  stepCount: StepCount,
  handler: GoToNextFormStepHandler
) {
  const { setGoToNextFormStepHandler, removeGoToNextFormStepHandler } =
    useGoToNextFormStepHandler(stepCount);

  useEffect(() => {
    setGoToNextFormStepHandler(handler);

    return () => removeGoToNextFormStepHandler();
  }, []);
}
