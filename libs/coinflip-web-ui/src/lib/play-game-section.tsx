import { FormProvider, useForm } from 'react-hook-form';
import { useFormSteps } from './form-steps';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButtons } from './create-game-section/bottom-navigation-buttons';
import {
  CoinSideForm,
  CoinSideFormSection,
} from './create-game-section/coin-side-form-section';
import {
  ProofOfChanceForm,
  ProofOfChanceFormSection,
} from './create-game-section/proof-of-chance-form-section';
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
import { CoinflipGame } from '@orisirisi/coinflip';

type PlayGameForm = CoinSideForm & ProofOfChanceForm;

export function PlayGameSection({ game }: { game: CoinflipGame | null }) {
  const formMethods = useForm<PlayGameForm>();
  const { formState, trigger: triggerValidation } = formMethods;

  const {
    stepCount,
    formSteps,
    isFirstStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
  } = useFormSteps<PlayGameForm>();

  const playGameFormSteps = formSteps
    .addStep(['coinSide'], <CoinSideFormSection />)
    .addStep(
      ['proofOfChance'],
      <ProofOfChanceFormSection
        stepCount={stepCount}
        goToNextStep={goToNextStep}
      />
    );

  const currentFields = formSteps.getFields(stepCount);
  const isLastStep = stepCount === playGameFormSteps.lastStep();
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

  const playGame = async ({ coinSide, proofOfChance }: PlayGameForm) => {
    const { ok: signer, error } = await currentWeb3Account!.getSigner();

    console.log({ coinSide, proofOfChance });
    // TODO: Do something with error here
    const coinflipContract = CoinflipContract.fromSigner(
      signer!,
      currentChain!.id
    );

    try {
      await coinflipContract.playGame(
        game!.id,
        coinSide,
        encodeBytes32String(proofOfChance),
        { value: parseEther(game!.wager) }
      );

      const INDEX_GRACE_PERIOD_MS = 8000;
      toast.loading('Creating Game', {
        position: 'bottom-right',
        duration: INDEX_GRACE_PERIOD_MS,
      });

      setTimeout(() => {
        toast.success('Successfully created!', { position: 'bottom-right' });
        push('/games?for=my_games');
      }, INDEX_GRACE_PERIOD_MS);
    } catch (e) {
      switch (Web3ProviderError.from(e).code) {
        case Web3ProviderErrorCode.UserRejected:
          console.log('User Rejected. TODO: Add a toast here');
          break;
      }
    }
  };

  if (!game) return null;

  return (
    <div>
      {!isFirstStep && <BackButton onClick={goToPreviousStep} />}

      <form onSubmit={formMethods.handleSubmit(playGame)}>
        <FormProvider {...formMethods}>
          {formSteps.renderStep(stepCount)}
        </FormProvider>

        <div className="mt-16 w-100 text-center">
          <BottomNavigationButtons
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            enableFirstStepButton={true}
            isCurrentFormStepValid={isCurrentFormStepValid}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />
        </div>
      </form>
    </div>
  );
}
