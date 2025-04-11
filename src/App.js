import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  bubbleSortSteps,
  insertionSortSteps,
  selectionSortSteps,
  mergeSortSteps,
  quickSortSteps,
  shellSortSteps,
  countingSortSteps,
  radixSortSteps,
  bucketSortSteps,
  heapSortSteps,
} from './algorithms'; // Ensure your algorithms.js includes extra properties for Quick & Merge Sort.
import './App.css';

// Helper function to build a Merge Sort tree structure.
const buildMergeSortTree = (arr) => {
  if (arr.length <= 1) return { array: arr };
  const mid = Math.floor(arr.length / 2);
  const leftTree = buildMergeSortTree(arr.slice(0, mid));
  const rightTree = buildMergeSortTree(arr.slice(mid));
  return { array: arr, left: leftTree, right: rightTree };
};

// Recursive component to render the merge sort tree view.
const MergeSortTreeView = ({ tree }) => {
  if (!tree) return null;
  return (
    <div className="tree-node">
      <div className="tree-array">
        {tree.array.map((num, idx) => (
          <span key={idx} className="tree-box">{num}</span>
        ))}
      </div>
      {tree.left && tree.right && (
        <div className="tree-children">
          <MergeSortTreeView tree={tree.left} />
          <MergeSortTreeView tree={tree.right} />
        </div>
      )}
    </div>
  );
};

/* --------------------- Race Mode Components --------------------- */

// Helper: returns steps for a given algorithm.
const getStepsForAlgorithm = (algo, arr) => {
  switch (algo) {
    case "Bubble Sort":
      return bubbleSortSteps(arr);
    case "Insertion Sort":
      return insertionSortSteps(arr);
    case "Selection Sort":
      return selectionSortSteps(arr);
    case "Merge Sort":
      return mergeSortSteps(arr);
    case "Quick Sort":
      return quickSortSteps(arr);
    case "Shell Sort":
      return shellSortSteps(arr);
    case "Counting Sort":
      return countingSortSteps(arr);
    case "Radix Sort":
      return radixSortSteps(arr);
    case "Bucket Sort":
      return bucketSortSteps(arr);
    case "Heap Sort":
      return heapSortSteps(arr);
    default:
      return [];
  }
};

