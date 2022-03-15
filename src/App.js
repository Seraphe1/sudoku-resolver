import { useMemo, useState } from 'react';

import {checkErrors, sudokuResolver} from './helpers/sudoku-resolver.helper';
import {exampleToResolve1} from './constants/common.const';
import './App.scss';


const MINIMUM_NUMBER_OF_SQUARE_TO_BE_FILLED = 33;


function App() {

  const [sudokuArray, setSudokuArray] = useState(buildEmptySudokuArray());
  const [numberOfFilledSquares, setnumberOfFilledSquares] = useState(0);

  const handleKeyDown = event => {
    // Called each time a key is pressed inside an input (square)
    if (!/^([1-9]|Backspace|Delete|Tab)$/.test(event.key)) {
      // If key entered is not a number or del, etc, event is cancelled
      event.preventDefault();
    }
  }

  const changeSquare = (changedSquare, event) => {
    // Called each time an input is changed

    // First we clean the value to prevent multiple numbers
    const cleanedValue = event.target.value.slice(0, 1);

    // Next prepare the updated array with new value
    const clonedSudokuArray = sudokuArray.map(i => [...i.map(j => ({...j, error: false}))]);
    clonedSudokuArray[changedSquare.rowIndex][changedSquare.columnIndex].val = cleanedValue;
    clonedSudokuArray[changedSquare.rowIndex][changedSquare.columnIndex].manuallyFilled = cleanedValue !== '';

    // Then set error if needed
    checkErrors(clonedSudokuArray);

    // And count numberOfSquaresFilled
    setnumberOfFilledSquares(clonedSudokuArray.reduce((total, r) => total + r.filter(i => i.val).length, 0));

    // Finally update array
    setSudokuArray(clonedSudokuArray);
  };

  const autoFill = () => {

    // Only one example currently ; the first one from email
    const clonedSudokuArray = sudokuArray.map(i => [...i.map(j => ({...j, error: false}))]);

    exampleToResolve1.forEach(({val, columnIndex, rowIndex}) => {
      clonedSudokuArray[rowIndex][columnIndex].val = val;
      clonedSudokuArray[rowIndex][columnIndex].manuallyFilled = true;
    });

    setSudokuArray(clonedSudokuArray);
  };

  

  const resetSudoku = () => setSudokuArray(buildEmptySudokuArray());


  const resolveSudoku = () => setSudokuArray(sudokuResolver(sudokuArray));

  const buttonDisabled = useMemo(() => sudokuArray
    .reduce((total, current) => total + current.filter(i => i.val !== null).length, 0) < MINIMUM_NUMBER_OF_SQUARE_TO_BE_FILLED
    || sudokuArray.some(r => r.some(c => c.error)), [sudokuArray]);



  return (
    <form noValidate>
    <div className='App'>
      <header className='App-header'>
        <div>Sudautoku</div>
      </header>
      <main className='App-main'>
        <div className='App-main-title'>Fill at least {MINIMUM_NUMBER_OF_SQUARE_TO_BE_FILLED} squares then hit Resolve !</div>
        <div className='App-main-actions mini'>(Or <button tabIndex={sudokuArray.length * sudokuArray.length + 4} className="btn-tertiary" onClick={() => autoFill()}>autofill with example</button>)</div>
        <div className='App-main-sudoku-container'>
          
          {
          sudokuArray.map((i, index) => <div key={index} className="App-main-sudoku-row">{
            i.map((j, jIndex) => <div key={jIndex} className={'App-main-sudoku-square' + (j.error ? ' error' : '') + (j.manuallyFilled ? ' manuallyFilled' : j.val ? ' autoFilled' : '')}>
                                            <input size="0"
                                                   value={j.val ?? ''}
                                                   type="number"
                                                   onKeyDown={e => handleKeyDown(e)}
                                                   onChange={e => changeSquare(j, e)}
                                                   readOnly={j.readOnly}
                                                   tabIndex={index * sudokuArray.length + jIndex + 1}

                                                   />
                                          </div>)}
                                        </div>)}
          <div className="App-main-sudoku-container-subtitle">{numberOfFilledSquares ? `${MINIMUM_NUMBER_OF_SQUARE_TO_BE_FILLED - numberOfFilledSquares} left` : ' '}</div>
        </div>
        
        <div className="App-main-actions">
          <button className="btn-primary"
                  disabled={buttonDisabled}
                  onClick={() => resolveSudoku()}
                  tabIndex={sudokuArray.length * sudokuArray.length + 2}
                  >Resolve</button>

          <button className="btn-secondary"
                  onClick={() => resetSudoku()}
                  tabIndex={sudokuArray.length * sudokuArray.length + 3}>Reset grid</button>
        </div>
        
      </main>
    </div>
    </form>
  );

}


function buildEmptySudokuArray() {
  return Array(9)
          .fill(0)
          .map((row, rowIndex) => Array(9)
                                    .fill(0)
                                    .map((column, columnIndex) => ({
                                      val: null,
                                      rowIndex,
                                      columnIndex,
                                      error: false,
                                      readOnly: false
                                    })));
}




export default App;
