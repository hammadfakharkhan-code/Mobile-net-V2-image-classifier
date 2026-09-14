let model = null;
let selectedImage = null;
let predictionsData = [];


// =============================
// ELEMENTS
// =============================

const imageInput = document.getElementById("imageInput");

const preview = document.getElementById("preview");

const imageContainer =
    document.getElementById("imageContainer");

const analyzeButton =
    document.getElementById("analyzeButton");

const removeImage =
    document.getElementById("removeImage");

const newButton =
    document.getElementById("newButton");

const downloadButton =
    document.getElementById("downloadButton");

const dropZone =
    document.getElementById("dropZone");

const loading =
    document.getElementById("loading");

const mainLabel =
    document.getElementById("mainLabel");

const mainProbability =
    document.getElementById("mainProbability");

const mainProgress =
    document.getElementById("mainProgress");

const predictions =
    document.getElementById("predictions");

const confidenceText =
    document.getElementById("confidenceText");

const circleValue =
    document.getElementById("circleValue");


// =============================
// LOAD MOBILENET
// =============================

async function loadModel() {

    try {

        model = await mobilenet.load();

        loading.classList.add("hidden");

        console.log("MobileNetV2 loaded successfully.");

    } catch (error) {

        console.error(error);

        loading.querySelector("h2").innerText =
            "Model Loading Failed";

        loading.querySelector("p").innerText =
            "Please refresh the page.";
    }
}


loadModel();


// =============================
// IMAGE UPLOAD
// =============================

imageInput.addEventListener(
    "change",
    function(event) {

        const file = event.target.files[0];

        if (file) {

            handleImage(file);

        }

    }
);


// =============================
// HANDLE IMAGE
// =============================

function handleImage(file) {

    if (!file.type.startsWith("image/")) {

        alert("Please upload an image.");

        return;
    }


    if (file.size > 10 * 1024 * 1024) {

        alert("Image must be smaller than 10MB.");

        return;
    }


    selectedImage = file;


    const reader = new FileReader();


    reader.onload = function(event) {

        preview.src = event.target.result;

        imageContainer.classList.add("show");

        analyzeButton.disabled = false;

        resetResults();

    };


    reader.readAsDataURL(file);
}


// =============================
// DRAG & DROP
// =============================

dropZone.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

        dropZone.classList.add("dragover");

    }
);


dropZone.addEventListener(
    "dragleave",
    function() {

        dropZone.classList.remove("dragover");

    }
);


dropZone.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();

        dropZone.classList.remove("dragover");

        const file =
            event.dataTransfer.files[0];

        if (file) {

            handleImage(file);

        }

    }
);


// =============================
// ANALYZE IMAGE
// =============================

analyzeButton.addEventListener(
    "click",
    async function() {

        if (!selectedImage || !model) {

            return;
        }


        analyzeButton.disabled = true;

        analyzeButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';


        try {

            predictionsData =
                await model.classify(preview, 5);


            showResults(predictionsData);


        } catch (error) {

            console.error(error);

            alert("Something went wrong while analyzing.");

        }


        analyzeButton.disabled = false;

        analyzeButton.innerHTML =
            '<i class="fa-solid fa-magnifying-glass"></i> Analyze Image';

    }
);


// =============================
// SHOW RESULTS
// =============================

function showResults(results) {

    if (!results || results.length === 0) {

        return;
    }


    const best = results[0];


    const bestName =
        cleanName(best.className);


    const bestProbability =
        best.probability * 100;


    // Main prediction

    mainLabel.innerText = bestName;

    mainProbability.innerText =
        bestProbability.toFixed(2) + "%";


    mainProgress.style.width =
        bestProbability + "%";


    // Confidence

    circleValue.innerText =
        Math.round(bestProbability) + "%";


    confidenceText.innerText =
        `The model is ${bestProbability.toFixed(2)}% confident about this prediction.`;


    // Other predictions

    predictions.innerHTML = "";


    results.forEach(
        (prediction, index) => {

            if (index === 0) return;


            const percentage =
                prediction.probability * 100;


            const div =
                document.createElement("div");


            div.className = "prediction";


            div.innerHTML = `

                <div class="rank">
                    ${index + 1}
                </div>

                <div class="prediction-info">

                    <h3>
                        ${cleanName(prediction.className)}
                    </h3>

                    <div class="small-progress">

                        <div
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>

                <strong>
                    ${percentage.toFixed(2)}%
                </strong>

            `;


            predictions.appendChild(div);

        }
    );
}


