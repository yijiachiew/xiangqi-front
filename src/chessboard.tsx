import React, { useEffect } from 'react';
import axios from 'axios';
import RenderPiece, { ChessPiece, Player, PieceType } from './chessPiece';

const API_URL = "http://localhost:8080/api/game";

interface GameState {
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

const RenderChessBoard = () => {
  // State handlers
  const [pieces, setPieces] = React.useState<ChessPiece[]>([]); 
  const [availableMoves, setAvailableMoves] = React.useState<{x: number, y: number}[]>([]); 
  const [playerTurn, setPlayerTurn] = React.useState<Player>('red'); 
  const [isCheckmate, setIsCheckmate] = React.useState<boolean>(false); 
  const [isGameOver, setIsGameOver] = React.useState<boolean>(false); 
  const [isCheck, setIsCheck] = React.useState<boolean>(false);
  const [isStalemate, setIsStalemate] = React.useState<boolean>(false);
  const [gameResult, setGameResult] = React.useState<string | null>(null);

  useEffect(() => {
    fetchStates();
  }, []);

  function indexToSquare(x: number, y: number): string {
    // Return coordinates as string "xy" (integers without spaces)
    return `${x}${y}`;
  }

  async function fetchStates() {
    try {
      const res = await axios.get(`${API_URL}/board`);
      console.log("Connection to backend successful. Board state fetched:", res.data);
      const newState: GameState = res.data;
      updateGameState(newState);
    } catch (err) {
      console.error("Error fetching state:", err);
    }
  }

  function updateGameState(newState: GameState) {
    // Map backend pieces to frontend pieces
    const newPieces: ChessPiece[] = newState.pieces.map((p) => ({
      id: p.id,
      x: p.y, // Swap: backend y -> frontend x
      y: p.x, // Swap: backend x -> frontend y
      type: p.type as PieceType,
      player: p.player as Player,
    }));
    
    console.log("Updated pieces coordinates:", newPieces.map(p => ({ id: p.id, x: p.x, y: p.y })));

    setPieces(newPieces);
    setPlayerTurn(newState.playerTurn as Player);
    setIsCheckmate(newState.isCheckmate);
    setIsStalemate(newState.isStalemate);
    setIsCheck(newState.isCheck);
    setIsGameOver(newState.isGameOver);
    setGameResult(newState.result);
  }

  async function getMoves(piece: ChessPiece) {
    try {
      // Swap coordinates when sending to backend: frontend x -> backend y, frontend y -> backend x
      const res = await axios.get(`${API_URL}/legal_moves/${piece.y}/${piece.x}`);
      // Swap coordinates when receiving from backend: backend y -> frontend x, backend x -> frontend y
      const moves: {x: number, y: number}[] = res.data.map((m: {x: number, y: number}) => ({
          x: m.y,
          y: m.x
      }));
      setAvailableMoves(moves);
    } catch (err) {
      console.error("Error fetching moves:", err);
      setAvailableMoves([]);
    }
  }

  async function postStates(moveString: string) {
    try {
      const payload = { payload: moveString }; // Wrapper for backend @RequestBody GameRequest
      const res = await axios.post(`${API_URL}/move`, payload);
      updateGameState(res.data);
      setAvailableMoves([]);
    } catch (err: any) {
      console.error("Error posting move:", err);
      if (err.response) {
          console.error("Backend error response:", err.response.data);
          alert(`Move failed: ${JSON.stringify(err.response.data)}`);
      }
    }
  }

  async function resetBoard() {
    try {
      const res = await axios.post(`${API_URL}/reset`);
      updateGameState(res.data);
      setAvailableMoves([]);
    } catch (err) {
      console.error("Error resetting board:", err);
    }
  }

  async function undoMove() {
    try {
      const res = await axios.post(`${API_URL}/undo`);
      updateGameState(res.data);
      setAvailableMoves([]);
    } catch (err) {
      console.error("Error undoing move:", err);
    }
  }

  // Event handlers
  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    // console.log("Dragging piece:", pieceId);
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    // Only allow moving current player's pieces
    if (piece.player !== playerTurn) {
        // e.preventDefault(); // Prevents dragging, but might need to be done onDragStart logic in RenderPiece
        return;
    }

    e.dataTransfer.setData("PieceId", pieceId);
    getMoves(piece);
  }

