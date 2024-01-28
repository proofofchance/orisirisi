import { useFormContext } from 'react-hook-form';
import { CoinflipGame } from '@orisirisi/coinflip';
import {
  useCurrentChain,
  useCurrentWeb3Account,
  useCurrentWeb3Provider,
} from '@orisirisi/orisirisi-web3-ui';
import { DecimalInput, isValidDecimalInput } from '@orisirisi/orisirisi-web-ui';
import { ChainCurrencyButton } from './get-wager-form-section/chain-currency-button';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { FormSectionShell } from './form-section-shell';

const isUpToMinimumWager = (wager: number) =>
  wager >= CoinflipGame.getMinWagerEth();

export interface WagerForm {
  wager: string;
}

interface Props {
  onSubmit?: () => void;
}

export function WagerFormSection({ onSubmit }: Props) {
  const {
    register,
    formState,
    trigger: triggerValidation,
    clearErrors,
  } = useFormContext<WagerForm>();

  const chain = useCurrentChain();
  const currentWeb3Provider = useCurrentWeb3Provider();
  const { currentWeb3Account } = useCurrentWeb3Account();

  const errorMessage = formState.errors['wager']?.message as string;

  const isValidWagerValue = async () =>
    (await triggerValidation('wager')) && !formState.errors['wager'];

  const validate = async (wager: string) => {
    if (!isValidDecimalInput(wager)) {
      return 'Please enter a valid wager';
    }

    const wagerFloat = parseFloat(wager);

    if (!isUpToMinimumWager(wagerFloat)) {
      return `Minimum wager allowed is ${0.02} ${chain!.getCurrency()}`;
    }

    const accountBalance = await currentWeb3Account!.getBalance(
      currentWeb3Provider!
    );

    if (accountBalance < wagerFloat) {
      return `Insufficient balance`;
    }

    return true;
  };

  return (
    <FormSectionShell title="How much do you want to stake?">
      <div className="mt-7 flex justify-center items-center border-2 border-white rounded-full px-2">
        <DecimalInput
          placeholder={`${CoinflipGame.getMinWagerEth()}`}
          className="w-[180px] md:w-[320px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('wager', {
            validate,
            onChange: () => clearErrors('wager'),
          })}
          onEnter={async () => (await isValidWagerValue()) && onSubmit?.()}
          preventSubmit
        />
        {chain && <ChainCurrencyButton className="px-4" chain={chain} />}
      </div>
      <ErrorMessageParagraph className="mt-2 text-sm" message={errorMessage} />
      {/* TODO: Show USD estimation here using Uniswap from Rust API */}
    </FormSectionShell>
  );
}
