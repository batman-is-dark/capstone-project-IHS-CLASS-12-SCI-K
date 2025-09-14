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
        url: "https://serverless.roboflow.com/12-capstone-weohq/1",
        params: {
          api_key: "Xvx8Nof8B321kUWrdjZC"
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

      const symptomsDict = {
        Chickenpox: [
          "Red spots or blisters",
          "Fever",
          "Fatigue",
          "Loss of appetite"
        ],
        Nail_psoriasis: [
          "Pitting of nails",
          "Discoloration",
          "Thickening of nails",
          "Separation of nail from nail bed"
        ],
        Vitiligo: [
          "White patches on skin",
          "Premature graying of hair",
          "Loss of skin color"
        ],
        Melanoma: [
          "New or unusual growth on the skin",
          "Change in size, shape, or color of a mole",
          "Irregular borders",
          "Multiple colors within a mole",
          "Itching or bleeding"
        ]
      };

      if (predictions.length > 0) {
        const bestPrediction = predictions.reduce((max, curr) =>
          curr.confidence > max.confidence ? curr : max
        );
        const truncatedConfidence = Math.floor(bestPrediction.confidence * 10000) / 100;
        output.innerHTML = `<span class="text-4xl font-extrabold text-blue-700 dark:text-blue-400">🩺 ${bestPrediction.class}</span>`;

        diseaseInfo.innerHTML = `
          <div class="flex flex-col items-center justify-center mt-2">
            <span class="font-bold text-2xl text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-4 py-1 rounded shadow">
              Confidence: <span class="font-mono">${truncatedConfidence}%</span>
            </span>
            <span class="mt-4 block text-base font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded shadow">
              This result is powered by AI.<br>
              <span class="font-normal text-gray-700 dark:text-gray-300">
                For your health and peace of mind, please consult a dermatologist for a professional diagnosis.
              </span>
            </span>
          </div>
        `;

        // Show symptoms if available
        const symptoms = symptomsDict[bestPrediction.class];
        const symptomsContainer = document.getElementById("symptomsContainer");
        if (symptoms) {
          symptomsContainer.innerHTML = `
            <div class="mt-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 shadow">
              <p class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Do you also notice these common symptoms?
              </p>
              <ul class="list-disc list-inside text-base text-gray-800 dark:text-gray-200">
                ${symptoms.map(s => `<li>${s}</li>`).join("")}
              </ul>
              <p class="mt-2 text-sm text-blue-600 dark:text-blue-300">If you have these symptoms, please seek medical advice for proper care.</p>
            </div>
          `;
        } else {
          symptomsContainer.innerHTML = "";
        }
      } else {
        output.textContent = "No disease detected.";
        diseaseInfo.textContent = "";
        document.getElementById("symptomsContainer").innerHTML = "";
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



