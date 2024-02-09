import { FormProvider, useForm } from 'react-hook-form';
import { useFormSteps } from './form-steps';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButtons } from './create-game-section/bottom-navigation-buttons';
import {
  CoinSideForm,
  CoinSideFormSection,
} from './create-game-section/coin-side-form-section';
import {
  ChanceForm,
  ChanceFormSection,
} from './create-game-section/chance-form-section';
import { CoinflipContract } from '@orisirisi/coinflip-contracts';
import {
  useCurrentChain,
  useCurrentWeb3Account,
} from '@orisirisi/orisirisi-web3-ui';
import { parseEther } from 'ethers';
import {
  Transaction,
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { COINFLIP_INDEX_GRACE_PERIOD, CoinflipGame } from '@orisirisi/coinflip';
import { useEffect, useState } from 'react';
import { ProofOfChance } from '@orisirisi/proof-of-chance';

type PlayGameForm = CoinSideForm & ChanceForm;

export function PlayGameSection({ game }: { game: CoinflipGame | null }) {
  const formMethods = useForm<PlayGameForm>();
  const { formState, getValues, trigger: triggerValidation } = formMethods;
  const [proofOfChance, setProofOfChance] = useState<ProofOfChance | null>(
    null
  );

  const { stepCount, formSteps, isFirstStep, goToNextStep, goToPreviousStep } =
    useFormSteps<PlayGameForm>();

  const playGameFormSteps = formSteps
    .addStep(
      ['coinSide'],
      game && (
        <CoinSideFormSection disabledCoinSide={game.unavailable_coin_side} />
      )
    )
    .addStep(
      ['chance'],
      <ChanceFormSection
        stepCount={stepCount}
        proofOfChance={proofOfChance}
        setProofOfChance={setProofOfChance}
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

  const playGame = async ({ coinSide }: PlayGameForm) => {
    //TODO: Remove this hack
    if (!formMethods.getValues('isProofOfChanceDownloaded')) {
      return formMethods.setError('isProofOfChanceDownloaded', {
        message: 'Your proof of chance must be downloaded first.',
      });
    }

    const { ok: signer, error } = await currentWeb3Account!.getSigner();

    // TODO: Do something with error here
    const coinflipContract = CoinflipContract.fromSignerAndChain(
      signer!,
      currentChain!.id
    );

    const awaitingApprovalToastId = toast.loading('Awaiting approval', {
      position: 'bottom-right',
    });

    try {
      const transaction = await coinflipContract.playGame(
        game!.id,
        coinSide,
        await proofOfChance!.getProofOfChance(),
        { value: parseEther(game!.wager.toString()) }
      );
      await transaction.wait(Transaction.STANDARD_CONFIRMATION_COUNT);

      toast.dismiss(awaitingApprovalToastId);

      toast.loading('Creating your Game Play', {
        position: 'bottom-right',
        duration: COINFLIP_INDEX_GRACE_PERIOD,
      });

      setTimeout(() => {
        toast.success('Game play successfully created!', {
          position: 'bottom-right',
        });
        push(`/games/${game!.id}?chain=${game!.getChain().getName()}`);
      }, COINFLIP_INDEX_GRACE_PERIOD);
    } catch (e) {
      switch (Web3ProviderError.from(e).code) {
        case Web3ProviderErrorCode.UserRejected:
          toast.dismiss(awaitingApprovalToastId);
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
