const entries = [
  { name: "Charlie", month: "Jan 2025", count: 1, hours: 2 },
  { name: "Bruce", month: "Jan 2025", count: 3, hours: 4 },
  { name: "Amy", month: "Jan 2025", count: 5, hours: 6 },
  { name: "Alice", month: "Feb 2025", count: 7, hours: 8 },
  { name: "Amy", month: "Feb 2025", count: 9, hours: 10 },
  { name: "Sue", month: "Mar 2025", count: 11, hours: 12 },
];

const names = ["Charlie", "Amy"];
const months = ["Jan 2025", "Feb 2025"];

const namesSet = new Set(names);
const monthsSet = new Set(months);

const matchingEntries = entries.filter(
  (item) => namesSet.has(item.name) && monthsSet.has(item.month),
);

console.log(matchingEntries);
