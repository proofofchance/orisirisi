import { useFormContext } from 'react-hook-form';
import { IntegerInput, SelectInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';
import {
  currentTimeInSeconds,
  daysToSeconds,
  hoursToSeconds,
  parseInteger,
} from '@orisirisi/orisirisi-data-utils';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { useEffect } from 'react';
import { TipCard } from './tip-card';

export interface ExpiryForm {
  expiry: string;
  expiryUnit: ExpiryUnit;
}
export function ExpiryFormSection({ onSubmit }: { onSubmit?: () => void }) {
  const {
    register,
    formState,
    watch,
    setValue,
    trigger: triggerValidation,
  } = useFormContext<ExpiryForm>();

  const errorMessage = formState.errors['expiry']?.message as string;

  const expiryUnit = watch('expiryUnit') ?? DEFAULT_EXPIRY_UNIT;
  const hasExpiryFieldBeenTouched = formState.touchedFields['expiry'];

  useEffect(() => {
    if (!hasExpiryFieldBeenTouched) {
      setValue('expiry', getDefaultExpiry(expiryUnit).toString());
      triggerValidation('expiry');
    }
  }, [
    expiryUnit,
    hasExpiryFieldBeenTouched,
    watch,
    setValue,
    triggerValidation,
  ]);

  const isValidExpiryValue = async () =>
    (await triggerValidation('expiry')) && !formState.errors['expiry'];

  const validate = (expiry: string) => {
    if (!expiry) return 'An expiry duration is required';

    const minExpiry = getMinExpiry(expiryUnit);
    if (parseInteger(expiry)! < minExpiry)
      return `Expiry must be ${minExpiry} ${expiryUnit} at least. Consider switching to ${getOtherExpiryUnit(
        expiryUnit
      )}.`;

    const maxExpiry = getMaxExpiry(expiryUnit);
    if (parseInteger(expiry)! > maxExpiry)
      return `Expiry must be ${maxExpiry} ${expiryUnit} at most. Consider switching to ${getOtherExpiryUnit(
        expiryUnit
      )}.`;

    return true;
  };

  return (
    <FormSectionShell title="Set Game Expiry">
      <TipCard
        className="md:400px"
        tip="Wagers are refunded if other players do not participate fully before the time expiry limit specified here."
      />

      <div className="mt-7 flex justify-center items-center border-2 border-white rounded-full px-2">
        <IntegerInput
          className="w-[180px] md:w-[320px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('expiry', { validate })}
          max={getMaxExpiry(DEFAULT_EXPIRY_UNIT)}
          defaultValue={getDefaultExpiry(expiryUnit).toString()}
          preventSubmit
          onEnter={async () => (await isValidExpiryValue()) && onSubmit?.()}
        />

        <div className="px-4 flex gap-3 justify-center items-center">
          <SelectInput
            className="bg-transparent focus:outline-none"
            defaultValue={DEFAULT_EXPIRY_UNIT}
            {...register('expiryUnit')}
            options={[
              { display: 'Hours', value: 'hours' },
              { display: 'Days', value: 'days' },
            ]}
          />
        </div>
      </div>
      <ErrorMessageParagraph className="mt-2 text-sm" message={errorMessage} />
    </FormSectionShell>
  );
}

export const getExpiryTimestamp = (expiry: string, expiryUnit: ExpiryUnit) => {
  switch (expiryUnit) {
    case 'days':
      return currentTimeInSeconds() + daysToSeconds(+expiry);

    case 'hours':
      return currentTimeInSeconds() + hoursToSeconds(+expiry);
  }
};

type ExpiryUnit = 'hours' | 'days';

const DEFAULT_EXPIRY_UNIT: ExpiryUnit = 'hours';

const DEFAULT_HOURS = 12;
const DEFAULT_DAYS = 3;

const getDefaultExpiry = (expiryUnit: ExpiryUnit) => {
  switch (expiryUnit) {
    case 'hours':
      return DEFAULT_HOURS;
    case 'days':
      return DEFAULT_DAYS;
  }
};

const getOtherExpiryUnit = (expiryUnit: ExpiryUnit) => {
  switch (expiryUnit) {
    case 'hours':
      return 'days';
    case 'days':
      return 'hours';
  }
};

const MAX_DAYS = 30;
const MAX_HOURS = MAX_DAYS * 24;

const getMaxExpiry = (expiryUnit: ExpiryUnit) => {
  switch (expiryUnit) {
    case 'hours':
      return MAX_HOURS;
    case 'days':
      return MAX_DAYS;
  }
};

const MIN_HOURS = 1;
const MIN_DAYS = 1;
const getMinExpiry = (expiryUnit: ExpiryUnit) => {
  switch (expiryUnit) {
    case 'hours':
      return MIN_HOURS;
    case 'days':
      return MIN_DAYS;
  }
};
