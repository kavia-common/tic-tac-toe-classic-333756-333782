import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders game title and initial turn status", () => {
  render(<App />);
  expect(screen.getByText(/tic‑tac‑toe/i)).toBeInTheDocument();
  expect(screen.getByText(/turn:\s*x/i)).toBeInTheDocument();
});

test("allows a player to place a mark on an empty square", () => {
  render(<App />);

  const emptySquare = screen.getByRole("button", { name: /empty square 1/i });
  fireEvent.click(emptySquare);

  // After first click, square should contain X (aria label changes to "Square 1: X")
  expect(screen.getByRole("button", { name: /square 1:\s*x/i })).toBeInTheDocument();
});
