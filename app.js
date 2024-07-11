
let allPredictions = [];
let model;

async function loadModel() {
    console.log("Loading model...");
    model = await cocoSsd.load();
    console.log("Model loaded.");
}

async function detectObjects(video) {
    if (!model) return;

    console.log("Detecting objects...");
    const predictions = await model.detect(video);
    console.log("Predictions: ", predictions);  // Afficher les prédictions dans la console
    allPredictions.push(predictions);  // Stocker les prédictions

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        context.beginPath();
        context.rect(...prediction.bbox);
        context.lineWidth = 1;
        context.strokeStyle = 'green';
        context.fillStyle = 'green';
        context.stroke();
        context.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            prediction.bbox[0],
            prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
        );
    });

    requestAnimationFrame(() => detectObjects(video));
}

document.getElementById('upload-video').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const video = document.getElementById('video');
    video.src = URL.createObjectURL(file);
    video.load();
    video.play();

    video.onloadeddata = async () => {
        if (!model) await loadModel();
        requestAnimationFrame(() => detectObjects(video));
    };
});

document.getElementById('download-results').addEventListener('click', () => {
    if (allPredictions.length > 0) {
        downloadJSON(allPredictions, 'predictions.json');
    } else {
        alert("Aucune donnée de prédiction disponible.");
    }
});

function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
