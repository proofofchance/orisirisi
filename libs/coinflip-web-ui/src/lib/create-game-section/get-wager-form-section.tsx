import { useFormContext } from 'react-hook-form';
import { CreateGameParamsKey } from '@orisirisi/coinflip';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { DecimalInput, isValidDecimalInput } from '@orisirisi/orisirisi-web-ui';
import { ChainCurrencyButton } from './get-wager-form-section/chain-currency-button';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { FormSectionShell } from './form-section-shell';

const MINIMUM_WAGER = 0.02;
const isUpToMinimumWager = (wager: string) =>
  parseFloat(wager) >= MINIMUM_WAGER;

interface Props {
  field: CreateGameParamsKey;
  goToNextStep: () => void;
}

export function GetWagerFormSection({ field, goToNextStep }: Props) {
  const { register, formState, trigger: triggerValidation } = useFormContext();
  const currentChain = useCurrentChain();
  const errorMessage = formState.errors[field]?.message as string;
  const isCurrentFormStepValid = async () =>
    (await triggerValidation(field)) && !formState.errors[field];

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
          className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register(field, { validate })}
          onEnter={async () =>
            (await isCurrentFormStepValid()) && goToNextStep()
          }
        />
        <ChainCurrencyButton className="px-4" chain={currentChain!} />
      </div>
      <ErrorMessageParagraph className="mt-2 text-sm" message={errorMessage} />
      {/* TODO: Show USD estimation here using Uniswap from Rust API */}
    </FormSectionShell>
  );
}
