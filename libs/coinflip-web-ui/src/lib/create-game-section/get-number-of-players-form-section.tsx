import { useFormContext } from 'react-hook-form';
import { TextInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';
import {
  DownArrowButton,
  UpArrowButton,
} from './get-number-of-players-form-section/buttons';

interface Props {
  numberOfPlayersField: string;
}

const MAX_NUMBER_OF_PLAYERS = 20;

export function GetNumberOfPlayersFormSection({ numberOfPlayersField }: Props) {
  const { register, formState } = useFormContext();

  return (
    <FormSectionShell title="Set Number of Players">
      <div className="mt-7 w-[600px] flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <TextInput
          defaultValue={'2 Players'}
          {...register(numberOfPlayersField)}
          className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
        />
        <div className="px-4 flex flex-col gap-3 justify-center">
          <UpArrowButton />
          <DownArrowButton />
        </div>
      </div>
    </FormSectionShell>
  );
}
