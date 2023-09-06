import { useFormContext } from 'react-hook-form';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { DecimalInput, isValidDecimalInput } from '@orisirisi/orisirisi-web-ui';
import { ChainCurrencyButton } from './get-wager-form-section/chain-currency-button';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { FormSectionShell } from './form-section-shell';

const MINIMUM_WAGER = 0.02;
const isUpToMinimumWager = (wager: string) =>
  parseFloat(wager) >= MINIMUM_WAGER;

export interface WagerForm {
  wager: string;
}

interface Props {
  goToNextStep: () => void;
}

export function WagerFormSection({ goToNextStep }: Props) {
  const {
    register,
    formState,
    trigger: triggerValidation,
  } = useFormContext<WagerForm>();
  const currentChain = useCurrentChain();
  const errorMessage = formState.errors['wager']?.message as string;

  const isValidFieldValue = async () =>
    (await triggerValidation('wager')) && !formState.errors['wager'];

  const validate = (wager: string) => {
    if (!isValidDecimalInput(wager)) {
      return 'Please enter a valid wager';
    }

    if (!isUpToMinimumWager(wager)) {
      return `Minimum wager allowed is ${0.02} ${currentChain!.getCurrency()}`;
    }

    return true;
  };

  return (
    <FormSectionShell title="How much do you want to stake?">
      <div className="mt-7 flex justify-center items-center border-2 border-white rounded-full px-2 ">
        <DecimalInput
          placeholder={`${MINIMUM_WAGER}`}
          className="w-[320px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('wager', { validate })}
          onEnter={async () => (await isValidFieldValue()) && goToNextStep()}
          preventSubmit
        />
        <ChainCurrencyButton className="px-4" chain={currentChain!} />
      </div>
      <ErrorMessageParagraph className="mt-2 text-sm" message={errorMessage} />
      {/* TODO: Show USD estimation here using Uniswap from Rust API */}
    </FormSectionShell>
  );
}