// RaceAlgorithm component: runs animation for a single algorithm in race mode (detailed boxes for 15 elements).
const RaceAlgorithm = ({ algorithm, inputArray, speed, onFinish }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [pivotIndex, setPivotIndex] = useState(null);
  const [leftIndex, setLeftIndex] = useState(null);
  const [rightIndex, setRightIndex] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const generatedSteps = getStepsForAlgorithm(algorithm, inputArray);
    setSteps(generatedSteps);
    setCurrentStep(0);
    startTimeRef.current = Date.now();
  }, [algorithm, inputArray]);

  useEffect(() => {
    if (steps.length > 0) {
      if (currentStep < steps.length) {
        timerRef.current = setTimeout(() => {
          const step = steps[currentStep];
          if (algorithm === "Quick Sort" && step.pivot !== undefined) {
            setPivotIndex(step.pivot);
            setLeftIndex(step.left);
            setRightIndex(step.right);
          }
          setCurrentStep(currentStep + 1);
        }, speed);
      } else {
        const duration = Date.now() - startTimeRef.current;
        onFinish(algorithm, duration);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [steps, currentStep, speed, algorithm, onFinish]);

  const currentArray = steps.length > 0 && currentStep > 0 ? steps[currentStep - 1].array : inputArray;
  const movingIndices =
    currentStep > 0 && steps[currentStep - 1] && steps[currentStep - 1].swapped
      ? steps[currentStep - 1].swapped || []
      : [];
  const sortedIndices =
    currentStep > 0 && steps[currentStep - 1] && steps[currentStep - 1].sorted
      ? steps[currentStep - 1].sorted || []
      : [];

  return (
    <div className="race-algo">
      <h3>{algorithm}</h3>
      <div className="array-container">
        {currentArray.map((value, idx) => {
          let classes = "array-box";
          if (movingIndices.includes(idx)) classes += " moving";
          if (algorithm === "Quick Sort") {
            if (pivotIndex === idx) classes += " pivot";
            if (leftIndex === idx) classes += " left";
            if (rightIndex === idx) classes += " right";
          }
          if (sortedIndices.includes(idx)) classes += " sorted";
          return (
            <div key={idx} className={classes}>
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// UltimateRaceAlgorithm component: runs animation for one algorithm in Ultimate Race Mode (100 elements, bar graph view).
const UltimateRaceAlgorithm = ({ algorithm, inputArray, speed, onFinish }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const generatedSteps = getStepsForAlgorithm(algorithm, inputArray);
    setSteps(generatedSteps);
    setCurrentStep(0);
    startTimeRef.current = Date.now();
  }, [algorithm, inputArray]);

  useEffect(() => {
    if (steps.length > 0) {
      if (currentStep < steps.length) {
        timerRef.current = setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, speed);
      } else {
        const duration = Date.now() - startTimeRef.current;
        onFinish(algorithm, duration);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [steps, currentStep, speed, algorithm, onFinish]);

  const currentArray = steps.length > 0 && currentStep > 0 ? steps[currentStep - 1].array : inputArray;

  return (
    <div className="race-algo">
      <h3>{algorithm}</h3>
      <div className="ultimate-array-container">
        {currentArray.map((value, idx) => (
          <div
            key={idx}
            className="ultimate-bar"
            style={{ height: `${value}px` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// RaceVisualizer component: renders all race algorithm panels side by side and shows results.
const RaceVisualizer = ({ inputArray, selectedAlgos, speed, ultimate }) => {
  const [finishTimes, setFinishTimes] = useState({});

  const handleFinish = (algo, time) => {
    setFinishTimes((prev) => ({ ...prev, [algo]: time }));
  };

  const allFinished = selectedAlgos.every((algo) => finishTimes[algo] !== undefined);
  const winner = allFinished
    ? selectedAlgos.reduce((w, algo) =>
        finishTimes[algo] < finishTimes[w] ? algo : w,
        selectedAlgos[0]
      )
    : null;

  return (
    <div>
      <h2>Race Results</h2>
      {allFinished && (
        <h3 className="winner-label">
          Winner: {winner} (Finished in {finishTimes[winner]} ms)
        </h3>
      )}
      <div className="race-container">
        {selectedAlgos.map((algo) =>
          ultimate ? (
            <UltimateRaceAlgorithm
              key={algo}
              algorithm={algo}
              inputArray={inputArray}
              speed={speed}
              onFinish={handleFinish}
            />
          ) : (
            <RaceAlgorithm
              key={algo}
              algorithm={algo}
              inputArray={inputArray}
              speed={speed}
              onFinish={handleFinish}
            />
          )
        )}
      </div>
      {allFinished && (
        <div className="race-summary">
          {selectedAlgos.map((algo) => (
            <p key={algo}>
              {algo}: {finishTimes[algo]} ms
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// -----------------------
// Main App Component
// -----------------------
function App() {
  // Normal mode state variables
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [algorithm, setAlgorithm] = useState("Bubble Sort");
  const [sorting, setSorting] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [mergeSortTree, setMergeSortTree] = useState(null);
  const timerRef = useRef(null);

  // Race mode state variables
  const [raceMode, setRaceMode] = useState(false);
  const [ultimateRaceMode, setUltimateRaceMode] = useState(false);
  const [raceAlgos, setRaceAlgos] = useState([]); // Selected algorithm names for race.
  const [raceStarted, setRaceStarted] = useState(false);

  const complexityInfo = {
    "Bubble Sort": "O(n²)",
    "Insertion Sort": "Best-case: O(n) | Worst-case: O(n²)",
    "Selection Sort": "O(n²)",
    "Merge Sort": "O(n log n)",
    "Quick Sort": "Average: O(n log n) | Worst-case: O(n²)",
    "Shell Sort": "Approximately O(n^(3/2)) (depends on gap sequence)",
    "Counting Sort": "O(n + k)",
    "Radix Sort": "O(d*(n + b)) where d = number of digits, b = base",
    "Bucket Sort": "Average-case: O(n) (depends on distribution)",
    "Heap Sort": "O(n log n)"
  };

  const algorithmInfo = {
    "Bubble Sort": {
      description:
        "Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order until the array is sorted.",
      video: "https://www.youtube.com/watch?v=Dv4qLJcxus8"
    },
    "Selection Sort": {
      description:
        "Selection Sort finds the minimum element from the unsorted portion and swaps it with the first unsorted element.",
      video: "https://www.youtube.com/watch?v=EwjnF7rFLns"
    },
    "Insertion Sort": {
      description:
        "Insertion Sort builds a sorted array one element at a time by inserting each new element in its proper position.",
      video: "https://www.youtube.com/watch?v=8mJ-OhcfpYg"
    },
    "Merge Sort": {
      description:
        "Merge Sort divides the array into halves, recursively sorts each half, and then merges them back together.",
      video: "https://www.youtube.com/watch?v=3j0SWDX4AtU"
    },
    "Quick Sort": {
      description:
        "Quick Sort selects a pivot element and partitions the array so that elements less than the pivot come before it and those greater come after it, then recursively sorts the partitions.",
      video: "https://www.youtube.com/watch?v=Vtckgz38QHs&t=205s"
    },
    "Shell Sort": {
      description:
        "Shell Sort is a variation of Insertion Sort that initially sorts elements far apart, reducing the gap over successive passes.",
      video: "https://www.youtube.com/watch?v=SHcPqUe2GZM"
    },
    "Counting Sort": {
      description:
        "Counting Sort counts the occurrences of each distinct element and computes positions using arithmetic.",
      video: "https://www.youtube.com/watch?v=OKd534EWcdk"
    },
    "Radix Sort": {
      description:
        "Radix Sort processes numbers digit by digit (from least significant to most) using a stable sort.",
      video: "https://www.youtube.com/watch?v=nu4gDuFabIM"
    },
    "Bucket Sort": {
      description:
        "Bucket Sort distributes elements into buckets, sorts each bucket, and concatenates them to produce a sorted array.",
      video: "https://www.youtube.com/watch?v=VuXbEb5ywrU"
    },
    "Heap Sort": {
      description:
        "Heap Sort builds a max heap and repeatedly extracts the largest element to form a sorted array.",
      video: "https://www.youtube.com/watch?v=2DmK_H7IdTo"
    }
  };

  // Normal mode: Generate array
  const generateRandomArray = useCallback(() => {
    // If in ultimate race mode, set count = 100; otherwise, use 15.
    const count = ultimateRaceMode ? 100 : 15;
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(Math.floor(Math.random() * 300) + 10);
    }
    setArray(arr);
    setInputValue(arr.join(", "));
    setSteps([]);
    setCurrentStep(0);
    setError("");
    if (!raceMode && algorithm === "Merge Sort") {
      setMergeSortTree(buildMergeSortTree(arr));
    }
  }, [algorithm, ultimateRaceMode, raceMode]);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const updateArrayFromInput = () => {
    if (ultimateRaceMode) return; // In ultimate race mode, ignore manual input.
    const parts = inputValue.split(",").map(s => s.trim()).filter(s => s !== "");
    if (parts.length > 15) {
      setError("Please enter at most 15 numbers.");
      return;
    }
    const nums = parts.map(s => Number(s));
    for (let num of nums) {
      if (isNaN(num)) {
        setError("Please make sure all entries are valid numbers.");
        return;
      }
    }
    setArray(nums);
    setSteps([]);
    setCurrentStep(0);
    setError("");
    if (!raceMode && algorithm === "Merge Sort") {
      setMergeSortTree(buildMergeSortTree(nums));
    }
  };

  // Normal mode steps generator.
  const getSteps = (algo, arr) => {
    switch (algo) {
      case "Bubble Sort":
        return bubbleSortSteps(arr);
      case "Insertion Sort":
        return insertionSortSteps(arr);
      case "Selection Sort":
        return selectionSortSteps(arr);
      case "Merge Sort":
        return mergeSortSteps(arr);
      case "Quick Sort":
        return quickSortSteps(arr);
      case "Shell Sort":
        return shellSortSteps(arr);
      case "Counting Sort":
        return countingSortSteps(arr);
      case "Radix Sort":
        return radixSortSteps(arr);
      case "Bucket Sort":
        return bucketSortSteps(arr);
      case "Heap Sort":
        return heapSortSteps(arr);
      default:
        return [];
    }
  };

  const startSorting = () => {
    const generatedSteps = getSteps(algorithm, array);
    setSteps(generatedSteps);
    setSorting(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!raceMode && sorting && steps.length > 0) {
      if (currentStep < steps.length) {
        timerRef.current = setTimeout(() => {
          const step = steps[currentStep];
          // For Quick Sort, update pointers if defined.
          if (algorithm === "Quick Sort" && step.pivot !== undefined) {
            // Assuming your quick sort steps include pivot, left, and right.
          }
          setArray(step.array);
          setCurrentStep(currentStep + 1);
        }, speed);
      } else {
        setSorting(false);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [sorting, currentStep, steps, speed, raceMode, algorithm]);

  // Helpers for normal mode.
  const getMovingIndices = () => {
    const moving = [];
    if (currentStep > 0 && steps[currentStep - 1]) {
      const prev = steps[currentStep - 1];
      if (prev.swapped) moving.push(...prev.swapped);
      if (prev.shifting) moving.push(...prev.shifting);
      if (typeof prev.key === 'number') moving.push(prev.key);
    }
    return moving;
  };

  const getSortedIndices = () => {
    if (currentStep > 0 && steps[currentStep - 1]) {
      return steps[currentStep - 1].sorted || [];
    }
    return [];
  };

  const getQuickSortPointers = () => {
    let pivot = null, left = null, right = null;
    if (algorithm === "Quick Sort" && currentStep > 0 && steps[currentStep - 1]) {
      const step = steps[currentStep - 1];
      if (step.pivot !== undefined) {
        pivot = step.pivot;
        left = step.left;
        right = step.right;
      }
    }
    return { pivot, left, right };
  };

  const { pivot: pivotIndex, left: leftIndex, right: rightIndex } = getQuickSortPointers();
  const movingIndices = getMovingIndices();
  const sortedIndices = getSortedIndices();

  return (
    <div className="App">
      <h1>Sorting Visualizer</h1>
      
      {/* Mode toggles */}
      <div className="mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={raceMode}
            onChange={(e) => {
              setRaceMode(e.target.checked);
              setRaceStarted(false);
            }}
          />{" "}
          Race Mode
        </label>
        {raceMode && (
          <label style={{ marginLeft: '20px' }}>
            <input
              type="checkbox"
              checked={ultimateRaceMode}
              onChange={(e) => {
                setUltimateRaceMode(e.target.checked);
                // Auto-generate a new array when switching modes.
                generateRandomArray();
              }}
            />{" "}
            Ultimate Race Mode (100 elements)
          </label>
        )}
      </div>
      
      {/* Normal Mode UI */}
      {!raceMode && (
        <>
          <div className="controls">
            <div>
              <label>Select Algorithm: </label>
              <select
                value={algorithm}
                onChange={(e) => {
                  const newAlgo = e.target.value;
                  setAlgorithm(newAlgo);
                  if (newAlgo === "Merge Sort") {
                    setMergeSortTree(buildMergeSortTree(array));
                  }
                }}
              >
                <option>Bubble Sort</option>
                <option>Insertion Sort</option>
                <option>Selection Sort</option>
                <option>Merge Sort</option>
                <option>Quick Sort</option>
                <option>Shell Sort</option>
                <option>Counting Sort</option>
                <option>Radix Sort</option>
                <option>Bucket Sort</option>
                <option>Heap Sort</option>
              </select>
            </div>
            <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
              Time Complexity: {complexityInfo[algorithm]}
            </div>
            <div className="algorithm-info">
              <p>{algorithmInfo[algorithm].description}</p>
              <a
                href={algorithmInfo[algorithm].video}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch a video explanation
              </a>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label>Enter numbers (comma-separated, max 15): </label>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="e.g., 34, 7, 23, 32, 5"
                style={{ width: '300px', marginRight: '10px' }}
                disabled={ultimateRaceMode}
              />
              <button onClick={updateArrayFromInput} disabled={ultimateRaceMode}>
                Update Array
              </button>
              {error && <span style={{ color: 'red', marginLeft: '10px' }}>{error}</span>}
            </div>
            <div style={{ marginTop: '10px' }}>
              <button onClick={generateRandomArray}>Generate Random Array</button>
              <button onClick={startSorting} style={{ marginLeft: '10px' }}>
                Start Sorting
              </button>
              <label style={{ marginLeft: '10px' }}>
                Speed:
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="20"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{ marginLeft: '5px' }}
                />
              </label>
            </div>
          </div>
          <div className="array-container">
            {array.map((value, idx) => {
              let boxClasses = "array-box";
              if (movingIndices.includes(idx)) boxClasses += " moving";
              if (pivotIndex === idx) boxClasses += " pivot";
              if (leftIndex === idx) boxClasses += " left";
              if (rightIndex === idx) boxClasses += " right";
              if (sortedIndices.includes(idx)) boxClasses += " sorted";
              return (
                <div key={idx} className={boxClasses}>
                  {value}
                </div>
              );
            })}
          </div>
          {algorithm === "Merge Sort" && mergeSortTree && (
            <div className="tree-container">
              <h2>Merge Sort Tree</h2>
              <MergeSortTreeView tree={mergeSortTree} />
            </div>
          )}
        </>
      )}
      
      {/* Race Mode UI */}
      {raceMode && !raceStarted && (
        <div className="race-controls">
          <h2>Select Algorithms for Race</h2>
          <div className="race-checkboxes">
            {Object.keys(algorithmInfo).map((algo) => (
              <label key={algo} className="race-checkbox">
                <input
                  type="checkbox"
                  value={algo}
                  checked={raceAlgos.includes(algo)}
                  onChange={(e) => {
                    const selected = e.target.checked;
                    setRaceAlgos((prev) => {
                      if (selected) return [...prev, algo];
                      return prev.filter((a) => a !== algo);
                    });
                  }}
                />
                {algo}
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              if (raceAlgos.length === 0) {
                setRaceAlgos(Object.keys(algorithmInfo));
              }
              setRaceStarted(true);
            }}
            style={{ marginTop: '10px' }}
          >
            Start Race
          </button>
        </div>
      )}
      {raceMode && raceStarted && (
        <RaceVisualizer
          inputArray={array}
          selectedAlgos={raceAlgos}
          speed={speed}
          ultimate={ultimateRaceMode}
        />
      )}
    </div>
  );
}

export default App;
