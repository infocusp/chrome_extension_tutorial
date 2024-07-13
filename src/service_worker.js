import { pipeline, env } from "@xenova/transformers";

const TOP_K_PREDICTIONS = 2;
env.backends.onnx.wasm.numThreads = 1;

/**
 * A singelton class the manages the image classification pipeline. Ensures that only
 * one instance of the pipeline is created and is reused throughout the application.
 */
class ClassificationPipelineSingleton {
  static task = "image-classification";
  static model = "Xenova/swin-base-patch4-window7-224-in22k";
  static instance = null;

  /**
   * Asynchronously retrieves the singleton instance of the classification pipeline.
   * If the instance doesn't exist, it creates a new one using the task and model.
   *
   * @param {Function} [progress_callback=null] - An optional callback function to track
   * the progress of the pipeline creation.
   * @returns {Promise<Object>} A promise that resolves to the singleton instance of the
   * classification pipeline.
   */
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

/**
 * Asynchronously classifies the given text using the classification pipeline.
 * @param {string} url - URL of the image to be classified.
 * @param {number} tabId - id of the tab with the image.
 * @returns {Promise<Object>} A promise that resolves to the classification result.
 */
async function analyzeImageAndSendMessage(url, tabId) {
  console.log("Predicting...");
  const startTime = performance.now();
  let model = await ClassificationPipelineSingleton.getInstance();
  const predictions = await model(url, { topk: TOP_K_PREDICTIONS });
  const totalTime = performance.now() - startTime;
  console.log(`Done in ${totalTime.toFixed(1)} ms `);
  const message = {
    action: "ADD_PREDICTION_TO_IMAGES",
    url,
    predictions,
  };
  chrome.tabs.sendMessage(tabId, message);
}

/**
 * Adds a listener to listen for messages from the content script for analyzing images.
 */
chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    if (message.action === "ANALYZE_IMAGE") {
      analyzeImageAndSendMessage(message.src, sender.tab.id);
    }
  }
);

/**
 * Adds a right-click menu option to trigger classifying the image.
 * The menu option should only appear when right-clicking an image.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "contextMenu0",
    title: "Classify image with Transformers.js ",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) =>
  analyzeImageAndSendMessage(info.srcUrl, tab.id)
);
