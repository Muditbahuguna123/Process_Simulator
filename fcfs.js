let processes = [];
let interval = null;
let clock = 0;

function addProcess(event) {
  if (event) event.preventDefault();
  const pid = document.getElementById("pid").value;
  const arrival = parseInt(document.getElementById("arrivalTime").value);
  const burst = parseInt(document.getElementById("burstTime").value);

  if (!pid || isNaN(arrival) || isNaN(burst)) {
    alert("Enter valid process details.");
    return;
  }
  processes.push({ pid, arrival, burst, remaining: burst });
  updateProcessTable();

  document.getElementById("pid").value = "";
  document.getElementById("arrivalTime").value = "";
  document.getElementById("burstTime").value = "";
}

function updateProcessTable() {
  const table = document.getElementById("processTable");
  table.innerHTML = "<tr><th>PID</th><th>Arrival</th><th>Burst</th></tr>";
  for (const p of processes) {
    const row = table.insertRow();
    row.innerHTML = `<td>${p.pid}</td><td>${p.arrival}</td><td>${p.burst}</td>`;
  }
}

function runFCFS() {
  if (processes.length === 0 || interval) return;

  const queue = [...processes].sort((a, b) => a.arrival - b.arrival);
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#f44336", "#009688", "#3F51B5"];

  let ganttChart = document.getElementById("ganttChart");
  let timeLabels = document.getElementById("timeLabels");
  let resultTable = document.getElementById("resultTable");
  let averages = document.getElementById("averages");

  ganttChart.innerHTML = "";
  timeLabels.innerHTML = "";
  resultTable.innerHTML = "<tr><th>PID</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr>";
  averages.innerText = "";

  clock = 0;
  let index = 0;
  let results = [];
  let currentProcess = null;

  interval = setInterval(() => {
    if (!currentProcess && index < queue.length && queue[index].arrival <= clock) {
      currentProcess = { ...queue[index] };
      currentProcess.startTime = clock;
      queue[index].startTime = clock;
      index++;
    }

    const block = document.createElement("div");
    const timeLabel = document.createElement("span");

    if (currentProcess) {
      block.className = "gantt-block";
      const color = colors[results.length % colors.length];
      block.style.backgroundColor = color;
      block.innerText = currentProcess.pid;
      block.setAttribute("data-tooltip", `Time ${clock}: ${currentProcess.pid}`);
      currentProcess.remaining--;
      if (currentProcess.remaining === 0) {
        currentProcess.completion = clock + 1;
        currentProcess.turnaround = currentProcess.completion - currentProcess.arrival;
        currentProcess.waiting = currentProcess.turnaround - currentProcess.burst;
        results.push(currentProcess);
        currentProcess = null;
      }
    } else {
      block.className = "gantt-block";
      block.innerText = "Idle";
      block.style.backgroundColor = "#aaa";
      block.setAttribute("data-tooltip", `Time ${clock}: Idle`);
    }

    ganttChart.appendChild(block);
    timeLabel.innerText = clock;
    timeLabels.appendChild(timeLabel);
    clock++;

    if (index >= queue.length && !currentProcess) {
      clearInterval(interval);
      interval = null;

      const finalLabel = document.createElement("span");
      finalLabel.innerText = clock;
      timeLabels.appendChild(finalLabel);

      let totalTAT = 0;
      let totalWT = 0;
      for (let p of results) {
        const row = resultTable.insertRow();
        row.innerHTML = `<td>${p.pid}</td><td>${p.completion}</td><td>${p.turnaround}</td><td>${p.waiting}</td>`;
        totalTAT += p.turnaround;
        totalWT += p.waiting;
      }

      const avgTAT = (totalTAT / results.length).toFixed(2);
      const avgWT = (totalWT / results.length).toFixed(2);
      averages.innerText = `Average Turnaround Time: ${avgTAT}, Average Waiting Time: ${avgWT}`;
    }
  }, 1000); // 1s per unit
}