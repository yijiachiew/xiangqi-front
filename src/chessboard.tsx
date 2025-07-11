import React from 'react';
import axios from 'axios';
import { ChessPiece } from './chessPiece';
const API_URL = "http://127.0.0.1:8000";

interface GameState {

}

const RenderChessBoard = () => {
  
  // Event handlers
  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    e.dataTransfer.setData("PieceId", pieceId);
  }
  const handleDragOver = (e:React.DragEvent) => {
    e.preventDefault();
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
      Array.from({ length: 9 }).map((_, col) => (
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
        >
          {/* Optional: render pieces, move highlights, etc. */}
          {row === 0 && (
  <span className="piece-marker">
    <span className="piece-text"
    style ={{
      color: "red",
    }}
    >馬</span>
  </span>
)}
        </div>
      ))
    )}
  </div>
      </div>
      </div>
      )

}

export default RenderChessBoard;