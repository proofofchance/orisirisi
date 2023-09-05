import { useFormContext } from 'react-hook-form';
import { IntegerInput, SelectInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';

export interface GetExpiryForm {
  expiry: string;
  expiryUnit: 'hour' | 'days';
}
export function GetExpiryFormSection() {
  const { register } = useFormContext<GetExpiryForm>();

  return (
    <FormSectionShell title="Set Game Expiry">
      <div className="mt-7 w-[600px] flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <IntegerInput
          className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('expiry')}
          defaultValue={24}
          max={20000}
        />

        <div className="px-4 flex gap-3 justify-center items-center">
          <SelectInput
            className="bg-transparent focus:outline-none"
            {...register('expiryUnit')}
            options={['Hours', 'Days']}
          />
        </div>
      </div>
    </FormSectionShell>
  );
}
