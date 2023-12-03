import { Countdown } from '@orisirisi/orisirisi-data-utils';
import { useEffect, useState } from 'react';

export function GameExpiryCountdown({ countdown }: { countdown: Countdown }) {
  return (
    <>
      {padDigit(countdown.daysLeft)}d : {padDigit(countdown.hoursLeft)}h :{' '}
      {padDigit(countdown.minutesLeft)}m : {padDigit(countdown.secondsLeft)}s
      left
    </>
  );
}
export function useGameExpiryCountdown(gameExpiryTimestamp: number) {
  const [countDown, setCountDown] = useState(
    Countdown.getNext(gameExpiryTimestamp)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountDown((previousCountdown) => ({
        ...previousCountdown,
        ...Countdown.getNext(gameExpiryTimestamp),
      }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameExpiryTimestamp]);

  return countDown;
}
const padDigit = (digit: number) => digit.toString().padStart(2, '0');
