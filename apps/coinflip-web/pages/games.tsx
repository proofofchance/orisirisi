import { useEffect, useState } from 'react';
import { CoinflipGame, CoinflipGames } from '@orisirisi/coinflip';

export function GamesPage() {
  const games = useCoinflipGames();

  return (
    <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {games.map((game, i) => (
        <GameCard game={game} key={i} />
      ))}
    </div>
  );
}

function GameCard({ game }: { game: CoinflipGame }) {
  return (
    <div className="rounded-lg h-64 bg-[rgba(0,0,0,0.25)] p-4">
      <div>#{game.id}</div>
      <div>
        <h4>Win SomeAmountHere</h4>
      </div>
      <div>
        <div></div>
        <div>Expires in </div>
      </div>
    </div>
  );
}

export default GamesPage;

function useCoinflipGames() {
  const [games, setGames] = useState<CoinflipGame[]>([]);

  useEffect(() => {
    CoinflipGames.fetch().then((games) => setGames(games));
  }, []);

  return games;
}
