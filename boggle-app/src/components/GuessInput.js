import React, { useState } from 'react';
import './GuessInput.css';

function GuessInput({ allSolutions, foundSolutions, correctAnswerCallback }) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  const foundSet = new Set(foundSolutions.map(w => w.toLowerCase()));
  const validWordSet = new Set(allSolutions.map(w => w.toLowerCase()));

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) {
        setValue('');
        return;
      }

      if (foundSet.has(trimmed)) {
        setMessage(`Already found: "${trimmed}"`);
        setValue('');
        return;
      }

      if (!validWordSet.has(trimmed)) {
        setMessage(`Not found on this board: "${trimmed}"`);
        setValue('');
        return;
      }

      // Valid word found
      correctAnswerCallback(trimmed);
      setMessage(`Nice! ${trimmed} ✓`);
      setValue('');
    }
  }

  return (
    <div className="Guess-input">
      <label htmlFor="guess">Enter a word and press Enter</label>
      <input
        id="guess"
        className="text-input"
        type="text"
        placeholder="Your guess"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default GuessInput;
