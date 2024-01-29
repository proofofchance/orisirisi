import { useFormContext } from 'react-hook-form';
import {
  ArrowPathIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
} from '@heroicons/react/24/outline';
import {
  CoinSide,
  getRandomCoinSide,
  oppositeCoinSide,
} from '@orisirisi/coinflip';
import { FormSectionShell } from './form-section-shell';
import { InsideFormShellButton } from './common-buttons';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { TipCard } from './tip-card';

export interface CoinSideForm {
  coinSide: CoinSide;
}

export function CoinSideFormSection({
  disabledCoinSide,
}: {
  disabledCoinSide?: CoinSide | null;
}) {
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

  const isHeadDisabled = disabledCoinSide === CoinSide.Head;
  const isTailDisabled = disabledCoinSide === CoinSide.Tail;

  return (
    <FormSectionShell title="Pick a Coin Side">
      <TipCard
        className="md:w-[320px]"
        tip="This is your prediction of the coinflip outcome. You win if you prediction turns out right."
      />

      <div className="mt-8 flex gap-8 items-center">
        <InsideFormShellButton
          className="w-28 h-28"
          selected={coinSide === CoinSide.Head}
          icon={<ArrowSmallUpIcon className="h-6" />}
          disabled={isHeadDisabled}
          label="Head"
          onClick={async () => await pickCoinSide(CoinSide.Head)}
        />
        <div className="text-sm">OR</div>
        <InsideFormShellButton
          className="w-28 h-28"
          selected={coinSide === CoinSide.Tail}
          icon={<ArrowSmallDownIcon className="h-6" />}
          disabled={isTailDisabled}
          label="Tail"
          onClick={async () => await pickCoinSide(CoinSide.Tail)}
        />
      </div>
      <InsideFormShellButton
        className="mt-12"
        icon={<ArrowPathIcon className="h-6" />}
        label="Pick Random"
        onClick={async () => {
          if (isHeadDisabled || isTailDisabled) {
            await pickCoinSide(oppositeCoinSide(disabledCoinSide!));
          } else {
            await pickCoinSide(getRandomCoinSide());
          }
        }}
      />
      <ErrorMessageParagraph className="mt-4 text-sm" message={errorMessage} />
      {/* TODO: <div className="mt-6">Coin Animation here</div> */}
    </FormSectionShell>
  );
}
