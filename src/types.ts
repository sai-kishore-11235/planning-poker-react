export interface Player {
  id: string;
  name: string;
  vote: string | null;
}

export interface GameState {
  players: Player[];
  revealed: boolean;
  story: string;
}
