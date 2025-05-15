function runSJF(processes) {
  window.resetSimulationUI();
  if (processes.length === 0) return alert("Add some processes first.");

  let queue = [...processes];
  let completed = [];
  let clock = 0;
  let currentProcess = null;

  queue.sort((a, b) => a.arrival - b.arrival);
  window.clock = 0;

  window.interval = setInterval(() => {
    if (!currentProcess) {
      // Select shortest burst among arrived processes
      let available = queue.filter(p => p.arrival <= window.clock && !completed.includes(p));
      if (available.length > 0) {
        available.sort((a, b) => a.burst - b.burst);
        currentProcess = { ...available[0], remaining: available[0].burst };
        currentProcess.startTime = window.clock;
      }
    }

    if (currentProcess) {
      window.appendGanttBlock(currentProcess.pid, window.COLORS[completed.length % window.COLORS.length], `Time ${window.clock}: ${currentProcess.pid}`);
      currentProcess.remaining--;
      if (currentProcess.remaining === 0) {
        currentProcess.completion = window.clock + 1;
        currentProcess.turnaround = currentProcess.completion - currentProcess.arrival;
        currentProcess.waiting = currentProcess.turnaround - currentProcess.burst;
        completed.push(currentProcess);
        // Remove completed from queue
        queue = queue.filter(p => p.pid !== currentProcess.pid);
        currentProcess = null;
      }
    } else {
      window.appendGanttBlock("Idle", "#aaa", `Time ${window.clock}: Idle`);
    }

    window.clock++;

    if (queue.length === 0 && !currentProcess) {
      clearInterval(window.interval);
      window.interval = null;
      window.appendFinalTimeLabel();
      window.displayResults(completed);
    }
  }, 500);
}
