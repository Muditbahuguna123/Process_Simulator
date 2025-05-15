function runPriority() {
  if (processes.length === 0 || interval) return;

  const queue = [...processes].map(p => ({ ...p })); // deep copy
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#f44336", "#009688", "#3F51B5"];

  const ganttChart = document.getElementById("ganttChart");
  const timeLabels = document.getElementById("timeLabels");
  const resultTable = document.getElementById("resultTable");
  const averages = document.getElementById("averages");

  ganttChart.innerHTML = "";
  timeLabels.innerHTML = "";
  resultTable.innerHTML = "<tr><th>PID</th><th>Priority</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr>";
  averages.innerText = "";

  let clock = 0;
  let completed = 0;
  let currentProcess = null;
  let executionTimeLeft = 0;
  let results = [];

  interval = setInterval(() => {
    // If no process is currently running
    if (!currentProcess) {
      const readyQueue = queue.filter(p => p.arrival <= clock && !p.completed);
      if (readyQueue.length > 0) {
        readyQueue.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
        currentProcess = readyQueue[0];
        currentProcess.startTime = clock;
        executionTimeLeft = currentProcess.burst;
      }
    }

    const block = document.createElement("div");
    const timeLabel = document.createElement("span");
    timeLabel.innerText = clock;
    timeLabels.appendChild(timeLabel);

    if (currentProcess) {
      block.className = "gantt-block";
      block.innerText = currentProcess.pid;
      block.style.backgroundColor = colors[completed % colors.length];
      block.setAttribute("data-tooltip", `Time ${clock}: ${currentProcess.pid}`);
      ganttChart.appendChild(block);

      executionTimeLeft--;

      if (executionTimeLeft === 0) {
        currentProcess.completion = clock + 1;
        currentProcess.turnaround = currentProcess.completion - currentProcess.arrival;
        currentProcess.waiting = currentProcess.turnaround - currentProcess.burst;
        currentProcess.completed = true;
        results.push(currentProcess);
        currentProcess = null;
        completed++;
      }
    } else {
      // No process ready — show Idle
      block.className = "gantt-block";
      block.innerText = "Idle";
      block.style.backgroundColor = "#aaa";
      block.setAttribute("data-tooltip", `Time ${clock}: Idle`);
      ganttChart.appendChild(block);
    }

    clock++;

    if (completed === queue.length) {
      clearInterval(interval);
      interval = null;

      const finalLabel = document.createElement("span");
      finalLabel.innerText = clock;
      timeLabels.appendChild(finalLabel);

      let totalTAT = 0, totalWT = 0;
      for (let p of results) {
        const row = resultTable.insertRow();
        row.innerHTML = `<td>${p.pid}</td><td>${p.priority}</td><td>${p.completion}</td><td>${p.turnaround}</td><td>${p.waiting}</td>`;
        totalTAT += p.turnaround;
        totalWT += p.waiting;
      }

      const avgTAT = (totalTAT / results.length).toFixed(2);
      const avgWT = (totalWT / results.length).toFixed(2);
      averages.innerText = `Average Turnaround Time: ${avgTAT}, Average Waiting Time: ${avgWT}`;
    }
  }, 1000); // 1 sec per unit time
}
