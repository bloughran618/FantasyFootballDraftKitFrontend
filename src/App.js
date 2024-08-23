import React, { useState } from 'react';
import Papa from 'papaparse';
import { queryByAltText } from '@testing-library/react';

function App() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [removedRows, setRemovedRows] = useState([]);
  const [positionIndex, setPositionIndex] = useState(-1);
  const [pickNum, setPickNum] = useState(1)

  const qb_a = -2.44
  const qb_b = 32.38
  const rb_a = -3.01
  const rb_b = 24.30
  const wr_a = -2.62
  const wr_b = 23.50
  const te_a = -3.04
  const te_b = 24.41

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setHeaders(result.data[0]);
          setData(result.data.slice(1));
          const positionIdx = result.data[0].indexOf("Position");
          setPositionIndex(positionIdx);
        },
        header: false,
      });
    }
  };

  const handleRowClick = (index) => {
    const dataIndex = convertEnhancedDataIndex(index) // Remove this if you get bored of enhanced data and rename dataIndex to index
    const newData = [...data];
    const removedRow = newData.splice(dataIndex, 1);
    const newPickNum = pickNum + 1
    setRemovedRows([...removedRows, { row: removedRow[0], dataIndex }]);
    setData(newData);
    setPickNum(newPickNum)
  };

  const handleUndo = () => {
    if (removedRows.length > 0) {
      const lastRemoved = removedRows[removedRows.length - 1];
      const newData = [...data];
      newData.splice(lastRemoved.index, 0, lastRemoved.row);
      const newPickNum = pickNum - 1
      setData(newData);
      setRemovedRows(removedRows.slice(0, -1));
      setPickNum(newPickNum)
    }
  };

  const getRowColor = (position) => {
    switch (position) {
      case "QB":
        return "#ffcccc";
      case "RB":
        return "#ccffcc";
      case "WR":
        return "#ccccff"; 
      case "TE":
        return "#ffffcc"
      default:
        return "#ffffff";
    }
  };

  const enhancedData = data.map(row => {
    const [rank, name, projection, adp, tier, VORP, VOAS, VO100, VOPE, position] = row;
    let VPOS
    if (position === "QB") {
      VPOS = (projection - (qb_a * Math.log(pickNum) + qb_b)).toFixed(2)
    }
    if (position === "RB") {
      VPOS = (projection - (rb_a * Math.log(pickNum) + rb_b)).toFixed(2)
    }
    if (position === "WR") {
      VPOS = (projection - (wr_a * Math.log(pickNum) + wr_b)).toFixed(2)
    }
    if (position === "TE") {
      VPOS = (projection - (te_a * Math.log(pickNum) + te_b)).toFixed(2)
    }
    return [...row, VPOS];
  });

  const convertEnhancedDataIndex = (enhancedDataIndex) => {
    console.log(enhancedDataIndex)
    const matchingName = sortedEnhancedData[enhancedDataIndex][1] // [1] is the name column
    console.log(matchingName)
    console.log(data)
    const dataIndex = data.findIndex(row => row[1] === matchingName)
    console.log(dataIndex)
    return dataIndex
  }

  const sortedEnhancedData = enhancedData.sort((a, b) => b[b.length - 1] - a[a.length - 1]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Brian's Amazing Draft Tool</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {removedRows.length > 0 && (
        <button onClick={handleUndo} style={{ marginTop: '10px' }}>
          Undo
        </button>
      )}
      <h3>Pick Number: {pickNum}</h3>
      {sortedEnhancedData.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedEnhancedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => handleRowClick(rowIndex)}
                style={{
                  backgroundColor:
                    positionIndex !== -1
                      ? getRowColor(row[positionIndex])
                      : "#ffffff",
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

// Amplify
// Who was drafted?
// Steps to enable "enhanced data"
// 1. Run the notebook. Pull the a, b values for the positions. Update in here
// 2. Update the row names if you have changed the format of the draft_kit.csv
// 3. Change data to sortedEnhancedData in the return block