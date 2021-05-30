
let fingers;
let handColors = [
    '#FFAA00',
    '#FF00AA',
    '#AA00FF',
    '#00AAFF'
];
let boxColor = '#AAFF00';
let tinyFingers = true;
let sizex = 420;
let sizey = 420;
let imgcount = 0;
let recording = false;
paper.install(window);
window.onload = async function() {


    paper.setup('myCanvas');
    

    let canvas = document.getElementById('myCanvas');
    const recorder = new CanvasRecorder(canvas, 4500000);
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    shuffle();
    generate();
    
    //genGrid();
    //genStickers();
    
    if(recording){
        recorder.start();
    }
    //genAnimation();


    if(recording){
        view.onClick = function(){
            recorder.stop();
            recorder.save('finger_motion.webm');
        }
    }
}

function genAnimation(){
    fingers = new Finger([sizex, sizey], view.bounds.center.add([-900,-400]), handColors.concat([boxColor]), false, 'animation');
    let fingers1 = new Finger([sizex, sizey], view.bounds.center.add([-900,400]), handColors.concat([boxColor]), false, 'animation');
    let fingers2 = new Finger([sizex, sizey], view.bounds.center.add([0,-400]), handColors.concat([boxColor]), false, 'animation');
    let fingers3 = new Finger([sizex, sizey], view.bounds.center.add([0,400]), handColors.concat([boxColor]), false, 'animation');
    let fingers4 = new Finger([sizex, sizey], view.bounds.center.add([900,-400]), handColors.concat([boxColor]), false, 'animation');
    let fingers5 = new Finger([sizex, sizey], view.bounds.center.add([900,400]), handColors.concat([boxColor]), false, 'animation');

    //fingers = new Finger([sizex, sizey], view.bounds.center, handColors.concat([boxColor]), false, 'animation');
}

function genStickers(){
    fingers = new Finger([sizex, sizey], view.bounds.center, handColors.concat([boxColor]), false, 'sticker');
}

function genGrid(){
    let s = 350;
    let d = 150;

    fingers = new Finger([s*2+d, s*2+d], [300+s+d/2, 300+s+d/2], handColors.concat([boxColor]), false);

    let oldColors = [boxColor].concat(handColors);
    let colors = _.shuffle(oldColors);
    boxColor = colors.pop();
    handColors = colors;
    fingers = new Finger([s, s*3+d*2], [300+s*2.5+d*2, 300+s*1.5+d], handColors.concat([boxColor]), false);

    oldColors = [boxColor].concat(handColors);
    //colors = _.shuffle(oldColors);
    boxColor = colors.pop();
    handColors = colors;
    fingers = new Finger([s, s], [300+s*0.5, 300+s*2.5+d*2], handColors.concat([boxColor]), false);

    oldColors = [boxColor].concat(handColors);
    //colors = _.shuffle(oldColors);
    boxColor = colors.pop();
    handColors = colors;
    fingers = new Finger([s, s], [300+s*1.5+d, 300+s*2.5+d*2], handColors.concat([boxColor]), false);
}

function generate(text){
    project.activeLayer.removeChildren();
    let val = document.getElementById("textinput").value
    fingers = new Finger([sizex, sizey], view.bounds.center, handColors.concat([boxColor]), false, 'none', val);

    if(!tinyFingers){
        fingers.removeTinyFingers();
    }
    

}

function shuffle(){
    let oldColors = handColors.concat([boxColor]);
    let colors = _.shuffle(oldColors);

    boxC = colors.pop();
    handC = colors;
    
    if(fingers){

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
    
    }

    handColors = handC;
    boxColor = boxC;
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

var changeText = _.debounce(function (text) {
  generate(text);
  }, 500);

function changeSize(name, value){
    if(name == 'sizex'){
        sizex = value;
    }
    if(name == 'sizey'){
        sizey = value;
    }

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



