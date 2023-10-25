export interface Game {
  id: number;
  max_play_count: number;
  expiry_timestamp: number;
}

export class Games {
  static async fetch(): Promise<Game[]> {
    const response = await fetch('http://127.0.0.1:4446/coinflip/games');
    const games = response.json();

    return games;
  }
}
