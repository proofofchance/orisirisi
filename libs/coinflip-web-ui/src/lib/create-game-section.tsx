import { FormProvider, useForm } from 'react-hook-form';
import { useFormSteps } from './form-steps';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButtons } from './create-game-section/bottom-navigation-buttons';
import {
  WagerForm,
  WagerFormSection,
} from './create-game-section/wager-form-section';
import {
  NumberOfPlayers,
  NumberOfPlayersForm,
  NumberOfPlayersFormSection,
} from './create-game-section/number-of-players-form-section';
import {
  ExpiryForm,
  ExpiryFormSection,
  getExpiryTimestamp,
} from './create-game-section/expiry-form-section';
import {
  CoinSideForm,
  CoinSideFormSection,
} from './create-game-section/coin-side-form-section';
import {
  ProofOfChanceForm,
  ProofOfChanceFormSection,
} from './create-game-section/proof-of-chance-form-section';
import { ConfirmGameDetailsFormSection } from './create-game-section/confirm-game-details-form-section';
import { CoinflipContract } from '@orisirisi/coinflip-contracts';
import {
  useCurrentChain,
  useCurrentWeb3Account,
} from '@orisirisi/orisirisi-web3-ui';
import { encodeBytes32String, parseEther } from 'ethers';
import {
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { COINFLIP_INDEX_GRACE_PERIOD } from '@orisirisi/coinflip';

type CreateGameForm = WagerForm &
  NumberOfPlayersForm &
  ExpiryForm &
  CoinSideForm &
  ProofOfChanceForm;

export function CreateGameSection() {
  const formMethods = useForm<CreateGameForm>();
  const { formState, trigger: triggerValidation, getValues } = formMethods;

  const {
    stepCount,
    formSteps,
    isFirstStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
  } = useFormSteps<CreateGameForm>();

  const createGameFormSteps = formSteps
    .addStep(['wager'], <WagerFormSection onSubmit={goToNextStep} />)
    .addStep(['numberOfPlayers'], <NumberOfPlayersFormSection />)
    .addStep(
      ['expiry', 'expiryUnit'],
      <ExpiryFormSection onSubmit={goToNextStep} />
    )
    .addStep(['coinSide'], <CoinSideFormSection />)
    .addStep(
      ['proofOfChance'],
      <ProofOfChanceFormSection stepCount={stepCount} onSubmit={goToNextStep} />
    )
    .addStep(
      [],
      <ConfirmGameDetailsFormSection
        goToStep={goToStep}
        getGameDetails={getValues}
      />
    );

  const currentFields = formSteps.getFields(stepCount);
  const isLastStep = stepCount === createGameFormSteps.lastStep();
  const isCurrentFormStepDirty = currentFields.every(
    (field) => !!formState.dirtyFields[field]
  );
  const [maybeGoToNextStepRequest, setMaybeGoToNextStepRequest] =
    useState<Date | null>(null);
  useEffect(() => {
    const areAllFieldsValid = () =>
      currentFields.every((field) => !formState.errors[field]);

    if (maybeGoToNextStepRequest && areAllFieldsValid()) {
      goToNextStep();
    }

    setMaybeGoToNextStepRequest(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maybeGoToNextStepRequest]);

  const triggerAllValidations = async () => {
    await Promise.all(
      currentFields.map(async (field) => await triggerValidation(field))
    );
  };

  const { currentWeb3Account } = useCurrentWeb3Account();
  const currentChain = useCurrentChain();

  const { push } = useRouter();

  const createGame = async ({
    wager,
    numberOfPlayers,
    expiry,
    expiryUnit,
    coinSide,
    proofOfChance,
  }: CreateGameForm) => {
    const { ok: signer, error } = await currentWeb3Account!.getSigner();

    // TODO: Do something with error here
    const coinflipContract = CoinflipContract.fromSigner(
      signer!,
      currentChain!.id
    );

    try {
      await coinflipContract.createGame(
        parseEther(wager).toString(),
        NumberOfPlayers.fromString(numberOfPlayers).value,
        getExpiryTimestamp(expiry, expiryUnit),
        coinSide,
        encodeBytes32String(proofOfChance),
        { value: parseEther(wager) }
      );

      toast.loading('Creating Game', {
        position: 'bottom-right',
        duration: COINFLIP_INDEX_GRACE_PERIOD,
      });

      setTimeout(() => {
        toast.success('Successfully created!', { position: 'bottom-right' });
        push('/games?for=my_games');
      }, COINFLIP_INDEX_GRACE_PERIOD);
    } catch (e) {
      switch (Web3ProviderError.from(e).code) {
        case Web3ProviderErrorCode.UserRejected:
          console.log('User Rejected. TODO: Add a toast here');
          break;
      }
    }
  };
  return (
    <div>
      {!isFirstStep && <BackButton onClick={goToPreviousStep} />}

      <form onSubmit={formMethods.handleSubmit(createGame)}>
        <FormProvider {...formMethods}>
          {formSteps.renderStep(stepCount)}
        </FormProvider>

        <div className="mt-16 w-100 text-center">
          <BottomNavigationButtons
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            enableFirstStepButton={isCurrentFormStepDirty}
            triggerAllValidations={triggerAllValidations}
            maybeGoToNextStep={() => setMaybeGoToNextStepRequest(new Date())}
            goToPreviousStep={goToPreviousStep}
          />
        </div>
      </form>
    </div>
  );
}
