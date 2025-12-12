import React from 'react';
import axios from 'axios';
import RenderPiece, { ChessPiece, Player } from './chessPiece';
const API_URL = "http://127.0.0.1:8000";

interface GameState {
    pieces:ChessPiece[];
    playerTurn:Player;
    isCheckmate:boolean;
    isStalemate:boolean;
    isCheck:boolean;
}

const RenderChessBoard = () => {
  // Render the chess
  const initialState:ChessPiece[] = [
    //Red pieces
    { id: 'r_chariot_1', type: 'chariot', player: 'red', x: 0, y: 9 },
    { id: 'r_horse_1', type: 'horse', player: 'red', x: 1, y: 9 },
    { id: 'r_elephant_1', type: 'elephant', player: 'red', x: 2, y: 9 },
    { id: 'r_advisor_1', type: 'advisor', player: 'red', x: 3, y: 9 },
    { id: 'r_general_1', type: 'general', player: 'red', x: 4, y: 9 },
    { id: 'r_advisor_2', type: 'advisor', player: 'red', x: 5, y: 9 },
    { id: 'r_elephant_2', type: 'elephant', player: 'red', x: 6, y: 9 },
    { id: 'r_horse_2', type: 'horse', player: 'red', x: 7, y: 9 },
    { id: 'r_chariot_2', type: 'chariot', player: 'red', x: 8, y: 9 },
    { id: 'r_cannon_1', type: 'cannon', player: 'red', x: 1, y: 7 },
    { id: 'r_cannon_2', type: 'cannon', player: 'red', x: 7, y: 7 },
    { id: 'r_soldier_1', type: 'soldier', player: 'red', x: 0, y: 6 },
    { id: 'r_soldier_2', type: 'soldier', player: 'red', x: 2, y: 6 },
    { id: 'r_soldier_3', type: 'soldier', player: 'red', x: 4, y: 6 },
    { id: 'r_soldier_4', type: 'soldier', player: 'red', x: 6, y: 6 },
    { id: 'r_soldier_5', type: 'soldier', player: 'red', x: 8, y: 6 },
    // Black pieces
    { id: 'b_chariot_1', type: 'chariot', player: 'black', x: 0, y: 0 },
    { id: 'b_horse_1', type: 'horse', player: 'black', x: 1, y: 0 },
    { id: 'b_elephant_1', type: 'elephant', player: 'black', x: 2, y: 0 },
    { id: 'b_advisor_1', type: 'advisor', player: 'black', x: 3, y: 0 },
    { id: 'b_general_1', type: 'general', player: 'black', x: 4, y: 0 },
    { id: 'b_advisor_2', type: 'advisor', player: 'black', x: 5, y: 0 },
    { id: 'b_elephant_2', type: 'elephant', player: 'black', x: 6, y: 0 },
    { id: 'b_horse_2', type: 'horse', player: 'black', x: 7, y: 0 },
    { id: 'b_chariot_2', type: 'chariot', player: 'black', x: 8, y: 0 },
    { id: 'b_cannon_1', type: 'cannon', player: 'black', x: 1, y: 2 },
    { id: 'b_cannon_2', type: 'cannon', player: 'black', x: 7, y: 2 },
    { id: 'b_soldier_1', type: 'soldier', player: 'black', x: 0, y: 3 },
    { id: 'b_soldier_2', type: 'soldier', player: 'black', x: 2, y: 3 },
    { id: 'b_soldier_3', type: 'soldier', player: 'black', x: 4, y: 3 },
    { id: 'b_soldier_4', type: 'soldier', player: 'black', x: 6, y: 3 },
    { id: 'b_soldier_5', type: 'soldier', player: 'black', x: 8, y: 3 },

  ]
  //State handlers
  const [pieces, setPieces] = React.useState<ChessPiece[]>(initialState);
  // Event handlers
  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    console.log("Dragging piece:", pieceId);
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) {
      console.error("Piece not found:", pieceId);
      return;
    }
    e.dataTransfer.setData("PieceId", pieceId);
  }
  const handleDragOver = (e:React.DragEvent) => {
    e.preventDefault();
  }
  const handleDrop = (e: React.DragEvent, x:number, y:number) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("PieceId");
    console.log(`Dropping piece ${pieceId} at (${x}, ${y})`);
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) {
      console.error("Piece not found:", pieceId);
      return;
    }
    // Update piece position
    const updatedPieces = pieces.map(p => {
      if (p.id === pieceId) {
        return { ...p, x, y };
      }
      return p;
    });
    setPieces(updatedPieces);
  }
  // Render the chessboard grid here
    return (
      <div className="page-wrapper">
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
      </div>
      )

}

export default RenderChessBoard;