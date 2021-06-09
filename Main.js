var dropzone;
var myChart;
function setup() {
    // createCanvas(200, 200);
    // background(0);

    dropzone = select('#dropzone');
    dropzone.dragOver(highlight);
    dropzone.dragLeave(unhighlight);
    dropzone.drop(gotFile, unhighlight);

}

function gotFile(file) {
    /*
    createP(file.name + ' ' + file.size);
    var img = createImg(file.data);
    img.size(100, 100);
     */
    let color;
    let chartType = 'scatter';
    if(/^#[0-9A-F]{6}$/i.test(file.name.split('.').slice(0, -1).join('.'))){
        color = file.name.split('.').slice(0, -1).join('.');
    }
    else{
        color = '#000000';
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

    saveBtn.addEventListener("click", function () {
        // console.log('test');
        var image = myChart.toBase64Image();
        // console.log(image);
        downloadFile(image, file.name);
    });

    lineBtn.addEventListener("click", function () {
        myChart.destroy();
        file.file.text().then( text => {
            chart(text, file, color, 'line');
        });
        chartType = 'line';
    });

    barBtn.addEventListener("click", function () {
        myChart.destroy();
        file.file.text().then( text => {
            chart(text, file, color, 'bar');
        });
        chartType = 'bar';
    });

    scatterBtn.addEventListener("click", function () {
        myChart.destroy();
        file.file.text().then( text => {
            chart(text, file, color, 'scatter');
        });
        chartType = 'scatter';
    });

    hexInput.onmousedown = function (m){
        hexInput.value = "";
    }


    hexInput.onkeypress = function(e){
        if (!e) e = window.event;
        let keyCode = e.code || e.key;
        if (keyCode === 'Enter'){
            // Enter pressed
            if(hexInput.value !== "") {


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
        if(keyCode === 'Backspace'){
            hexInput.style.color = "#000000";
        }
    }


    file.file.text().then( text => {
        // console.log(text);
        chart(text, file, color, 'scatter');
    });
    // chart(file.file)
}

function highlight() {
    dropzone.style('background-color', '#cee5d0');
}

function unhighlight() {
    dropzone.style('background-color', '#fff');
}

const xData = [];
const yData = [];
let fileName;


async function chart(text, file, color, chartType) {

    await getData(text, file);
    const ctx = document.getElementById('chart').getContext('2d');
    myChart = new Chart(ctx, {
        type: chartType,
        options: {
            responsive: true
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
    myChart.canvas.parentNode.style.height = '128px';
}



async function getData(text, file) {
    // const response = await fetch(file);
    // const data = await file.text();

    const rawData = text.split(/\n/).slice(1);
    rawData.forEach(row => {
        const column = row.split(/,/)
        const x = column[0];
        xData.push(parseFloat(x));
        const y = column[1];
        yData.push(parseFloat(y)+0.5);
        // console.log(x, y);
    });
}

function downloadFile(file, fileName) {
    // Create a link and set the URL using `createObjectURL`
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = URL.createObjectURL(file);
    link.download = fileName;

    // It needs to be added to the DOM so it can be clicked
    document.body.appendChild(link);
    link.click();

    // To make this work on Firefox we need to wait
    // a little while before removing it.
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
    }, 0);
}

function firstRGBA(hex){
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length=== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.2)';
    }
    throw new Error('Bad Hex');
}

function secondRGBA(hex){
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length=== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}