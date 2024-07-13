const TEXT_DIV_CLASSNAME = "tfjs-mobilenet-extension-text";
const TEXT_CONTAINER_CLASSNAME = "tfjs-mobilenet-extension-text-container";
const HIGH_CONFIDENCE_THRESHOLD_DEFAULT = 0.5;
const LOW_CONFIDENCE_THRESHOLD_DEFAULT = 0.1;
const IMAGE_SIZE = 224; // Size of the image expected by the model.
const MIN_IMG_SIZE = 128;

/**
 * Produces a short text string summarizing the prediction
 * Input prediction should be a list of {label: string, score: float}
 * objects.
 * @param {[{label: string, score: number}]} predictions ordered list
 *     of objects, each with a prediction label and score
 */
async function getTextContentFromPredictions(predictions) {
  const settings = await chrome.storage.sync.get([
    "HIGH_CONFIDENCE_THRESHOLD",
    "LOW_CONFIDENCE_THRESHOLD",
  ]);

  const HIGH_CONFIDENCE_THRESHOLD =
    settings.HIGH_CONFIDENCE_THRESHOLD !== undefined
      ? settings.HIGH_CONFIDENCE_THRESHOLD
      : HIGH_CONFIDENCE_THRESHOLD_DEFAULT;
  const LOW_CONFIDENCE_THRESHOLD =
    settings.LOW_CONFIDENCE_THRESHOLD !== undefined
      ? settings.LOW_CONFIDENCE_THRESHOLD
      : LOW_CONFIDENCE_THRESHOLD_DEFAULT;

  if (!predictions || predictions.length < 1) {
    return `No prediction 🙁`;
  }

  // Confident.
  if (predictions[0].score >= HIGH_CONFIDENCE_THRESHOLD) {
    return `😄 ${predictions[0].label}!`;
  }
  // Not Confident.
  if (
    predictions[0].score >= LOW_CONFIDENCE_THRESHOLD &&
    predictions[0].score < HIGH_CONFIDENCE_THRESHOLD
  ) {
    return `${predictions[0].label}?...\n Maybe ${predictions[1].label}?`;
  }
  // Very not confident.
  if (predictions[0].score < LOW_CONFIDENCE_THRESHOLD) {
    return `😕  ${predictions[0].label}????...\n Maybe ${predictions[1].label}????`;
  }
}

/**
 *  Moves the provided imgNode into a container div, and adds a text div as a
 * peer.  Styles the container div and text div to place the text
 * on top of the image.
 * @param {HTMLElement} imgNode Which image node to write content on.
 * @param {string} textContent What text to write on the image.
 */
function addTextElementToImageNode(imgNode, textContent) {
  const originalParent = imgNode.parentElement;
  const container = document.createElement("div");
  const text = document.createElement("div");

  container.className = TEXT_CONTAINER_CLASSNAME;
  text.className = TEXT_DIV_CLASSNAME;

  originalParent.insertBefore(container, imgNode);
  container.appendChild(imgNode);
  container.appendChild(text);

  text.textContent = textContent;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) {
    return;
  }

  switch (message.action) {
    case "REMOVE_EXTENSION_TEXTS":
      Array.from(document.querySelectorAll(`.${TEXT_DIV_CLASSNAME}`)).forEach(
        (div) => div.parentNode.removeChild(div)
      );
      break;
    case "CLASSIFY_FIRST_N_IMAGES":
      Array.from(document.querySelectorAll('img[class="YQ4gaf"]'))
        .slice(0, 10)
        .forEach((image) => {
          chrome.runtime.sendMessage({
            action: "ANALYZE_IMAGE",
            src: image.src,
          });
        });
      break;
    case "ADD_PREDICTION_TO_IMAGES":
      if (message.url && message.predictions) {
        Array.from(document.getElementsByTagName("img"))
          .filter((x) => x.src === message.url)
          .forEach((node) => {
            getTextContentFromPredictions(message.predictions).then(
              (textContent) => addTextElementToImageNode(node, textContent)
            );
          });
      }
      break;
    default:
      break;
  }
});
