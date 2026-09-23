// Task 7: Web Worker Threading
self.onmessage = function(e) {
    if (e.data === 'start_heavy_task') {
        // Simulate a heavy computational task
        let sum = 0;
        for (let i = 0; i < 1e8; i++) {
            sum += Math.sqrt(i);
        }
        self.postMessage({ status: 'done', result: sum });
    }
};
