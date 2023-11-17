import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { StepCount } from './form-steps';

type SubmitNextFormStepHandler = () => Promise<void>;
const submitFormStepHandlersAtom = atom<
  Map<StepCount, SubmitNextFormStepHandler>
>(new Map());

export function useSubmitFormStepHandler(currentStepCount: StepCount) {
  const [submitFormStepHandlers, setSubmitFormStepHandlers] = useAtom(
    submitFormStepHandlersAtom
  );

  const submitFormStepHandler = submitFormStepHandlers.get(currentStepCount);
  const setSubmitFormStepHandler = (handler: SubmitNextFormStepHandler) => {
    submitFormStepHandlers.set(currentStepCount, handler);

    setSubmitFormStepHandlers(submitFormStepHandlers);
  };
  const removeSubmitFormStepHandler = () => {
    submitFormStepHandlers.delete(currentStepCount);

    setSubmitFormStepHandlers(submitFormStepHandlers);
  };
  return {
    submitFormStepHandler,
    setSubmitFormStepHandler,
    removeSubmitFormStepHandler,
  };
}

export function useSetSubmitFormStepHandler(
  stepCount: StepCount,
  handler: SubmitNextFormStepHandler
) {
  const { setSubmitFormStepHandler, removeSubmitFormStepHandler } =
    useSubmitFormStepHandler(stepCount);

  useEffect(() => {
    setSubmitFormStepHandler(handler);

    return () => removeSubmitFormStepHandler();
  }, []);
}
