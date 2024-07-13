// options.js

document.addEventListener('DOMContentLoaded', function() {
    // Load existing values
    chrome.storage.sync.get(['HIGH_CONFIDENCE_THRESHOLD', 'LOW_CONFIDENCE_THRESHOLD'], function(items) {
        document.getElementById('highConfidenceThreshold').value = items.HIGH_CONFIDENCE_THRESHOLD !== undefined ? items.HIGH_CONFIDENCE_THRESHOLD : 0.5;
        document.getElementById('lowConfidenceThreshold').value = items.LOW_CONFIDENCE_THRESHOLD !== undefined ? items.LOW_CONFIDENCE_THRESHOLD : 0.1;
    });

    document.getElementById('save').addEventListener('click', function() {
        let highConfidenceThreshold = parseFloat(document.getElementById('highConfidenceThreshold').value);
        let lowConfidenceThreshold = parseFloat(document.getElementById('lowConfidenceThreshold').value);

        chrome.storage.sync.set({
            'HIGH_CONFIDENCE_THRESHOLD': highConfidenceThreshold,
            'LOW_CONFIDENCE_THRESHOLD': lowConfidenceThreshold
        }, function() {
            console.log('Values saved');
        });
    });
});
