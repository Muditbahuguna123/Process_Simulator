let processes = [];
let interval = null;
let clock = 0;

document.getElementById("algorithm").addEventListener("change", function () {
  const algo = this.value;
  document.getElementById("timeQuantum").style.display = algo === "rr" ? "inline-block" : "none";
});

function togglePriorityInput() {
  const algo = document.getElementById("algorithm").value;
  const priorityInput = document.getElementById("priority");

  if (algo === "priority") {
    priorityInput.style.display = "inline-block";
    priorityInput.required = true;
  } else {
    priorityInput.style.display = "none";
    priorityInput.required = false;
  }
}


function addProcess(event) {
  if (event) event.preventDefault();

  const algo = document.getElementById("algorithm").value;
  const pid = document.getElementById("pid").value.trim();
  const arrival = parseInt(document.getElementById("arrivalTime").value);
  const burst = parseInt(document.getElementById("burstTime").value);
  const priorityInput = document.getElementById("priority");
  let priority = null;

  if (!pid || isNaN(arrival) || isNaN(burst)) {
    alert("Enter valid process details.");
    return;
  }

  if (algo === "priority") {
    priority = parseInt(priorityInput.value);
    if (isNaN(priority) || priority < 1) {
      alert("Enter a valid priority (1 or greater).");
      return;
    }
  }

  // Store the process object
  let processObj = { pid, arrival, burst, remaining: burst };
  if (algo === "priority") {
    processObj.priority = priority;
  }

  processes.push(processObj);
  updateProcessTable();

  // Clear inputs
  document.getElementById("pid").value = "";
  document.getElementById("arrivalTime").value = "";
  document.getElementById("burstTime").value = "";
  priorityInput.value = "";
}


function updateProcessTable() {
  const table = document.getElementById("processTable");
  
  // Check if any process has priority defined
  const showPriority = processes.some(p => p.priority !== undefined);

  // Build header
  let headerHTML = "<tr><th>PID</th><th>Arrival</th><th>Burst</th>";
  if (showPriority) headerHTML += "<th>Priority</th>";
  headerHTML += "</tr>";
  table.innerHTML = headerHTML;

  // Add rows
  for (const p of processes) {
    let rowHTML = `<td>${p.pid}</td><td>${p.arrival}</td><td>${p.burst}</td>`;
    if (showPriority) rowHTML += `<td>${p.priority !== undefined ? p.priority : '-'}</td>`;
    const row = table.insertRow();
    row.innerHTML = rowHTML;
  }
}


function runSelectedAlgorithm() {
  if (interval) return alert("Simulation already running.");
  const selectedAlgo = document.getElementById("algorithm").value;
  if (selectedAlgo === "fcfs") {
    runFCFS(processes);
  } else if (selectedAlgo === "sjf") {
    runSJF(processes);
  } else if (selectedAlgo === "srtf") {
    runSRTF(processes);
  } else if (selectedAlgo === "rr") {
    const quantum = parseInt(document.getElementById("timeQuantum").value);
    if (isNaN(quantum) || quantum <= 0) {
      alert("Enter a valid time quantum for Round Robin.");
      return;
    }
    runRR(processes, quantum);
  } else if (selectedAlgo === "priority") {
    runPriority(processes);
  }
}

// UI Helpers (shared)
function resetSimulationUI() {
  clock = 0;
  const ganttChart = document.getElementById("ganttChart");
  const timeLabels = document.getElementById("timeLabels");
  const resultTable = document.getElementById("resultTable");
  const averages = document.getElementById("averages");

  ganttChart.innerHTML = "";
  timeLabels.innerHTML = "";
  resultTable.innerHTML = "<tr><th>PID</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr>";
  averages.innerText = "";
}

function appendGanttBlock(pid, color, tooltip) {
  const block = document.createElement("div");
  block.className = "gantt-block";
  block.style.backgroundColor = color;
  block.innerText = pid;
  block.setAttribute("data-tooltip", tooltip);
  document.getElementById("ganttChart").appendChild(block);
  const timeLabel = document.createElement("span");
  timeLabel.innerText = clock;
  document.getElementById("timeLabels").appendChild(timeLabel);
}

function displayResults(results) {
  const resultTable = document.getElementById("resultTable");
  const averages = document.getElementById("averages");
  let totalTAT = 0;
  let totalWT = 0;

  for (let p of results) {
    const row = resultTable.insertRow();
    row.innerHTML = `<td>${p.pid}</td><td>${p.completion}</td><td>${p.turnaround}</td><td>${p.waiting}</td>`;
    totalTAT += p.turnaround;
    totalWT += p.waiting;
  }
  averages.innerText = `Average Turnaround Time: ${(totalTAT / results.length).toFixed(2)}, Average Waiting Time: ${(totalWT / results.length).toFixed(2)}`;
}

function appendFinalTimeLabel() {
  const timeLabel = document.createElement("span");
  timeLabel.innerText = clock;
  document.getElementById("timeLabels").appendChild(timeLabel);
}

function resetSimulator() {
  // Clear processes array and clock
  processes = [];
  clock = 0;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  // Reset all visual elements
  document.getElementById("ganttChart").innerHTML = "";
  document.getElementById("timeLabels").innerHTML = "";
  document.getElementById("resultTable").innerHTML = "<tr><th>PID</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr>";
  document.getElementById("averages").innerText = "";
  document.getElementById("processTable").innerHTML = "<tr><th>PID</th><th>Arrival</th><th>Burst</th></tr>";

  // Reset input form
  document.getElementById("pid").value = "";
  document.getElementById("arrivalTime").value = "";
  document.getElementById("burstTime").value = "";
  document.getElementById("priority").value = "";

  // Reset dropdown to default
  document.getElementById("algorithm").selectedIndex = 0;
  togglePriorityInput();
}


// Expose interval and clock globally for use by algo files
window.interval = null;
window.clock = 0;
window.resetSimulationUI = resetSimulationUI;
window.appendGanttBlock = appendGanttBlock;
window.displayResults = displayResults;
window.appendFinalTimeLabel = appendFinalTimeLabel;

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#f44336", "#009688", "#3F51B5"];
window.COLORS = COLORS;
window.processes = processes;
window.interval = interval;
window.clock = clock;

window.onload = () => {
  togglePriorityInput();
};

