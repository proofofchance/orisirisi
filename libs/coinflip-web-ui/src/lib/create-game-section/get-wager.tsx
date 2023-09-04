import { useFormContext } from 'react-hook-form';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { DecimalInput } from '@orisirisi/orisirisi-web-ui';
import { ChainCurrencyButton } from './get-wager/chain-currency-button';

export function GetWager() {
  const { register } = useFormContext();

  const currentChain = useCurrentChain();

  return (
    <section className="text-center text-white">
      <h2 className="mt-16 font-bold text-[28px] tracking-wide">
        How much do you want to stake?
      </h2>

      <div className="mt-7 flex m-auto justify-center items-center w-[600px] border-2 border-white rounded-full px-2 ">
        <DecimalInput
          placeholder={'0.02'}
          className="w-[600px] border-none px-8 h-14 bg-transparent focus:outline-none tracking-wider text-lg"
          {...register('wager')}
        />
        <ChainCurrencyButton chain={currentChain!} />
      </div>

      {/* TODO: Show USD estimation here using Uniswap from Rust API */}
    </section>
  );
}
