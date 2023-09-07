import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ArrowDownTrayIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { countWords } from '@orisirisi/orisirisi-data-utils';
import { InsideFormShellButton } from './common-buttons';
import { FormSectionShell } from './form-section-shell';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { Browser } from '@orisirisi/orisirisi-browser';
import { useSetGoToNextFormStepHandler } from '../form-steps';

export interface ProofOfChanceForm {
  proofOfChance: string;
  isProofOfChanceDownloaded: boolean;
}

interface ProofOfChanceFormSectionProps {
  stepCount: number;
  goToNextStep: () => void;
}

export function ProofOfChanceFormSection({
  stepCount,
  goToNextStep,
}: ProofOfChanceFormSectionProps) {
  const {
    register,
    watch,
    setError,
    clearErrors,
    setValue,
    getValues,
    formState,
    trigger,
  } = useFormContext<ProofOfChanceForm>();

  const proofOfChanceErrorMessage = () =>
    formState.errors['proofOfChance']?.message as string;
  const isProofOfChanceDownloadedErrorMessage = () =>
    formState.errors['isProofOfChanceDownloaded']?.message as string;
  const errorMessage = () =>
    proofOfChanceErrorMessage() || isProofOfChanceDownloadedErrorMessage();

  const proofOfChance = watch('proofOfChance');
  const isProofOfChanceDownloaded = watch('isProofOfChanceDownloaded');
  const wordsLeft = 32 - countWords(proofOfChance);
  const disableDownloadButton = !proofOfChance || isProofOfChanceDownloaded;

  const triggerAllValidations = async () => {
    await trigger('proofOfChance');

    if (!getValues('isProofOfChanceDownloaded')) {
      setError('isProofOfChanceDownloaded', {
        message: 'Proof of Chance must be downloaded',
      });
    }
  };

  const maybeGoToNextStep = async () => {
    await triggerAllValidations();

    if (!errorMessage()) {
      return goToNextStep();
    }
  };

  useSetGoToNextFormStepHandler(stepCount, maybeGoToNextStep);

  return (
    <FormSectionShell
      title="Create your chance"
      tip={
        <span>
          The chance<i>(text)</i> you type here will be mixed with the chances
          of other players' to determine the outcome so generate and edit until
          you feel really lucky! Good luck!{' '}
          <FaceSmileIcon className="h-4 mb-1 inline" />
        </span>
      }
    >
      <div className="flex flex-col mt-4">
        <textarea
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              maybeGoToNextStep();

              e.stopPropagation();
              e.preventDefault();
            }
          }}
          className="bg-transparent resize-none border-2 border-white p-4 rounded-xl text-sm tracking-wide"
          {...(wordsLeft === 0 ? { maxLength: 0 } : {})}
          rows={7}
          cols={40}
          {...register('proofOfChance', {
            required: 'Proof of chance must contain a character',
            onChange: async () => {
              formState.touchedFields['proofOfChance'] &&
                (await trigger('proofOfChance'));
              if (isProofOfChanceDownloaded) {
                setValue('isProofOfChanceDownloaded', false);
              }
            },
          })}
        />
        <div className="flex flex-row-reverse">
          <i className="mt-1 text-sm">Words left: {wordsLeft}</i>
        </div>
        <ErrorMessageParagraph
          className="mt-2 text-sm"
          message={errorMessage()}
        />
        <InsideFormShellButton
          disabled={disableDownloadButton}
          className="mt-8 bg-white text-black hover:bg-slate-100"
          label="Download Proof of Chance"
          icon={<ArrowDownTrayIcon className="h-5" />}
          onClick={async () => {
            Browser.downloadTextFile(
              proofOfChance,
              `coinflip-${new Date().toISOString()}`,
              'poc'
            );
            setValue('isProofOfChanceDownloaded', true);
            clearErrors('isProofOfChanceDownloaded');
          }}
        />
      </div>
    </FormSectionShell>
  );
}
