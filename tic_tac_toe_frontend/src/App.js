import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

/**
 * TicTacToeGameFlow (core logic, reusable)
 * Contract:
 * - Inputs:
 *   - board: Array(9) of "X" | "O" | null
 * - Outputs:
 *   - winner: "X" | "O" | null
 *   - winningLine: number[] | null (indexes of the 3 winning squares)
 *   - isDraw: boolean (true when board full and no winner)
 * - Invariants:
 *   - board.length === 9
 *   - board contains only null, "X", "O"
 * - Errors:
 *   - throws Error if invariants are violated (caller bug)
 */

// PUBLIC_INTERFACE
function App() {
  /** UI state (adapter/orchestration layer for the flow) */
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [nextPlayer, setNextPlayer] = useState("X"); // "X" | "O"
  const [isGameOver, setIsGameOver] = useState(false);

  const outcome = useMemo(() => evaluateBoardOutcome(board), [board]);

  // Keep "game over" derived state consistent and traceable.
  useEffect(() => {
    const overNow = Boolean(outcome.winner) || outcome.isDraw;
    setIsGameOver(overNow);
  }, [outcome.winner, outcome.isDraw]);

  const statusText = useMemo(() => {
    if (outcome.winner) return `Winner: ${outcome.winner}`;
    if (outcome.isDraw) return "Draw — no more moves";
    return `Turn: ${nextPlayer}`;
  }, [outcome.winner, outcome.isDraw, nextPlayer]);

  const handleSquareClick = useCallback(
    (index) => {
      // Boundary validation (UI entry layer).
      if (!Number.isInteger(index) || index < 0 || index > 8) {
        // eslint-disable-next-line no-console
        console.error("[TicTacToeGameFlow] Invalid square index", { index });
        return;
      }
      if (isGameOver) return;

      // Apply the move and toggle player as one atomic update to prevent
      // toggling turns on illegal clicks (e.g., clicking an occupied square).
      setBoard((prevBoard) => {
        // Prevent overwriting moves.
        if (prevBoard[index] !== null) return prevBoard;

        const nextBoard = prevBoard.slice();
        nextBoard[index] = nextPlayer;

        // Toggle player only when the move is actually committed.
        setNextPlayer((prev) => (prev === "X" ? "O" : "X"));
        return nextBoard;
      });
    },
    [isGameOver, nextPlayer]
  );

  const resetGame = useCallback(() => {
    // eslint-disable-next-line no-console
    console.info("[TicTacToeGameFlow] resetGame()");
    setBoard(createEmptyBoard());
    setNextPlayer("X");
    setIsGameOver(false);
  }, []);

  return (
    <div className="App">
      <main className="ttt-shell" aria-label="Tic Tac Toe">
        <header className="ttt-header">
          <div className="ttt-brand">
            <h1 className="ttt-title">Tic‑Tac‑Toe</h1>
            <p className="ttt-subtitle">Two players • Same device</p>
          </div>

          <section className="ttt-status" aria-live="polite" aria-atomic="true">
            <div className="ttt-statusLabel">Game status</div>
            <div
              className={
                "ttt-statusValue" +
                (outcome.winner
                  ? " is-winner"
                  : outcome.isDraw
                  ? " is-draw"
                  : "")
              }
            >
              {statusText}
            </div>
          </section>
        </header>

        <section className="ttt-boardWrap" aria-label="Game board">
          <Board
            board={board}
            onSquareClick={handleSquareClick}
            winningLine={outcome.winningLine}
            disabled={isGameOver}
          />
        </section>

        <footer className="ttt-controls">
          <button className="ttt-button" onClick={resetGame} type="button">
            New game
          </button>

          <div className="ttt-hint">
            {outcome.winner || outcome.isDraw ? (
              <span>Tap “New game” to play again.</span>
            ) : (
              <span>
                Tip: X starts. First to connect three wins.
              </span>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}

/**
 * UI Component: Board
 * Contract:
 * - board: Array(9) of "X" | "O" | null
 * - winningLine: number[] | null
 * - disabled: boolean (disables all buttons)
 * - onSquareClick(index:number): void
 */
function Board({ board, onSquareClick, winningLine, disabled }) {
  const winningSet = useMemo(() => {
    if (!winningLine) return null;
    return new Set(winningLine);
  }, [winningLine]);

  return (
    <div className="ttt-board" role="grid" aria-label="3 by 3 grid">
      {board.map((value, idx) => {
        const isWinning = Boolean(winningSet?.has(idx));
        const ariaLabel =
          value === null ? `Empty square ${idx + 1}` : `Square ${idx + 1}: ${value}`;

        return (
          <button
            key={idx}
            type="button"
            className={"ttt-square" + (isWinning ? " is-winning" : "")}
            onClick={() => onSquareClick(idx)}
            disabled={disabled || value !== null}
            aria-label={ariaLabel}
            role="gridcell"
          >
            <span className="ttt-mark" aria-hidden="true">
              {value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Core logic helpers (domain layer) */
function createEmptyBoard() {
  return Array.from({ length: 9 }, () => null);
}

function assertValidBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) {
    throw new Error("Invalid board: expected an array of length 9.");
  }
  for (const cell of board) {
    if (!(cell === null || cell === "X" || cell === "O")) {
      throw new Error("Invalid board: cells must be null, 'X', or 'O'.");
    }
  }
}

function evaluateBoardOutcome(board) {
  assertValidBoard(board);

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diags
  ];

  for (const [a, b, c] of lines) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { winner: v, winningLine: [a, b, c], isDraw: false };
    }
  }

  const isDraw = board.every((c) => c !== null);
  return { winner: null, winningLine: null, isDraw };
}

export default App;
