import { ReactNode } from 'react';
import { coinSideToString } from '@orisirisi/coinflip';
import { CoinSideForm } from './coin-side-form-section';
import { ExpiryForm } from './expiry-form-section';
import { FormSectionShell } from './form-section-shell';
import {
  NumberOfPlayers,
  NumberOfPlayersForm,
} from './number-of-players-form-section';
import { WagerForm } from './wager-form-section';
import { PencilIcon } from '@heroicons/react/24/outline';

export interface ConfirmGameDetailsFormSectionProps {
  goToStep: (step: number) => void;
  getGameDetails: () => GameDetails;
}

type GameDetails = WagerForm & NumberOfPlayersForm & ExpiryForm & CoinSideForm;

export function ConfirmGameDetailsFormSection({
  goToStep,
  getGameDetails,
}: ConfirmGameDetailsFormSectionProps) {
  const { wager, numberOfPlayers, expiry, coinSide } = getGameDetails();

  const row = (title: string, value: ReactNode, step: number) => (
    <div
      className="flex justify-between hover:text-lg cursor-pointer"
      onClick={() => goToStep(step)}
    >
      <div className="text-[#BDBDBD[">{title}</div>
      <div className="flex gap-3 items-center">
        <div>{value}</div>
        <div>
          <PencilIcon className="h-4 hover:h-5" />
        </div>
      </div>
    </div>
  );
  return (
    <FormSectionShell title="Confirm Game Details">
      <div className="mt-4 w-[400px] flex flex-col gap-1">
        {row('Wager:', wager, 0)}
        {row(
          'Number of Players:',
          NumberOfPlayers.fromString(numberOfPlayers).value,
          1
        )}
        {row('Expires:', expiry, 2)}
        {row('Coin Side:', coinSideToString(coinSide), 3)}
      </div>
    </FormSectionShell>
  );
}
