const xData = [];
const yData = [];
let dropzone;
let myChart;
let firstTime = false;


// Code that controls the highlighting/unhighlighting on the file dropzone.
// It also calls the gotFile function with the uploaded file once a file is uploaded
function setup() {

    dropzone = select('#dropzone');
    dropzone.dragOver(highlight);
    dropzone.dragLeave(unHighlight);
    dropzone.drop(gotFile, unHighlight);

}

function highlight() {
    dropzone.style('background-color', '#cee5d0');
}

function unHighlight() {
    dropzone.style('background-color', '#fff');
}

// function that creates all the new elements, such as the save button.
// It also removes the dropzone element and calls the chart function to create the chart.
// The function also calls the downloadFile function to trigger a file download for the Save Button.
function gotFile(file) {

    let color = '#000000'; // Default chart color is black
    let chartType = 'scatter'; // Default chart type is scatter

    // Regex to check if the file name is a valid hex code, if it is it will make the chart the same color.
    if(/^#[0-9A-F]{6}$/i.test(file.name.split('.').slice(0, -1).join('.'))){
        color = file.name.split('.').slice(0, -1).join('.');
    }

    dropzone.remove();

    const div1 = document.getElementById("div1");
    const div2 = document.getElementById("div2");

    const saveBtn = document.createElement("button");
    const lineBtn = document.createElement("button");
    const barBtn = document.createElement("button");
    const scatterBtn = document.createElement("button");

    const hexInput = document.createElement('input');
    hexInput.type = "text";

    saveBtn.innerHTML = "Save Image";
    scatterBtn.innerHTML = "Scatter Chart";
    lineBtn.innerHTML = "Line Chart";
    barBtn.innerHTML = "Bar Chart";
    hexInput.value = "Hex Code";

    div1.appendChild(scatterBtn);
    div1.appendChild(lineBtn);
    div1.appendChild(barBtn);

    div2.appendChild(saveBtn);
    div2.appendChild(hexInput);

    // Adds listener to the Save Button
    saveBtn.addEventListener("click", function () {
        // console.log('test');
        var image = myChart.toBase64Image();
        // console.log(image);
        downloadFile(image, file.name);
    });

    // Adds listener to the Line Chart Button
    lineBtn.addEventListener("click", function () {

        myChart.destroy();
        file.file.text().then( text => {
            chart(text, file, color, 'line');
        });
        chartType = 'line';

        myChart.type = "line";
        myChart.datasets.backgroundColor = color;
        myChart.datasets.borderColor = color;
        myChart.update();
    });

    // Adds listener to the Bar Chart Button
    barBtn.addEventListener("click", function () {

        myChart.destroy();
        file.file.text().then( text => {
            chart(text, file, color, 'bar');
        });
        chartType = 'bar';

        myChart.type = "bar";
        myChart.datasets.backgroundColor = color;
        myChart.datasets.borderColor = color;
        myChart.update();
    });

    // Adds listener to the Scatter Chart Button
    scatterBtn.addEventListener("click", function () {

        myChart.destroy();
        file.file.text().then( text => {
            chart(text, file, color, 'scatter');
        });
        chartType = 'scatter';

        myChart.type = "scatter";
        myChart.datasets.backgroundColor = color;
        myChart.datasets.borderColor = color;
        myChart.update();
    });

    // Mouse listener on the textbox to check if the user clicked on the element.
    // If the user did, it will clear the element of it's contents
    hexInput.onmousedown = function (m){
        hexInput.value = "";
    }

    // Key listener to check if the user pressed the enter key.
    // If the user did, it will check if the input is a valid hex code, if it is it will make the chart the given color.
    // If the value isn't valid, it will make the input red.
    // If the value is null, the color will remain/become black.
    hexInput.onkeypress = function(e){
        if (!e) e = window.event;
        let keyCode = e.code || e.key;
        if (keyCode === 'Enter'){
            // Enter pressed
            if(hexInput.value !== "") {

                // Regex to check if the file name is a valid hex code
                if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
                    console.log("Is Hex");
                    hexInput.style.color = hexInput.value;
                    color = hexInput.value;
                    myChart.destroy();
                    file.file.text().then(text => {
                        chart(text, file, color, chartType);
                    });
                } else {
                    console.log("Not Hex");
                    hexInput.style.color = "#fc030f";
                }
            }
            else{
                hexInput.style.color = "#000000";
                color = "#000000";
                file.file.text().then(text => {
                    chart(text, file, color, chartType);
                });
            }
            return false;
        }
    }


    file.file.text().then( text => {
        // console.log(text);
        chart(text, file, color, 'scatter');
    });
    // chart(file.file)
}

// Function that creates the chart given a file, color, and type.
// It calls the getData function to parse the data from the given file
async function chart(text, file, color, chartType) {
    // myChart.destroy();
    const ctx = document.getElementById('chart').getContext('2d');
    if(firstTime === false) {
        await getData(text, file);
        firstTime = true;
    }
    myChart = new Chart(ctx, {
        type: chartType,
        options: {
            responsive: false
        },
        data: {
            labels: xData,
            datasets: [{
                label: file.name,
                data: yData,
                backgroundColor: [ color ],
                borderColor: [ color ],
                borderWidth: 1
            }]
        }
    });
}


// Code that parses the csv.
// It puts the first column of the csv into the xData array, and the second in yData.
// NOTE: The function only takes the first 2 columns of a given csv, all other columns will be ignored.
async function getData(text, file) {

    const rawData = text.split(/\n/).slice(1);
    rawData.forEach(row => {
        const column = row.split(/,/)
        const x = column[0];
        xData.push(parseFloat(x));
        const y = column[1];
        yData.push(parseFloat(y)+0.5);
    });
}

// Code that triggers a file download for the Save Button.
function downloadFile(file, fileName) {

    const link = document.createElement("a");
    link.style.display = "none";
    link.href = URL.createObjectURL(file);
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    // A timeout is necessary for the code to work on FireFox.
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
    }, 0);
}
