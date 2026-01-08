

type PieceType = 'soldier' | 'cannon' | 'chariot' | 'horse' | 'elephant' | 'advisor' | 'general';
type Player = 'red' | 'black';
type ChessCharacter = '帥' | '仕' | '相' | '炮' | '兵' 
                        |'將'| '士'| '象' | '砲' | '卒'
                        | '車' | '馬';

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

function RenderPiece({ id, type, player, onDragStart }: ChessPieceProps){
    function renderCharacter({type,player}: {type: PieceType, player: Player}){
        const isRed = player === 'red';
        switch (type){
            case 'soldier':
                return isRed ? '兵' : '卒';
            case 'cannon':
                return isRed ? '炮' : '砲';
            case 'chariot':
                return '車';
            case 'horse':
                return '馬';
            case 'elephant':
                return isRed ? '相' : '象';
            case 'advisor':
                return isRed ? '仕' : '士';
            case 'general':
                return isRed ? '帥' : '將';
            default:
                break;
        }
    }
    return (
        <div
            className={`chess-piece ${type} ${player}`}
            draggable
            onDragStart={(e) => onDragStart(e, id)}
            style={{ position: 'absolute'}}
        >
        <span className="piece-marker">
            <span className="piece-text"
                style ={{
                color: player === 'red' ? 'red' : 'black',
                }}
                >{renderCharacter({type,player})}</span>
  </span>
        </div>
    );
}

export default RenderPiece;
export type { ChessPiece, PieceType, Player };