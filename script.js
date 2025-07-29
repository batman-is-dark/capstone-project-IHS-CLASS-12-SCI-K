document.getElementById("inputForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // ✅ Prevent form from submitting

  const fileInput = document.getElementById("file");
  const resultContainer = document.getElementById("resultContainer");
  const output = document.getElementById("output");
  const diseaseInfo = document.getElementById("diseaseInfo");
  const loadingSpinner = document.getElementById("loadingSpinner");

  resultContainer.classList.remove("hidden");
  loadingSpinner.classList.remove("hidden");
  output.textContent = "";
  diseaseInfo.textContent = "";

  const file = fileInput.files[0];
  if (!file) {
    loadingSpinner.classList.add("hidden");
    output.textContent = "Error: No file selected.";
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    console.log("FileReader finished loading."); // Debug log
    const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");

    try {
      const response = await axios({
        method: "POST",
        url: "https://serverless.roboflow.com/skin-disease-b8har-wnzro/3",
        params: {
          api_key: "wtXzrMfuDcoZqmmww9zy"
        },
        data: base64String,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      console.log("API response:", response.data);

      const predictionsObj = response.data.predictions;
      const predictionKeys = Object.keys(predictionsObj);
      const predictions = predictionKeys.map(key => ({
        ...predictionsObj[key],
        class: key
      }));
      console.log("Predictions array:", predictions);

      if (predictions.length > 0) {
        const bestPrediction = predictions.reduce((max, curr) =>
          curr.confidence > max.confidence ? curr : max
        );
        // Truncate confidence to 2 decimal places (not round)
        const truncatedConfidence = Math.floor(bestPrediction.confidence * 10000) / 100;
        output.textContent = `Prediction: ${bestPrediction.class} (${truncatedConfidence}%)`;
        diseaseInfo.textContent = "This result is based on AI analysis. Please consult a dermatologist for a professional diagnosis.";
      } else {
        output.textContent = "No disease detected.";
        diseaseInfo.textContent = "";
      }
      loadingSpinner.classList.add("hidden");
    } catch (error) {
      loadingSpinner.classList.add("hidden");
      output.textContent = "Error: Unable to analyze the image.";
      console.error("API error:", error); // Debug log
    }
  };

  reader.readAsDataURL(file);
});
