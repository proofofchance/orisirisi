import { useFormContext } from 'react-hook-form';
import { CoinflipGame } from '@orisirisi/coinflip';
import { TextInput } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';
import { DownArrowButton, UpArrowButton } from './common-buttons';

export interface NumberOfPlayersForm {
  numberOfPlayers: string;
}

export function NumberOfPlayersFormSection() {
  const { register, setValue, watch } = useFormContext<NumberOfPlayersForm>();

  const numberOfPlayers = NumberOfPlayers.fromString(watch('numberOfPlayers'));

  const increaseNumberOfPlayers = () =>
    setValue('numberOfPlayers', numberOfPlayers.increase().toString());

  const decreaseNumberOfPlayers = () =>
    setValue('numberOfPlayers', numberOfPlayers.decrease().toString());

  return (
    <FormSectionShell title="Set Number of Players">
      <div className="mt-7 flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <TextInput
          disabled
          className="w-[320px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('numberOfPlayers')}
          defaultValue={NumberOfPlayers.getMinAllowed().toString()}
        />
        <div className="px-4 flex flex-col gap-3 justify-center">
          <UpArrowButton onClick={increaseNumberOfPlayers} />
          <DownArrowButton onClick={decreaseNumberOfPlayers} />
        </div>
      </div>
    </FormSectionShell>
  );
}

export class NumberOfPlayers {
  private static min = CoinflipGame.minNumberOfPlayers;
  private static max = CoinflipGame.maxNumberOfPlayers;
  private static delimiter = ' ';
  private static suffix = 'Players';
  private constructor(public value: number) {}
  static getMinAllowed = () => new NumberOfPlayers(this.min);
  increase() {
    const newValue = Math.min(this.value + 1, NumberOfPlayers.max);
    return new NumberOfPlayers(newValue);
  }
  decrease() {
    const newValue = Math.max(this.value - 1, NumberOfPlayers.min);
    return new NumberOfPlayers(newValue);
  }
  static fromString(str?: string) {
    if (!str) return NumberOfPlayers.getMinAllowed();
    const [value] = str.split(this.delimiter);
    return new NumberOfPlayers(+value);
  }
  toString = () =>
    `${this.value}${NumberOfPlayers.delimiter}${NumberOfPlayers.suffix}`;
}
