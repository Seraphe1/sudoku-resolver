function sudokuResolver(sudokuArray) {

  const maxNumber = sudokuArray[0].length;

  // First, sort squares to fill with easiest to resolve first
  // will speed up resolution by reducing computation
  const flattenArray = sudokuArray.reduce((total, currentRow) => [...total, ...currentRow], []);
  flattenArray.sort((squareA, squareB) => {

    if (squareA.val) {
      squareA.score = 0;
    }

    if (squareB.val) {
      squareB.score = 0;
    }

    if (squareA.val && squareB.val) { return -1; }


    if (squareA.score === undefined) {
      const numberOfValuesInRowAndColumnForSquareA = flattenArray.filter(i => i.val && (i.rowIndex === squareA.rowIndex || i.columnIndex === squareA.columnIndex)).length;
      const {x: squareAX, y: squareAY} = getCurrentZoneIndexes(squareA);
      const numberOfValuesInZoneForSquareA = flattenArray.filter(i => {
        const {x, y} = getCurrentZoneIndexes(i);
        return x === squareAX && y === squareAY && i.val;
      }).length;

      squareA.score = numberOfValuesInRowAndColumnForSquareA + numberOfValuesInZoneForSquareA;
    }

    if (squareB.score === undefined) {
      const numberOfValuesInRowAndColumnForSquareB = flattenArray.filter(i => i.val && (i.rowIndex === squareB.rowIndex || i.columnIndex === squareB.columnIndex)).length;
      const {x: squareBX, y: squareBY} = getCurrentZoneIndexes(squareB);
      const numberOfValuesInZoneForSquareB = flattenArray.filter(i => {
        const {x, y} = getCurrentZoneIndexes(i);
        return x === squareBX && y === squareBY && i.val;
      }).length;
      
      squareB.score = numberOfValuesInRowAndColumnForSquareB + numberOfValuesInZoneForSquareB;
    }

    return squareB.score - squareA.score;

  });
  

  // Then resolve squares recursively until all are done
  resolve(flattenArray, 0, maxNumber);
  
  return sudokuArray.map(row => row.map(i => ({...i, readOnly: true})));

}


function resolve(flattenArray, index, maxNumber) {

  // If the end is reached, success
  if (index === flattenArray.length) {
    return true;
  }

  // DOn't resolve already filled squares
  if (flattenArray[index].val) {
    return resolve(flattenArray, index + 1, maxNumber);
  }

  // Try each possibility for each square
  for(let i = 1; i <= maxNumber; i++) {

    if (!valueAlreadyUsed(flattenArray, flattenArray[index], i)) {

      flattenArray[index].val = i;

      if (resolve(flattenArray, index + 1, maxNumber)) {
        return true;
      }
    }

  }

  flattenArray[index].val = null;

  return false;
}



// Finds a square with given value in current row, column or zone
function valueAlreadyUsed(flattenArray, square, resolvedValue) {

  const {x: squareX, y: squareY} = getCurrentZoneIndexes(square);
  return flattenArray.find(i => {
    const {x, y} = getCurrentZoneIndexes(i);
    return i.val === resolvedValue
      && (
        i.rowIndex === square.rowIndex
        || i.columnIndex === square.columnIndex
        || (x === squareX && y === squareY)
      )
  });
}


// Get column and row indexes for zone of given square
function getCurrentZoneIndexes(square) {
  console.log();
  return {
    x: Math.floor(square.columnIndex / 3),
    y: Math.floor(square.rowIndex / 3)
  };
}


function getZone(sudokuArray, x, y) {
  return sudokuArray.slice(y * 3, y * 3 + 3)
          .reduce((all, r) => [...all, ...r.slice(x * 3, x * 3 + 3)], []);
}



function checkErrors(sudokuArray) {
  const valuesAlreadyCheckedInColumn = [];
  const valuesAlreadyCheckedInZone = [];

  let currentZone = getZone(sudokuArray, 0, 0);
  let lastZoneIndexes = {x: 0, y:0};

  sudokuArray.forEach((row, rowIndex) => {

    const valuesAlreadyCheckedInRow = [];


    row.forEach((square, squareIndex) => {

      if(!square.val) {
        square.error = false;
        return;
      }

      // If needed, initiate valuesAlreadyCheckedInColumn for current squareIndex
      if (!valuesAlreadyCheckedInColumn[squareIndex]) {
        valuesAlreadyCheckedInColumn[squareIndex] = [];
      }

      // Check column
      if (!valuesAlreadyCheckedInColumn[squareIndex].includes(square.val)) { // Don't check column value twice

        // Retrieving doublons in following values of current column
        const doublons = sudokuArray.slice(rowIndex).filter(i => i[squareIndex].val === square.val);
        if (doublons.length >= 2){
          doublons.forEach(s => s[squareIndex].error = true);
        }

        // Remember current value has been checked for current column
        valuesAlreadyCheckedInColumn[squareIndex].push(square.val);
        
      }

      // Check row
      if (!valuesAlreadyCheckedInRow.includes(square.val)) { // Don't check row value twice

        // Retrieving doublons in following values of current row
        const doublons = row.slice(squareIndex).filter(i => i.val === square.val);
        if (doublons.length >= 2){
          doublons.forEach(s => s.error = true);
        }

        // Remember current value has been checked for current row
        valuesAlreadyCheckedInRow.push(square.val);
        
      }

      // Check zone

      // If needed, initiate valuesAlreadyCheckedInZone for current squareIndex
      const currentZoneIndexes = getCurrentZoneIndexes(square);
      const currentZoneLabel = `${currentZoneIndexes.x}-${currentZoneIndexes.y}`;
      if (!valuesAlreadyCheckedInZone[currentZoneLabel]) {
        valuesAlreadyCheckedInZone[currentZoneLabel] = [];
      }

      // If needed, update currentZone squares to prevent getting zone for each square
      if (currentZoneIndexes.x !== lastZoneIndexes.x || currentZoneIndexes.y !== lastZoneIndexes.y) {
        lastZoneIndexes = currentZoneIndexes;
        currentZone = getZone(sudokuArray, currentZoneIndexes.x, currentZoneIndexes.y);
      }

      if(!valuesAlreadyCheckedInZone[currentZoneLabel].includes(square.val)) {
        const doublons = currentZone.filter(i => i.val === square.val);
        if (doublons.length >= 2){
          doublons.forEach(s => s.error = true);
        }

        // Remember current value has been checked for current zone
        valuesAlreadyCheckedInZone[currentZoneLabel].push(square.val);
      }

    });

  });
}


export {sudokuResolver, checkErrors, getCurrentZoneIndexes};