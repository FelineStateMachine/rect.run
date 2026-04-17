if ("serviceWorker" in navigator) {
  const currentScript = document.currentScript;
  const serviceWorkerPath = currentScript?.dataset.sw ?? "/sw.js";

  addEventListener("load", () => {
    navigator.serviceWorker.register(serviceWorkerPath).catch((error) => {
      console.error("Failed to register service worker", error);
    });
  });
}
