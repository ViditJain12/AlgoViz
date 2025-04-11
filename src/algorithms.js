// algorithms.js

// -----------------------
// Comparison-based sorts
// -----------------------

// Bubble Sort
export function bubbleSortSteps(inputArray) {
  const steps = [];
  const n = inputArray.length;
  let array = [...inputArray];

  for (let i = 0; i < n; i++) {
    // Last i elements are sorted
    const sortedIndices = Array.from({ length: i }, (_, idx) => n - i + idx);
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...array],
        compared: [j, j + 1],
        sorted: sortedIndices,
      });
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        steps.push({
          array: [...array],
          swapped: [j, j + 1],
          sorted: sortedIndices,
        });
      }
    }
    const newSorted = Array.from({ length: i + 1 }, (_, idx) => n - (i + 1) + idx);
    steps.push({ array: [...array], sorted: newSorted });
  }
  steps.push({ array: [...array], sorted: Array.from({ length: n }, (_, idx) => idx) });
  return steps;
}

// Insertion Sort
export function insertionSortSteps(inputArray) {
  const steps = [];
  let array = [...inputArray];
  // First element is trivially sorted.
  steps.push({ array: [...array], sorted: [0] });

  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    // Record key element (for potential highlighting)
    steps.push({
      array: [...array],
      key: i,
      sorted: Array.from({ length: i }, (_, idx) => idx),
    });
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      steps.push({
        array: [...array],
        shifting: [j, j + 1],
        sorted: Array.from({ length: i }, (_, idx) => idx),
      });
      j--;
    }
    array[j + 1] = key;
    steps.push({
      array: [...array],
      inserted: i,
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
    });
  }
  steps.push({
    array: [...array],
    sorted: Array.from({ length: array.length }, (_, idx) => idx),
  });
  return steps;
}

// Selection Sort
export function selectionSortSteps(inputArray) {
  const steps = [];
  let array = [...inputArray];
  const n = array.length;

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...array],
        compared: [minIdx, j],
        sorted: Array.from({ length: i }, (_, idx) => idx),
      });
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      steps.push({
        array: [...array],
        swapped: [i, minIdx],
        sorted: Array.from({ length: i }, (_, idx) => idx),
      });
    }
    steps.push({
      array: [...array],
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
    });
  }
  steps.push({
    array: [...array],
    sorted: Array.from({ length: n }, (_, idx) => idx),
  });
  return steps;
}

// Merge Sort
export function mergeSortSteps(inputArray) {
  const steps = [];
  let arr = [...inputArray];

  // merge subroutine: merges arr[left..right] and records steps.
  function merge(arr, left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;
    while (i < n1 && j < n2) {
      steps.push({
        array: [...arr],
        compared: [left + i, mid + 1 + j],
      });
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      steps.push({ array: [...arr] });
      k++;
    }
    while (i < n1) {
      arr[k] = leftArr[i];
      i++;
      k++;
      steps.push({ array: [...arr] });
    }
    while (j < n2) {
      arr[k] = rightArr[j];
      j++;
      k++;
      steps.push({ array: [...arr] });
    }
    // Mark the merged segment as sorted.
    const mergedSorted = [];
    for (let idx = left; idx <= right; idx++) {
      mergedSorted.push(idx);
    }
    steps.push({ array: [...arr], sorted: mergedSorted });
  }

  // Recursive helper that records the current active range.
  function mergeSortHelper(arr, left, right) {
    // Record which part of the array is being processed.
    steps.push({ array: [...arr], activeRange: [left, right] });
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(arr, left, mid);
      mergeSortHelper(arr, mid + 1, right);
      merge(arr, left, mid, right);
      // Mark the merged section.
      steps.push({ array: [...arr], mergedRange: [left, right] });
    }
  }

  mergeSortHelper(arr, 0, arr.length - 1);
  steps.push({
    array: [...arr],
    sorted: Array.from({ length: arr.length }, (_, idx) => idx),
  });
  return steps;
}

// Quick Sort with pivot, left, and right pointer information
export function quickSortSteps(inputArray) {
  const steps = [];
  let array = [...inputArray];
  const sortedIndices = new Set();

  // Partition function returns the pivot's final index.
  function partition(low, high) {
    let pivot = array[high]; // pivot element
    let i = low;
    // For each j from low to high-1, compare element with pivot.
    for (let j = low; j < high; j++) {
      // Record the step with current pointers.
      steps.push({
        array: [...array],
        pivot: high,
        left: i,
        right: j,
        compared: [j, high],
        sorted: Array.from(sortedIndices),
      });
      if (array[j] < pivot) {
        [array[i], array[j]] = [array[j], array[i]];
        steps.push({
          array: [...array],
          pivot: high,
          left: i,
          right: j,
          swapped: [i, j],
          sorted: Array.from(sortedIndices),
        });
        i++;
      }
    }
    [array[i], array[high]] = [array[high], array[i]];
    sortedIndices.add(i);
    steps.push({
      array: [...array],
      pivot: i,
      left: i,
      right: high,
      swapped: [i, high],
      sorted: Array.from(sortedIndices),
    });
    return i;
  }

  function quickSortHelper(low, high) {
    if (low < high) {
      let pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
      steps.push({ array: [...array], sorted: Array.from(sortedIndices) });
    }
  }

  quickSortHelper(0, array.length - 1);
  steps.push({
    array: [...array],
    sorted: Array.from({ length: array.length }, (_, idx) => idx),
  });
  return steps;
}

