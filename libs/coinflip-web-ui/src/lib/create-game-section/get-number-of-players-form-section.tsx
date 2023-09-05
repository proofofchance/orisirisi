import { useFormContext } from 'react-hook-form';
import { CreateGameParams, CreateGameParamsKey } from '@orisirisi/coinflip';
import { TextInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';
import {
  DownArrowButton,
  UpArrowButton,
} from './get-number-of-players-form-section/buttons';

interface Props {
  field: 'numberOfPlayers';
}

const MAX_NUMBER_OF_PLAYERS = 20;

class NumberOfPlayers {
  private static min = 2;
  private static max = 20;
  private static delimiter = ' ';
  private static suffix = 'Players';
  private constructor(private value: number) {}
  static getMinAllowed = () => new NumberOfPlayers(this.min);
  increase() {
    const newValue = Math.min(this.value + 1, NumberOfPlayers.max);
    return new NumberOfPlayers(newValue);
  }
  decrease() {
    const newValue = Math.max(this.value - 1, NumberOfPlayers.min);
    return new NumberOfPlayers(newValue);
  }
  static fromString(str: string) {
    const [value] = str.split(this.delimiter);
    return new NumberOfPlayers(+value);
  }
  toString = () =>
    `${this.value}${NumberOfPlayers.delimiter}${NumberOfPlayers.suffix}`;
}

export function GetNumberOfPlayersFormSection({ field }: Props) {
  const { register, setValue, watch } = useFormContext<CreateGameParams>();

  const numberOfPlayers = NumberOfPlayers.fromString(watch(field));

  const increaseNumberOfPlayers = () =>
    setValue(field, numberOfPlayers.increase().toString());

  const decreaseNumberOfPlayers = () =>
    setValue(field, numberOfPlayers.decrease().toString());

  return (
    <FormSectionShell title="Set Number of Players">
      <div className="mt-7 w-[600px] flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <TextInput
          defaultValue={NumberOfPlayers.getMinAllowed().toString()}
          {...register(field)}
          className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
        />
        <div className="px-4 flex flex-col gap-3 justify-center">
          <UpArrowButton onClick={increaseNumberOfPlayers} />
          <DownArrowButton onClick={decreaseNumberOfPlayers} />
        </div>
      </div>
    </FormSectionShell>
  );
}
