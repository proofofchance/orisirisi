import { useFormContext } from 'react-hook-form';
import { CreateGameParamsField } from '@orisirisi/coinflip';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { DecimalInput, isValidDecimalInput } from '@orisirisi/orisirisi-web-ui';
import { ChainCurrencyButton } from './get-wager/chain-currency-button';
import { ErrorMessageParagraph } from './error-message-paragraph';

const MINIMUM_WAGER = 0.02;
const isUpToMinimumWager = (wager: string) =>
  parseFloat(wager) >= MINIMUM_WAGER;

type validInput = true;
interface Props {
  wagerField: CreateGameParamsField;
  maybeGoToNext: (wagerField: CreateGameParamsField) => void;
}

export function GetWager({ maybeGoToNext, wagerField }: Props) {
  const currentChain = useCurrentChain();

  const { register, formState } = useFormContext();

  const errorMessage = formState.errors[wagerField]?.message as string;
  const validate = (wager: string) => {
    if (!isValidDecimalInput(wager)) {
      return 'Please enter a valid wager';
    }

    if (!isUpToMinimumWager(wager)) {
      return `Minimum wager allowed is ${0.02} ${currentChain!.getCurrency()}`;
    }

    return true as validInput;
  };

  return (
    <section className="text-center text-white">
      <h2 className="mt-16 font-bold text-[28px] tracking-wide">
        How much do you want to stake?
      </h2>

      <div className="m-auto w-[600px]">
        <div className="mt-7 flex  justify-center items-center border-2 border-white rounded-full px-2 ">
          <DecimalInput
            placeholder={`${MINIMUM_WAGER}`}
            className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
            {...register(wagerField, { validate })}
            onEnter={() => maybeGoToNext(wagerField)}
          />
          <ChainCurrencyButton chain={currentChain!} />
        </div>
        {errorMessage && (
          <ErrorMessageParagraph
            className="mt-2 self-start text-sm "
            message={errorMessage}
          />
        )}
      </div>

      {/* TODO: Show USD estimation here using Uniswap from Rust API */}
    </section>
  );
}
