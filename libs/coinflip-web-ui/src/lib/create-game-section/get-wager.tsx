import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { ChainCurrencyButton } from './get-wager/chain-currency-button';

export function GetWager() {
  const currentChain = useCurrentChain();

  return (
    <section className="text-center">
      <h2 className="mt-16 font-bold text-[28px] text-white tracking-wide">
        How much do you want to stake?
      </h2>

      <div className="mt-7 flex m-auto justify-center items-center w-[600px] border-2 border-white rounded-full px-2">
        <input className="w-[600px] text-white  border-none px-8 h-14 bg-transparent focus:outline-none" />
        <ChainCurrencyButton chain={currentChain!} />
      </div>
    </section>
  );
}
