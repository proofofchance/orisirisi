import { useFormContext } from 'react-hook-form';
import { IntegerInput, SelectInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';

export interface GetExpiryForm {
  expiry: string;
  expiryUnit: ExpiryUnit;
}
export function GetExpiryFormSection() {
  const { register, watch, setValue } = useFormContext<GetExpiryForm>();

  const expiryUnit = watch('expiryUnit') ?? DEFAULT_EXPIRY_UNIT;
  setValue('expiry', getDefaultExpiry(expiryUnit).toString());

  return (
    <FormSectionShell title="Set Game Expiry">
      <div className="mt-7 w-[600px] flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <IntegerInput
          className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('expiry')}
          max={getMaxExpiry(expiryUnit)}
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
