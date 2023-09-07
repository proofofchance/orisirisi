import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ArrowDownTrayIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { countWords } from '@orisirisi/orisirisi-data-utils';
import { InsideFormShellButton } from './common-buttons';
import { FormSectionShell } from './form-section-shell';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { Browser } from '@orisirisi/orisirisi-browser';
import { useSetNextFormStepHandler } from '../form-steps';

export interface ProofOfChanceForm {
  proofOfChance: string;
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
    formState,
    trigger: triggerValidation,
  } = useFormContext<ProofOfChanceForm>();
  const proofOfChance = watch('proofOfChance');
  const wordsLeft = 32 - countWords(proofOfChance);
  const errorMessage = formState.errors['proofOfChance']?.message as string;

  const isValidProofOfChance = async () =>
    (await triggerValidation('proofOfChance')) && !errorMessage;

  const [isPocDownloaded, setIsPocDownloaded] = useState(false);
  const [showPocDownloadedErrorMessage, setShowPocDownloadedErrorMessage] =
    useState(false);

  const disableDownloadButton = !proofOfChance || isPocDownloaded;

  const handleGoingToNextStep = useCallback(async () => {
    if (isPocDownloaded && (await isValidProofOfChance())) {
      goToNextStep();
    } else if (!errorMessage) {
      setError('proofOfChance', {
        message: 'Proof of Chance must be downloaded',
      });
      setShowPocDownloadedErrorMessage(true);
    }
  }, [
    isPocDownloaded,
    errorMessage,
    setError,
    goToNextStep,
    isValidProofOfChance,
    setShowPocDownloadedErrorMessage,
  ]);

  useSetNextFormStepHandler(stepCount, handleGoingToNextStep);

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
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              await handleGoingToNextStep();
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
              await triggerValidation('proofOfChance');
              if (isPocDownloaded) {
                setIsPocDownloaded(false);
                setShowPocDownloadedErrorMessage(false);
              }
            },
          })}
        />
        <div className="flex flex-row-reverse">
          <i className="mt-1 text-sm">Words left: {wordsLeft}</i>
        </div>
        {showPocDownloadedErrorMessage && (
          <ErrorMessageParagraph
            className="mt-2 text-sm"
            message={errorMessage}
          />
        )}
        <InsideFormShellButton
          disabled={disableDownloadButton}
          className="mt-8 bg-white text-black hover:bg-slate-100"
          label="Download Proof of Chance"
          icon={<ArrowDownTrayIcon className="h-5" />}
          onClick={() => {
            Browser.downloadTextFile(
              proofOfChance,
              `coinflip-${new Date().toISOString()}`,
              'poc'
            );
            setIsPocDownloaded(true);
            setShowPocDownloadedErrorMessage(false);
          }}
        />
      </div>
    </FormSectionShell>
  );
}