  const handleDragOver = (e:React.DragEvent) => {
    e.preventDefault();
  }

  const handleDrop = (e: React.DragEvent, x:number, y:number) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("PieceId");
    const piece = pieces.find(p => p.id === pieceId);
    
    if (!piece) return;
    
    // Check if move is in available moves
    const isLegal = availableMoves.some(m => m.x === x && m.y === y);
    if (!isLegal) {
        console.log("Illegal move");
        setAvailableMoves([]);
        return;
    }

    const sourceSquare = indexToSquare(piece.y, piece.x);
    const targetSquare = indexToSquare(y, x);
    // Sends "y1x1y2x2" (e.g. "0010")
    postStates(`${sourceSquare}${targetSquare}`);
  }

  // Render the chessboard grid here
    return (
      <div className="page-wrapper">
        <div className="game-status">
            <h2>
                {isCheckmate ? `${playerTurn === "red" ? "Black" : "Red"} wins by Checkmate!` : 
                 isStalemate ? "Stalemate!" : 
                 isCheck ? "Check!" : 
                 isGameOver ? "Game Over!" : ""}
            </h2>
            <h2>
                {isGameOver ? "Game Over!" : (
                    <span style={{ color: playerTurn === "red" ? "red" : "black" }}>
                        {playerTurn === "red" ? "Red's Turn" : "Black's Turn"}
                    </span>
                )}
            </h2>
        </div>
      <div className="board-container" style={{position:"relative"}}>
        <div className="xiangqi-board">
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => {
          const isRiver = row === 4;
          const isPalace = (
          // Black palace: top 3 rows in center
          (row >= 0 && row <= 1 && col >= 3 && col <= 4) ||
          // Red palace: bottom 3 rows in center
          (row >= 7 && row <= 8 && col >= 3 && col <= 4)
          );

          let className = "cell";
          if (isRiver) className += " river";
          else if (isPalace) className += " palace";

          return <div key={`${row}-${col}`} className={className}></div>;
    })
  )}
      </div>
      {/* Front invisible grid layer */}
  <div className="front-layer">
    {Array.from({ length: 10 }).map((_, row) =>
      Array.from({ length: 9 }).map((_, col) => {
        // Check if there is a piece on this position
        const piece = pieces.find(p => p.x === col && p.y === row);
        // Check availability
        const isAvailableMove = availableMoves.some((m) => m.x === col && m.y === row);

        return(
        <div
          key={`cell-${row}-${col}`}
          className="invisible-cell"
          data-row={row}
          data-col={col}
          style={{
            position: "absolute",
            top: `${(row / 10) * 100}%`,
            left: `${(col / 9) * 100}%`,
            width: "calc(100% / 9)",
            height: "calc(100% / 10)",
            pointerEvents: "auto"
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col, row)}
        >
        {isAvailableMove && <div 
            style={{
                width: "15px",
                height: "15px",
                backgroundColor: "rgba(0, 255, 0, 0.5)",
                borderRadius: "50%",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none"
            }}
        ></div>}
        {piece && (<RenderPiece
            id={piece.id}
            type={piece.type}
            player={piece.player}
            onDragStart={handleDragStart}
        />
        )}
        </div>
      )})
    )}
  </div>
      </div>
      <div className="controls">
          <button onClick={resetBoard}>Reset Game</button>
          <button onClick={undoMove}>Undo Move</button>
      </div>
      </div>
      )

}

export default RenderChessBoard;