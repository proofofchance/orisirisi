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
    .addStep(['wager'], <WagerFormSection goToNextStep={goToNextStep} />)
    .addStep(['numberOfPlayers'], <NumberOfPlayersFormSection />)
    .addStep(['expiry', 'expiryUnit'], <ExpiryFormSection />)
    .addStep(['coinSide'], <CoinSideFormSection />)
    .addStep(
      ['proofOfChance'],
      <ProofOfChanceFormSection
        stepCount={stepCount}
        goToNextStep={goToNextStep}
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
  const isCurrentFormStepValid = async () => {
    await Promise.all(
      currentFields.map(async (field) => await triggerValidation(field))
    );

    return currentFields.every((field) => !formState.errors[field]);
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

      const INDEX_GRACE_PERIOD_MS = 8000;
      toast.loading('Creating Game', {
        position: 'bottom-right',
        duration: INDEX_GRACE_PERIOD_MS,
      });

      setTimeout(() => {
        toast.success('Successfully created!', { position: 'bottom-right' });

        push('/games?filter=my_games');
      }, INDEX_GRACE_PERIOD_MS);
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
            isCurrentFormStepDirty={isCurrentFormStepDirty}
            isCurrentFormStepValid={isCurrentFormStepValid}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />
        </div>
      </form>
    </div>
  );
}
