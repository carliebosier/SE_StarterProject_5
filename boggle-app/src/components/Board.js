import React, { useState, useEffect } from 'react';
import './Board.css';

function Board({ board, hidden }) {
  const [boardSize, setBoardSize] = useState(400);
  const [fontSize, setFontSize] = useState('1.25rem');
  const [gridGap, setGridGap] = useState(8);

  useEffect(() => {
    if (hidden || !board || board.length === 0) {
      return;
    }

    const calculateBoardSize = () => {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Use a more conservative approach: reserve 50% of viewport for other content
      // This ensures the board always fits, even on smaller screens
      const reservedHeight = viewportHeight * 0.5;
      const availableHeight = viewportHeight - reservedHeight;
      
      // Available width: use 85% of viewport width, but cap at 700px
      // Subtract padding (20px on each side = 40px total)
      const availableWidth = Math.min(viewportWidth * 0.85, 700) - 40;
      
      // Use the smaller dimension to ensure the square grid fits completely
      let maxSize = Math.min(availableHeight, availableWidth);
      
      // Apply reasonable bounds: minimum 200px, maximum 600px
      maxSize = Math.max(200, Math.min(maxSize, 600));
      
      setBoardSize(maxSize);
      
      // Calculate responsive font size based on tile size
      const gridSize = board.length;
      const tileSize = maxSize / gridSize;
      
      // Font size: 35% of tile size, but clamp between 10px and 24px
      // Larger grids get smaller fonts, smaller grids get larger fonts
      const calculatedFontSize = Math.max(10, Math.min(tileSize * 0.35, 24));
      setFontSize(`${calculatedFontSize}px`);
      
      // Grid gap: scale with board size, but keep it reasonable (4px to 12px)
      const calculatedGap = Math.max(4, Math.min(maxSize * 0.02, 12));
      setGridGap(calculatedGap);
    };

    // Calculate immediately
    calculateBoardSize();
    
    // Recalculate on resize with debounce
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateBoardSize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [board, hidden]);

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
      <div 
        className="board-grid" 
        style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          gap: `${gridGap}px`,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        {board.flatMap((row, y) => row.map((cell, x) => (
          <div className="Tile" key={`${y}-${x}`}>
            <div className="tile-paper" style={{ fontSize: fontSize }}>{cell}</div>
          </div>
        )))}
      </div>
    </div>
  );
}

export default Board;
