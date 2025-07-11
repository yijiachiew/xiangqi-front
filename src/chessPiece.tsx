

type PieceType = 'soldier' | 'cannon' | 'chariot' | 'horse' | 'elephant' | 'advisor' | 'general';
type Player = 'red' | 'black';


interface ChessPiece {    
    id: string;
    type: PieceType;
    player: Player;
    x: number; // X coordinate on the board
    y: number; // Y coordinate on the board
}

interface ChessPieceProps {
    id: string;
    type: PieceType;
    player: Player;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

function RenderPiece({ id, type, player, onDragStart }: ChessPieceProps) {
    return (
        <div
            className={`chess-piece ${type} ${player}`}
            draggable
            onDragStart={(e) => onDragStart(e, id)}
            style={{ position: 'absolute', top: '0', left: '0' }}
        >
            {type}
        </div>
    );
}

export default RenderPiece;
export type { ChessPiece, PieceType, Player };