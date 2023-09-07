import { useFormContext } from 'react-hook-form';
import {
  ArrowPathIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
} from '@heroicons/react/24/outline';
import { CoinSide, getRandomCoinSide } from '@orisirisi/coinflip';
import { FormSectionShell } from './form-section-shell';
import { InsideFormShellButton } from './common-buttons';
import { ErrorMessageParagraph } from './error-message-paragraph';

export interface CoinSideForm {
  coinSide: CoinSide;
}

export function CoinSideFormSection() {
  const {
    register,
    formState,
    setValue,
    watch,
    trigger: triggerValidation,
  } = useFormContext<CoinSideForm>();
  register('coinSide', { required: 'You must pick a coin side' });
  const coinSide = watch('coinSide');
  const errorMessage = formState.errors['coinSide']?.message as string;

  const pickCoinSide = async (coinSide: CoinSide) => {
    setValue('coinSide', coinSide);
    await triggerValidation('coinSide');
  };
  return (
    <FormSectionShell title="Pick a Coin Side">
      <div className="mt-8 flex gap-4 items-center">
        <InsideFormShellButton
          selected={coinSide === CoinSide.Head}
          icon={<ArrowSmallUpIcon className="h-6" />}
          label="Head"
          onClick={async () => await pickCoinSide(CoinSide.Head)}
        />
        <div className="text-sm">OR</div>
        <InsideFormShellButton
          selected={coinSide === CoinSide.Tail}
          icon={<ArrowSmallDownIcon className="h-6" />}
          label="Tail"
          onClick={async () => await pickCoinSide(CoinSide.Tail)}
        />
        <div className="text-sm">OR</div>
        <InsideFormShellButton
          icon={<ArrowPathIcon className="h-6" />}
          label="Pick Random"
          onClick={async () => await pickCoinSide(getRandomCoinSide())}
        />
      </div>
      <ErrorMessageParagraph className="mt-2 text-sm" message={errorMessage} />
      {/* TODO: <div className="mt-6">Coin Animation here</div> */}
    </FormSectionShell>
  );
}
