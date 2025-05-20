//lower number = higher priority
function runPriority() {  
  if (processes.length === 0 || interval) return;

  window.resetSimulationUI(); // clear UI and reset clock

  const queue = [...processes].map(p => ({
    ...p,
    remaining: p.burst,
    completed: false,
  }));

  let results = [];
  let completed = 0;
  window.clock = 0;
  let currentProcess = null;

  window.interval = setInterval(() => {
    // Get ready queue (arrived and not completed)
    const readyQueue = queue.filter(p => p.arrival <= window.clock && !p.completed);

    if (readyQueue.length > 0) {
      // Preempt: always pick the highest-priority process
      readyQueue.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);

      if (!currentProcess || currentProcess.pid !== readyQueue[0].pid) {
        currentProcess = readyQueue[0];
      }

      // Execute one unit of time
      currentProcess.remaining--;

      window.appendGanttBlock(
        currentProcess.pid,
        window.COLORS[completed % window.COLORS.length],
        `Time ${window.clock}: ${currentProcess.pid}`,
        window.clock
      );

      // If completed
      if (currentProcess.remaining === 0) {
        currentProcess.completion = window.clock + 1;
        currentProcess.turnaround = currentProcess.completion - currentProcess.arrival;
        currentProcess.waiting = currentProcess.turnaround - currentProcess.burst;
        currentProcess.completed = true;
        results.push(currentProcess);
        completed++;
        currentProcess = null;
      }

    } else {
      // Idle
      window.appendGanttBlock("Idle", "#aaa", `Time ${window.clock}: Idle`, window.clock);
    }

    window.clock++;

    if (completed === queue.length) {
      clearInterval(window.interval);
      window.interval = null;
      window.appendFinalTimeLabel();
      window.displayResults(results);
    }
  }, 500);
}
