function runSRTF(processes) {
  window.resetSimulationUI();
  if (processes.length === 0) return alert("Add some processes first.");

  let queue = [...processes].map(p => ({ ...p, remaining: p.burst }));
  let completed = [];
  let clock = 0;
  window.clock = 0;
  let currentProcess = null;

  window.interval = setInterval(() => {
    // Get available processes
    let available = queue.filter(p => p.arrival <= window.clock && p.remaining > 0);
    if (available.length > 0) {
      // Pick process with smallest remaining time
      available.sort((a, b) => a.remaining - b.remaining);
      let nextProc = available[0];
      if (!currentProcess || currentProcess.pid !== nextProc.pid) {
        currentProcess = nextProc;
        if (!currentProcess.startTime) currentProcess.startTime = window.clock;
      }
    } else {
      currentProcess = null;
    }

    if (currentProcess) {
      window.appendGanttBlock(currentProcess.pid, window.COLORS[completed.length % window.COLORS.length], `Time ${window.clock}: ${currentProcess.pid}`);
      currentProcess.remaining--;
      if (currentProcess.remaining === 0) {
        currentProcess.completion = window.clock + 1;
        currentProcess.turnaround = currentProcess.completion - currentProcess.arrival;
        currentProcess.waiting = currentProcess.turnaround - currentProcess.burst;
        completed.push(currentProcess);
        currentProcess = null;
      }
    } else {
      window.appendGanttBlock("Idle", "#aaa", `Time ${window.clock}: Idle`);
    }

    window.clock++;

    if (completed.length === processes.length) {
      clearInterval(window.interval);
      window.interval = null;
      window.appendFinalTimeLabel();
      window.displayResults(completed);
    }
  }, 500);
}
