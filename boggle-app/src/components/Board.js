import React from 'react';
import './Board.css';

function Board({ board, hidden }) {
  if (hidden || !board || board.length === 0) {
    return (
      <div className="Board-div placeholder">
        <div className="placeholder-text">Click Start to show the board</div>
      </div>
    );
  }

  const size = board.length;
  return (
    <div className="Board-div">
      <div className="board-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.flatMap((row, y) => row.map((cell, x) => (
          <div className="Tile" key={`${y}-${x}`}>
            <div className="tile-paper">{cell}</div>
          </div>
        )))}
      </div>
    </div>
  );
}

export default Board;
