//your JS code here. If required.
const fetchButton = document.getElementById("fetch-button");
    const clickCount = document.getElementById("click-count");
    const results = document.getElementById("results");

    let queue = [];
    let requestTimestamps = [];
    let clickTimes = [];
    let clickResetTimer = null;

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function updateClickCount() {
      const now = Date.now();
      clickTimes = clickTimes.filter((t) => now - t < 10000);
      clickCount.textContent = clickTimes.length;
    }

    function startClickResetTimer() {
      if (clickResetTimer) clearInterval(clickResetTimer);

      clickResetTimer = setInterval(() => {
        const now = Date.now();
        clickTimes = clickTimes.filter((t) => now - t < 10000);
        clickCount.textContent = clickTimes.length;

        if (clickTimes.length === 0) {
          clearInterval(clickResetTimer);
          clickResetTimer = null;
        }
      }, 500);
    }

    async function rateLimitedFetch() {
      const now = Date.now();
      requestTimestamps = requestTimestamps.filter((t) => now - t < 1000);

      if (requestTimestamps.length >= 5) {
        const waitTime = 1000 - (now - requestTimestamps[0]);
        await sleep(waitTime);
        return rateLimitedFetch();
      }

      requestTimestamps.push(Date.now());

      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      const data = await response.json();

      results.innerHTML = `
        <p><strong>ID:</strong> ${data.id}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Completed:</strong> ${data.completed}</p>
      `;
    }

    async function processQueue() {
      if (queue.length === 0) return;

      const task = queue.shift();
      await task();
      processQueue();
    }

    fetchButton.addEventListener("click", () => {
      clickTimes.push(Date.now());
      updateClickCount();
      startClickResetTimer();

      queue.push(rateLimitedFetch);

      if (queue.length === 1) {
        processQueue();
      }
    });