// Shell Sort
export function shellSortSteps(inputArray) {
  const steps = [];
  let array = [...inputArray];
  const n = array.length;

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = array[i];
      let j = i;
      while (j >= gap && array[j - gap] > temp) {
        steps.push({
          array: [...array],
          compared: [j, j - gap],
        });
        array[j] = array[j - gap];
        steps.push({
          array: [...array],
          shifted: [j, j - gap],
        });
        j -= gap;
      }
      array[j] = temp;
      if (gap === 1) {
        const sortedIndices = Array.from({ length: i + 1 }, (_, idx) => idx);
        steps.push({ array: [...array], inserted: i, sorted: sortedIndices });
      }
    }
  }
  steps.push({ array: [...array], sorted: Array.from({ length: n }, (_, idx) => idx) });
  return steps;
}

// ------------------------------
// Non-comparison-based sorts
// ------------------------------

// Counting Sort (assumes non-negative integers)
export function countingSortSteps(inputArray) {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;
  if (n === 0) return steps;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min + 1;
  const count = Array(range).fill(0);

  // Build count array
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++;
  }
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }
  const sortedArr = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let num = arr[i];
    count[num - min]--;
    let pos = count[num - min];
    sortedArr[pos] = num;
  }
  let current = [...inputArray];
  steps.push({ array: [...current] });
  for (let i = 0; i < n; i++) {
    current[i] = sortedArr[i];
    const sortedIndices = Array.from({ length: i + 1 }, (_, idx) => idx);
    steps.push({ array: [...current], sorted: sortedIndices });
  }
  return steps;
}

// Radix Sort (Least Significant Digit, for non-negative integers)
export function radixSortSteps(inputArray) {
  const steps = [];
  let arr = [...inputArray];
  steps.push({ array: [...arr] });
  const n = arr.length;
  if (n === 0) return steps;
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    const output = Array(n).fill(0);
    const count = Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      let digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
    }
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
    for (let i = n - 1; i >= 0; i--) {
      let digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }
    arr = output;
    steps.push({ array: [...arr] });
    exp *= 10;
  }
  steps.push({
    array: [...arr],
    sorted: Array.from({ length: n }, (_, idx) => idx),
  });
  return steps;
}

// Bucket Sort (assumes numbers are roughly uniformly distributed)
export function bucketSortSteps(inputArray) {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;
  steps.push({ array: [...arr] });
  if (n === 0) return steps;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bucketCount = n;
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.floor(((arr[i] - min) / (max - min + 1)) * bucketCount);
    buckets[bucketIndex].push(arr[i]);
  }
  // Sort each bucket using insertion sort (internal)
  const sortedBuckets = buckets.map(bucket => {
    for (let i = 1; i < bucket.length; i++) {
      let key = bucket[i];
      let j = i - 1;
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }
    return bucket;
  });
  let sortedArr = [];
  for (let i = 0; i < sortedBuckets.length; i++) {
    sortedArr = sortedArr.concat(sortedBuckets[i]);
    const sortedIndices = Array.from({ length: sortedArr.length }, (_, idx) => idx);
    let current = [...arr];
    for (let k = 0; k < sortedArr.length; k++) {
      current[k] = sortedArr[k];
    }
    steps.push({ array: current, sorted: sortedIndices });
  }
  return steps;
}

// Heap Sort
export function heapSortSteps(inputArray) {
  const steps = [];
  let arr = [...inputArray];
  const n = arr.length;
  steps.push({ array: [...arr] });
  function heapify(arr, heapSize, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < heapSize && arr[left] > arr[largest]) {
      largest = left;
    }
    if (right < heapSize && arr[right] > arr[largest]) {
      largest = right;
    }
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      steps.push({ array: [...arr], swapped: [i, largest] });
      heapify(arr, heapSize, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
    steps.push({ array: [...arr] });
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    steps.push({
      array: [...arr],
      swapped: [0, i],
      sorted: Array.from({ length: n - i }, (_, idx) => n - idx - 1),
    });
    heapify(arr, i, 0);
    steps.push({
      array: [...arr],
      sorted: Array.from({ length: n - i + 1 }, (_, idx) => n - idx - 1),
    });
  }
  steps.push({ array: [...arr], sorted: Array.from({ length: n }, (_, idx) => idx) });
  return steps;
}
