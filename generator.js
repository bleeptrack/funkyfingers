
let fingers;
let handColors;
let boxColor;
let tinyFingers = true;
paper.install(window);
window.onload = function() {

    paper.setup('myCanvas');
    let colors = [
            '#AAFF00',
            '#FFAA00',
            '#FF00AA',
            '#AA00FF',
            '#00AAFF'
        ];
    colors = _.shuffle(colors);
    fingers = new Finger([60*7, 60*7], colors, false);

    handColors = fingers.getHandColors();
    boxColor = fingers.getBoxColor();
    document.getElementById('boxcolor').value = boxColor;
    document.getElementById('fillcolor1').value = handColors[0];
    document.getElementById('fillcolor2').value = handColors[1];
    document.getElementById('fillcolor3').value = handColors[2];
    document.getElementById('fillcolor4').value = handColors[3];

}

function generate(){
    project.activeLayer.removeChildren();
    fingers = new Finger([60*7, 60*7], handColors.concat([boxColor]), false);

    handColors = fingers.getHandColors();
    boxColor = fingers.getBoxColor();
    document.getElementById('boxcolor').value = boxColor;
    document.getElementById('fillcolor1').value = handColors[0];
    document.getElementById('fillcolor2').value = handColors[1];
    document.getElementById('fillcolor3').value = handColors[2];
    document.getElementById('fillcolor4').value = handColors[3];

    if(!tinyFingers){
        fingers.removeTinyFingers();
    }
}

function shuffle(){
    let oldColors = handColors.concat([boxColor]);
    let colors = _.shuffle(oldColors);

    boxC = colors.pop();
    handC = colors;

    changeColor('boxcolor', Color.random());
    changeColor('fillcolor1', Color.random());
    changeColor('fillcolor2', Color.random());
    changeColor('fillcolor3', Color.random());
    changeColor('fillcolor4', Color.random());

    changeColor('boxcolor', boxC);
    changeColor('fillcolor1', handC[0]);
    changeColor('fillcolor2', handC[1]);
    changeColor('fillcolor3', handC[2]);
    changeColor('fillcolor4', handC[3]);

    document.getElementById('boxcolor').value = boxColor;
    document.getElementById('fillcolor1').value = handColors[0];
    document.getElementById('fillcolor2').value = handColors[1];
    document.getElementById('fillcolor3').value = handColors[2];
    document.getElementById('fillcolor4').value = handColors[3];



}

function toggleFingers(){
    if(tinyFingers){
        fingers.removeTinyFingers();
    }else{
        fingers.insertTinyFingers();
    }
    tinyFingers = !tinyFingers;
}

function changeStyle(val){
    if(val == 'fill'){
        fingers.makeColored();
    }
    if(val == 'nofill'){
        fingers.makeLineArt();
    }
}

function changeColor(colorname, value){
    if(colorname == 'fillcolor1'){
        fingers.changeColor(handColors[0], value);
        handColors[0] = value;
    }
    if(colorname == 'fillcolor2'){
        fingers.changeColor(handColors[1], value);
        handColors[1] = value;
    }
    if(colorname == 'fillcolor3'){
        fingers.changeColor(handColors[2], value);
        handColors[2] = value;
    }
    if(colorname == 'fillcolor4'){
        fingers.changeColor(handColors[3], value);
        handColors[3] = value;
    }
    if(colorname == 'boxcolor'){
        fingers.changeColor(boxColor, value);
        boxColor = value;
    }
}

function downloadSVG(){
    var svg = project.exportSVG({ asString: true });
    var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "funkyfingers.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadPNG(){
    var canvas = document.getElementById("myCanvas");
    var downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png;base64");
    downloadLink.download = 'funkyfingers.png'
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}



