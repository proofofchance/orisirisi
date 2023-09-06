import { ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  ArrowPathIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
} from '@heroicons/react/24/outline';
import { CoinSide, getRandomCoinSide } from '@orisirisi/coinflip';
import { ButtonProps, cn } from '@orisirisi/orisirisi-web-ui';
import { FormSectionShell } from './form-section-shell';

export interface CoinSideForm {
  coinSide: CoinSide;
}

export function CoinSideFormSection() {
  const { setValue, watch } = useFormContext<CoinSideForm>();
  const coinSide = watch('coinSide');

  return (
    <FormSectionShell title="Pick a Coin Side">
      <div className="mt-8 flex gap-4 items-center">
        <ChooseButton
          chosen={coinSide === CoinSide.Head}
          icon={<ArrowSmallUpIcon className="h-6" />}
          label="Head"
          onClick={() => setValue('coinSide', CoinSide.Head)}
        />
        <div className="text-sm">OR</div>
        <ChooseButton
          chosen={coinSide === CoinSide.Tail}
          icon={<ArrowSmallDownIcon className="h-6" />}
          label="Tail"
          onClick={() => setValue('coinSide', CoinSide.Tail)}
        />
        <div className="text-sm">OR</div>
        <ChooseButton
          icon={<ArrowPathIcon className="h-6" />}
          label="Pick Random"
          onClick={() => setValue('coinSide', getRandomCoinSide())}
        />
      </div>
      {/* TODO: <div className="mt-6">Coin Animation here</div> */}
    </FormSectionShell>
  );
}

interface ChooseButtonProps extends ButtonProps {
  chosen?: boolean;
  icon: ReactElement;
  label: string;
}

function ChooseButton({
  chosen,
  icon,
  label,
  ...remainingProps
}: ChooseButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-full px-12 py-4 text-lg border-white border-2',
        chosen && 'bg-white text-black',
        'hover:bg-white hover:text-black focus:outline-none focus:ring focus:ring-blue-200'
      )}
      {...remainingProps}
    >
      <div className="flex justify-center items-center gap-2">
        <div>{icon}</div>
        <div>{label}</div>
      </div>
    </button>
  );
}
