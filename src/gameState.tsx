export interface GameState {
    pieces: {
      id: string;
      x: number;
      y: number;
      type: string;
      player: string;
    }[];
    playerTurn: string;
    isGameOver: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    result: string | null;
}

