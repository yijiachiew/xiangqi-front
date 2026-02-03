import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RenderChessBoard from './chessboard';
import { GameState } from './gameState';
import { ChessPiece, Player, PieceType } from './chessPiece';

const API_URL = "http://localhost:8080/api/game";

const GameBoard = () => {
  // State handlers
  const [pieces, setPieces] = useState<ChessPiece[]>([]); 
  const [availableMoves, setAvailableMoves] = useState<{x: number, y: number}[]>([]); 
  const [playerTurn, setPlayerTurn] = useState<Player>('red'); 
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false); 
  const [isGameOver, setIsGameOver] = useState<boolean>(false); 
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isStalemate, setIsStalemate] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string | null>(null);

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
    console.log("Game state updated:", newState);
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

  async function handleMove(source: {x: number, y: number}, target: {x: number, y: number}) {
    const sourceSquare = indexToSquare(source.y, source.x);
    const targetSquare = indexToSquare(target.y, target.x);
    // Sends "y1x1y2x2" (e.g. "0010")
    await postStates(`${sourceSquare}${targetSquare}`);
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
      console.log("Undo move successful");
      console.log("Undo move data:", res.data);
    } catch (err) {
      console.error("Error undoing move:", err);
    }
  }

  return (
    <RenderChessBoard
        pieces={pieces}
        availableMoves={availableMoves}
        playerTurn={playerTurn}
        isCheckmate={isCheckmate}
        isGameOver={isGameOver}
        isCheck={isCheck}
        isStalemate={isStalemate}
        onGetMoves={getMoves}
        onClearMoves={() => setAvailableMoves([])}
        onMove={handleMove}
        onReset={resetBoard}
        onUndo={undoMove}
    />
  );
}

export default GameBoard;

