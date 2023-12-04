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
import { useEffect, useState } from 'react';

type PlayGameForm = CoinSideForm & ProofOfChanceForm;

export function PlayGameSection({ game }: { game: CoinflipGame | null }) {
  const formMethods = useForm<PlayGameForm>();
  const { formState, getValues, trigger: triggerValidation } = formMethods;

  const { stepCount, formSteps, isFirstStep, goToNextStep, goToPreviousStep } =
    useFormSteps<PlayGameForm>();

  const playGameFormSteps = formSteps
    .addStep(
      ['coinSide'],
      <CoinSideFormSection disabledCoinSide={game?.unavailable_coin_side} />
    )
    .addStep(
      ['proofOfChance'],
      <ProofOfChanceFormSection
        stepCount={stepCount}
        onSubmit={() => playGame(getValues())}
      />
    );

  const currentFields = formSteps.getFields(stepCount);
  const isLastStep = stepCount === playGameFormSteps.lastStep();

  const [maybeGoToNextStepRequest, setMaybeGoToNextStepRequest] =
    useState<Date | null>(null);
  useEffect(() => {
    const areAllFieldsValid = () =>
      currentFields.every((field) => !formState.errors[field]);

    if (maybeGoToNextStepRequest && areAllFieldsValid()) {
      goToNextStep();
    }

    setMaybeGoToNextStepRequest(null);
  }, [maybeGoToNextStepRequest]);

  const triggerAllValidations = async () => {
    await Promise.all(
      currentFields.map(async (field) => await triggerValidation(field))
    );
  };
  const { currentWeb3Account } = useCurrentWeb3Account();
  const currentChain = useCurrentChain();

  const { push } = useRouter();

  const playGame = async ({ coinSide, proofOfChance }: PlayGameForm) => {
    const { ok: signer, error } = await currentWeb3Account!.getSigner();

    console.log({
      coinSide,
      proofOfChance: encodeBytes32String(proofOfChance),
      wager: game?.wager,
      value: parseEther(game!.wager.toString()),
    });
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
        { value: parseEther(game!.wager.toString()) }
      );

      const INDEX_GRACE_PERIOD_MS = 8000;
      toast.loading('Creating your Game Play', {
        position: 'bottom-right',
        duration: INDEX_GRACE_PERIOD_MS,
      });

      setTimeout(() => {
        toast.success('Game play successfully created!', {
          position: 'bottom-right',
        });
        push('/games?for=my_games');
      }, INDEX_GRACE_PERIOD_MS);
    } catch (e) {
      switch (Web3ProviderError.from(e).code) {
        case Web3ProviderErrorCode.UserRejected:
          toast.error("Oops! Looks like you've rejected the transaction.", {
            position: 'bottom-right',
          });
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
            triggerAllValidations={triggerAllValidations}
            maybeGoToNextStep={() => setMaybeGoToNextStepRequest(new Date())}
            goToPreviousStep={goToPreviousStep}
          />
        </div>
      </form>
    </div>
  );
}