// =============================
// CLEAN LABEL
// =============================

function cleanName(name) {

    return name
        .replace(/,/g, "")
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase()
                + word.slice(1)
        )
        .join(" ");
}


// =============================
// REMOVE IMAGE
// =============================

removeImage.addEventListener(
    "click",
    function() {

        resetImage();

    }
);


// =============================
// NEW IMAGE
// =============================

newButton.addEventListener(
    "click",
    function() {

        resetImage();

        imageInput.click();

    }
);


// =============================
// RESET IMAGE
// =============================

function resetImage() {

    selectedImage = null;

    imageInput.value = "";

    preview.src = "";

    imageContainer.classList.remove("show");

    analyzeButton.disabled = true;

    resetResults();

}


// =============================
// RESET RESULTS
// =============================

function resetResults() {

    mainLabel.innerText =
        "Waiting...";

    mainProbability.innerText =
        "0%";

    mainProgress.style.width =
        "0%";

    circleValue.innerText =
        "0%";

    confidenceText.innerText =
        "Upload an image to see model confidence.";


    predictions.innerHTML = `

        <div class="prediction">

            <div class="rank">2</div>

            <div class="prediction-info">

                <h3>Waiting for image...</h3>

                <div class="small-progress">

                    <div style="width:0%"></div>

                </div>

            </div>

            <strong>0%</strong>

        </div>


        <div class="prediction">

            <div class="rank">3</div>

            <div class="prediction-info">

                <h3>Waiting...</h3>

                <div class="small-progress">

                    <div style="width:0%"></div>

                </div>

            </div>

            <strong>0%</strong>

        </div>


        <div class="prediction">

            <div class="rank">4</div>

            <div class="prediction-info">

                <h3>Waiting...</h3>

                <div class="small-progress">

                    <div style="width:0%"></div>

                </div>

            </div>

            <strong>0%</strong>

        </div>


        <div class="prediction">

            <div class="rank">5</div>

            <div class="prediction-info">

                <h3>Waiting...</h3>

                <div class="small-progress">

                    <div style="width:0%"></div>

                </div>

            </div>

            <strong>0%</strong>

        </div>
    `;
}


// =============================
// DOWNLOAD RESULTS
// =============================

downloadButton.addEventListener(
    "click",
    function() {

        if (predictionsData.length === 0) {

            alert("Analyze an image first.");

            return;
        }


        let text =
            "AI VISION - MOBILENETV2 RESULTS\n\n";


        predictionsData.forEach(
            (prediction, index) => {

                text +=
                    `${index + 1}. ` +
                    `${prediction.className} - ` +
                    `${(prediction.probability * 100).toFixed(2)}%\n`;

            }
        );


        const blob =
            new Blob(
                [text],
                { type: "text/plain" }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "mobilenet-results.txt";


        link.click();


        URL.revokeObjectURL(url);

    }
);


// =============================
// DARK MODE BUTTON
// =============================

const themeButton =
    document.getElementById("themeButton");


themeButton.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("light-mode");

        const icon =
            themeButton.querySelector("i");


        if (
            document.body.classList.contains(
                "light-mode"
            )
        ) {

            icon.className =
                "fa-solid fa-sun";

            themeButton.innerHTML =
                '<i class="fa-solid fa-sun"></i> Light Mode';

        } else {

            icon.className =
                "fa-solid fa-moon";

            themeButton.innerHTML =
                '<i class="fa-solid fa-moon"></i> Dark Mode';

        }

    }
);