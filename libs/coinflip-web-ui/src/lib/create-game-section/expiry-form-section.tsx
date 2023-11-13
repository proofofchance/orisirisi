import { useFormContext } from 'react-hook-form';
import { IntegerInput, SelectInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';
import {
  currentTimeInSeconds,
  daysToSeconds,
  hoursToSeconds,
} from '@orisirisi/orisirisi-data-utils';

export interface ExpiryForm {
  expiry: string;
  expiryUnit: ExpiryUnit;
}
export function ExpiryFormSection() {
  const { register, watch, setValue } = useFormContext<ExpiryForm>();

  const expiryUnit = watch('expiryUnit') ?? DEFAULT_EXPIRY_UNIT;
  setValue('expiry', getDefaultExpiry(expiryUnit).toString());

  return (
    <FormSectionShell title="Set Game Expiry">
      <div className="mt-7 flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <IntegerInput
          className="w-[320px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('expiry')}
          max={getMaxExpiry(expiryUnit)}
          preventSubmit
          onEnterDoNothing
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

const MAX_HOURS = 24;
const MAX_DAYS = 30;

const getMaxExpiry = (expiryUnit: ExpiryUnit) => {
  switch (expiryUnit) {
    case 'hours':
      return MAX_HOURS;
    case 'days':
      return MAX_DAYS;
  }
};
