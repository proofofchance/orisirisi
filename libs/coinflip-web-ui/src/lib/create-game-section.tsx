import { FormProvider, useForm } from 'react-hook-form';
import { useFormSteps } from './form-steps';
import { BackButton } from './back-buttons';
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
  ChanceForm,
  ChanceFormSection,
} from './create-game-section/chance-form-section';
import { ConfirmGameDetailsFormSection } from './create-game-section/confirm-game-details-form-section';
import { CoinflipContract } from '@orisirisi/coinflip-contracts';
import {
  useCurrentChain,
  useCurrentWeb3Account,
} from '@orisirisi/orisirisi-web3-ui';
import { parseEther } from 'ethers';
import {
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  COINFLIP_INDEXING_RATE_MS,
  CoinflipHTTPService,
} from '@orisirisi/coinflip';
import { ProofOfChance } from '@orisirisi/proof-of-chance';
import { sleep } from '@orisirisi/orisirisi-data-utils';
import { ServiceChargeInfo } from './create-game-section/service-charge-info';

type CreateGameForm = WagerForm &
  NumberOfPlayersForm &
  ExpiryForm &
  CoinSideForm &
  ChanceForm;

export function CreateGameSection() {
  const { push } = useRouter();
  const { currentWeb3Account } = useCurrentWeb3Account();
  const currentChain = useCurrentChain();

  const formMethods = useForm<CreateGameForm>();
  const { formState, trigger: triggerValidation, getValues } = formMethods;
  const [proofOfChance, setProofOfChance] = useState<ProofOfChance | null>(
    null
  );

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
      ['chance'],
      <ChanceFormSection
        proofOfChanceFileName={`coinflip-game-you-created-on-${currentChain?.getName()}`}
        stepCount={stepCount}
        proofOfChance={proofOfChance}
        setProofOfChance={setProofOfChance}
        onSubmit={goToNextStep}
      />
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

  const createGame = async ({
    wager,
    numberOfPlayers,
    expiry,
    expiryUnit,
    coinSide,
  }: CreateGameForm) => {
    CoinflipHTTPService.keepIndexingActive();

    const { ok: signer, error } = await currentWeb3Account!.getSigner();

    // TODO: Do something with error here
    const coinflipContract = CoinflipContract.fromSignerAndChain(
      signer!,
      currentChain!.id
    );

    const awaitingApprovalToastId = toast.loading('Awaiting approval...', {
      position: 'bottom-right',
    });

    try {
      await coinflipContract.createGame(
        NumberOfPlayers.fromString(numberOfPlayers).value,
        getExpiryTimestamp(expiry, expiryUnit),
        coinSide,
        await proofOfChance!.getProofOfChance(),
        { value: parseEther(wager), gasLimit: 400_000 }
      );

      toast.dismiss(awaitingApprovalToastId);

      const loadingToastId = toast.loading('Creating Game...', {
        position: 'bottom-right',
      });

      await sleep(COINFLIP_INDEXING_RATE_MS);

      toast.dismiss(loadingToastId);
      toast.success('Successfully created!', { position: 'bottom-right' });
      push('/games?for=my_games');
    } catch (e) {
      switch (Web3ProviderError.from(e).code) {
        case Web3ProviderErrorCode.UserRejected:
          toast.dismiss(awaitingApprovalToastId);
          console.log('User Rejected. TODO: Add a toast here');
          break;
      }
    }
  };
  return (
    <div className="text-white">
      {!isFirstStep && (
        <BackButton className="mt-6" onClick={goToPreviousStep} />
      )}

      <form onSubmit={formMethods.handleSubmit(createGame)}>
        <FormProvider {...formMethods}>
          {formSteps.renderStep(stepCount)}
        </FormProvider>

        {isLastStep && currentChain && (
          <ServiceChargeInfo currentChain={currentChain} />
        )}
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
