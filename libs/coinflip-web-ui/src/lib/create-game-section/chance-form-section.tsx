import { useFormContext } from 'react-hook-form';
import { ArrowDownTrayIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import {
  countCharacters,
  isAsciiString,
  isEmptyString,
} from '@orisirisi/orisirisi-data-utils';
import { InsideFormShellButton } from './common-buttons';
import { FormSectionShell } from './form-section-shell';
import { ErrorMessageParagraph } from './error-message-paragraph';
import { Browser } from '@orisirisi/orisirisi-browser';
import { useSetSubmitFormStepHandler } from '../form-steps';
import { TextInput } from '@orisirisi/orisirisi-web-ui';
import { ProofOfChance } from '../proof-of-chance';
import { useEffect } from 'react';

export interface ChanceForm {
  chance: string;
  isProofOfChanceDownloaded: boolean;
}

interface ChanceFormSectionProps {
  stepCount: number;
  onSubmit?: () => void;
  proofOfChance: ProofOfChance | null;
  setProofOfChance: (proofOfChance: ProofOfChance) => void;
}

export function ChanceFormSection({
  stepCount,
  onSubmit,
  proofOfChance,
  setProofOfChance,
}: ChanceFormSectionProps) {
  const {
    register,
    watch,
    setError,
    clearErrors,
    setValue,
    getValues,
    formState,
    trigger,
  } = useFormContext<ChanceForm>();

  const chanceErrorMessage = () =>
    formState.errors['chance']?.message as string;
  const isProofOfChanceDownloadedErrorMessage = () =>
    formState.errors['isProofOfChanceDownloaded']?.message as string;
  const errorMessage = () =>
    chanceErrorMessage() || isProofOfChanceDownloadedErrorMessage();

  const chance = watch('chance');
  const isProofOfChanceDownloaded = watch('isProofOfChanceDownloaded');
  const disableDownloadButton =
    !!chanceErrorMessage() || isProofOfChanceDownloaded;

  const CHANCE_MAX_LENGTH = ProofOfChance.CHANCE_MAX_LENGTH;
  const charactersLeft = CHANCE_MAX_LENGTH - countCharacters(chance);

  useEffect(() => {
    if (chance) setProofOfChance(ProofOfChance.fromChance(chance));
  }, [chance, setProofOfChance]);

  const triggerAllValidations = async () => {
    await trigger('chance');

    if (!getValues('isProofOfChanceDownloaded')) {
      setError('isProofOfChanceDownloaded', {
        message: 'Your proof of chance must be downloaded first.',
      });
    }
  };

  const maybeSubmit = async () => {
    await triggerAllValidations();

    if (!errorMessage()) {
      return onSubmit?.();
    }
  };

  useSetSubmitFormStepHandler(stepCount, maybeSubmit);

  const validate = (chance: string) => {
    if (isEmptyString(chance)) {
      return 'Proof of chance must contain a character';
    }

    if (!isAsciiString(chance)) {
      return 'Only ASCII characters are allowed';
    }

    return true;
  };
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
      <div className="flex mt-4">
        <div className="mt-7 flex justify-center items-center border-2 border-white rounded-full">
          <TextInput
            autoComplete="off"
            placeholder={`I am about to get lucky`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                maybeSubmit();

                e.stopPropagation();
                e.preventDefault();
              }
            }}
            maxLength={CHANCE_MAX_LENGTH}
            className="w-[320px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg placeholder-opacity-5"
            {...register('chance', {
              validate,
              onChange: async () => {
                formState.touchedFields['chance'] && (await trigger('chance'));
                if (isProofOfChanceDownloaded) {
                  setValue('isProofOfChanceDownloaded', false);
                }
              },
            })}
          />
          <InsideFormShellButton
            disabled={disableDownloadButton}
            className=" bg-white text-black hover:bg-slate-100 rounded-bl-none rounded-tl-none w-36 text-sm"
            label="Download"
            icon={<ArrowDownTrayIcon className="h-5" />}
            onClick={async () => {
              Browser.downloadFile(
                await proofOfChance!.toFileContent(),
                `coinflip-${new Date().toISOString()}-poc`,
                // .txt instead of .poc to allow users easily open it after downloading
                'txt'
              );
              setValue('isProofOfChanceDownloaded', true);
              clearErrors('isProofOfChanceDownloaded');
            }}
          />
        </div>
      </div>

      <div className="flex flex-row-reverse">
        <i className="mt-1 text-sm">
          Available characters left: {charactersLeft}
        </i>
      </div>
      <ErrorMessageParagraph
        className="mt-2 text-sm"
        message={errorMessage()}
      />
    </FormSectionShell>
  );
}
