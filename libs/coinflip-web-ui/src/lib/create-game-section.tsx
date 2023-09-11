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
  currentTimeInSeconds,
  daysToSeconds,
  hoursToSeconds,
} from '@orisirisi/orisirisi-data-utils';
import {
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';

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

  return (
    <div>
      <BackButton onClick={goToPreviousStep} />

      <form
        onSubmit={formMethods.handleSubmit(
          async ({
            wager,
            numberOfPlayers,
            expiry,
            expiryUnit,
            coinSide,
            proofOfChance,
          }) => {
            const { ok: signer, error } = await currentWeb3Account!.getSigner();

            // TODO: Do something with error here

            const coinflipContract = CoinflipContract.fromSigner(
              signer!,
              currentChain!.id
            );

            const getExpiryTimestamp = () => {
              switch (expiryUnit) {
                case 'days':
                  return currentTimeInSeconds() + daysToSeconds(+expiry);

                case 'hours':
                  return currentTimeInSeconds() + hoursToSeconds(+expiry);
              }
            };

            try {
              await coinflipContract.createGame(
                +wager,
                NumberOfPlayers.fromString(numberOfPlayers).value,
                getExpiryTimestamp(),
                coinSide,
                encodeBytes32String(proofOfChance),
                { value: parseEther(wager) }
              );

              // TODO: Show toast for successfully creating game and route to 'My Games'
            } catch (e) {
              switch (Web3ProviderError.from(e).code) {
                case Web3ProviderErrorCode.UserRejected:
                  console.log('User Rejected. TODO: Add a toast here');
                  break;
              }
            }
          }
        )}
      >
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
