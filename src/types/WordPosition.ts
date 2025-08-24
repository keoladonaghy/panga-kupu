/**
 * WordPosition class to uniquely identify words in the crossword
 * This completely eliminates the "three letter problem" by giving each word a unique ID
 */
export class WordPosition {
  public readonly id: string;
  public readonly word: string;
  public readonly startRow: number;
  public readonly startCol: number;
  public readonly direction: 'across' | 'down';
  public readonly length: number;
  public readonly number: number; // Word number for display
  public readonly occupiedCells: Array<{ row: number; col: number }>;

  constructor(
    word: string,
    startRow: number,
    startCol: number,
    direction: 'across' | 'down',
    wordNumber: number
  ) {
    this.word = word;
    this.startRow = startRow;
    this.startCol = startCol;
    this.direction = direction;
    this.length = word.length;
    this.number = wordNumber;
    
    // Create unique ID: DIRECTION_ROW-COL_LENGTH_NUMBER
    this.id = `${direction.toUpperCase()}_${startRow}-${startCol}_${this.length}_${wordNumber}`;
    
    // Calculate all cells this word occupies
    this.occupiedCells = [];
    for (let i = 0; i < this.length; i++) {
      if (direction === 'across') {
        this.occupiedCells.push({ row: startRow, col: startCol + i });
      } else {
        this.occupiedCells.push({ row: startRow + i, col: startCol });
      }
    }
  }

  /**
   * Check if this word contains a specific cell
   */
  containsCell(row: number, col: number): boolean {
    return this.occupiedCells.some(cell => cell.row === row && cell.col === col);
  }

  /**
   * Get the letter at a specific position within the word
   * Returns null if the cell is not part of this word
   */
  getLetterAtCell(row: number, col: number): string | null {
    const cellIndex = this.occupiedCells.findIndex(cell => cell.row === row && cell.col === col);
    if (cellIndex === -1) return null;
    return this.word[cellIndex].toUpperCase();
  }

  /**
   * Check if this word starts at a specific position
   */
  startsAt(row: number, col: number): boolean {
    return this.startRow === row && this.startCol === col;
  }

  /**
   * Get display info for debugging
   */
  toString(): string {
    return `${this.id}: "${this.word}" at (${this.startRow},${this.startCol}) ${this.direction}`;
  }
}