class Finger{
    
    


    constructor(boxsize, pos,  colors, offset, mode, text){
        
    
        this.colors = colors;
        this.center = paper.view.center;
        this.coloredObjs = [];
        this.tinyFingers = [];
        this.bigFingerBG = [];
        this.bigFingerLines = [];
        this.offset = offset;
        this.animation = mode == 'animation' ? true : false;
        this.sticker = mode == 'sticker' ? true : false;
        if(text){
            this.text = text;
        }else{
            this.text = _.sample(randomText);
        }
        

        paper.view.scaling = 1;

        this.generate(boxsize, pos);
        
        if(this.offset){
            this.offsetColors();
        }
        if(this.animation){
            this.removeTinyFingers();
        }

        this.bigHandOffset = [_.random(4,8)*_.sample([-1,1]),_.random(4,8)*_.sample([-1,1])];

    }

    async generate(boxsize, pos){
        this.font = await opentype.load("Barrio-Regular.ttf");
        
        if(this.sticker){
            for(let y = 1; y<=4; y++){
                for(let x = 1; x<= 5; x++){
                    let h1 = this.drawhand();
                    h1.strokeWidth *= 2.1;
                    h1.rotate(180);

                    h1.position = [x*380, y*750-300];
                    this.decoHand(h1);
                }
                if(y<4){
                    for(let x = 1; x<= 4; x++){
                        let h1 = this.drawhand();
                        h1.strokeWidth *= 2.1;

                        h1.position = [190+x*380, y*750];
                        this.decoHand(h1);
                    }
                }
            }

        } else if(this.animation){
            let boxcolor = this.colors.pop();
            let animFingers = this.generateAnimationFingers(9, pos);

            animFingers[0].dashArray = [animFingers[0].length, animFingers[0].length];
            await animFingers[0].tweenFrom({dashOffset: animFingers[0].length}, {duration: 2500, easing: 'linear'});
            animFingers[0].remove();

            let fin = new Path();
            fin.strokeColor = 'black';
            fin.strokeWidth = animFingers[0].strokeWidth;

            for(let i = 0; i<animFingers.length-1; i++){
                let tween = fin.tween({duration: 1000, easing: 'easeInOutCubic'});
                tween.onUpdate = function(event) {
                    fin.interpolate(animFingers[i], animFingers[i+1], event.factor)
                };
                await tween.start();
            }

            let points = [];
            for(let i = 0; i<fin.segments.length; i++){
                fin.segments[i].origPoint = {x: fin.segments[i].point.x, y: fin.segments[i].point.y};
                let p = new Path.Circle(fin.segments[i].point, 10);

                p.fillColor = 'grey';
                points.push(p);
                p.tweenFrom({opacity: 0}, {duration: 300, easing: 'easeInOutCubic'});
            }

            let tween = fin.tween({duration: 2000, easing: 'easeInOutCubic'});
            tween.onUpdate = function(event) {
                for(let i = 0; i<fin.segments.length-1; i++){
                    fin.segments[i].point.x = _.clamp(fin.segments[i].point.x + _.random(-1,1), fin.segments[i].origPoint.x-10, fin.segments[i].origPoint.x+10);
                    fin.segments[i].point.y = _.clamp(fin.segments[i].point.y + _.random(-1,1), fin.segments[i].origPoint.y-10, fin.segments[i].origPoint.y+10);
                    points[i].position = fin.segments[i].point;
                }
            };
            await tween.start();

            let handleIns = [];
            let handleOuts = [];
            for(let i = 0; i<fin.segments.length; i++){
                fin.segments[i].origHandleIn = {x: fin.segments[i].handleIn.x, y: fin.segments[i].handleIn.y};
                fin.segments[i].origHandleOut = {x: fin.segments[i].handleOut.x, y: fin.segments[i].handleOut.y};

                let lIn = new Path.Line(fin.segments[i].point, fin.segments[i].point.add(fin.segments[i].handleIn));
                let lOut = new Path.Line(fin.segments[i].point, fin.segments[i].point.add(fin.segments[i].handleOut));

                lIn.strokeColor = 'grey';
                lIn.strokeWidth = 5;
                lIn.strokeCap = 'round';
                handleIns.push(lIn);
                lIn.tweenFrom({opacity: 0}, {duration: 300, easing: 'easeInOutCubic'});

                lOut.style = lIn.style;
                handleOuts.push(lOut);
                lOut.tweenFrom({opacity: 0}, {duration: 300, easing: 'easeInOutCubic'});
            }

            tween = fin.tween({duration: 5000, easing: 'linear'}); //5000
            tween.onUpdate = function(event) {
                for(let i = 0; i<fin.segments.length; i++){

                        fin.segments[i].handleIn.x = fin.segments[i].origHandleIn.x - (Math.sin(event.factor*20)*fin.segments[i].origHandleIn.x/6);
                        fin.segments[i].handleIn.y = fin.segments[i].origHandleIn.y - (Math.sin(event.factor*20)*fin.segments[i].origHandleIn.y/6);

                        handleIns[i].lastSegment.point = fin.segments[i].point.add(fin.segments[i].handleIn);

                        fin.segments[i].handleOut.x = fin.segments[i].origHandleOut.x - (Math.sin(event.factor*20)*fin.segments[i].origHandleOut.x/6);
                        fin.segments[i].handleOut.y = fin.segments[i].origHandleOut.y - (Math.sin(event.factor*20)*fin.segments[i].origHandleOut.y/6);
                        //console.log(Math.sin(event.factor*20)*50+50)

                        handleOuts[i].lastSegment.point = fin.segments[i].point.add(fin.segments[i].handleOut);
                }
            };
            await tween.start();

            let deco = this.decoHand(fin);
            let l = deco.children[2];
            l.dashArray = [l.length, l.length];
            l.dashOffset = l.length;

            points.forEach(p => p.tweenTo({opacity: 0}, {duration: 300, easing: 'easeInOutCubic'}));
            handleIns.forEach(p => p.tweenTo({opacity: 0}, {duration: 300, easing: 'easeInOutCubic'}));
            handleOuts.forEach(p => p.tweenTo({opacity: 0}, {duration: 300, easing: 'easeInOutCubic'}));

            deco.children[1].applyMatrix = false;
            deco.scaling = 1;
            await deco.children[1].tweenFrom({scaling: 0.01}, {duration: 1000, easing: 'easeInOutCubic'});

            await l.tweenTo({dashOffset: 0}, {duration: 2500, easing: 'easeInOutCubic'});

            this.box = new Path.Rectangle([0,0], [650, 650]);
            this.box.sendToBack();
            this.box.position = pos;
            this.box.fillColor = boxcolor;
            this.box.applyMatrix = false;
            this.box.rotation = _.random(-5,5);
            await this.box.tweenFrom({scaling: 0.01, rotation: 0}, {duration: 500, easing: 'easeInOutCubic'});

            let bigHand = new Group(deco, fin);
            bigHand.applyMatrix = false;
            bigHand.rotation = 0;
            let newpos = [this.box.bounds.topLeft.x+_.random(0,this.box.bounds.width), this.box.bounds.topLeft.y+_.random(0,this.box.bounds.height)];
            await bigHand.tweenTo({rotation: _.random(0, 360), position: newpos}, {duration: 1000, easing: 'easeInOutCubic'});


            bigHand.applyMatrix = true;
            this.fingers = [fin];
            let lasttween;
            for(let i = 0; i<200; i++){
                //if(i%100==0)
                    //console.log(i);
                let h1 = this.drawhand();
                h1.strokeWidth *= 1.7
                h1.fillColor = this.getRandomColor();
                h1.scale(_.random(5,20)/70);
                h1.rotate(_.random(0, 360));
                if(_.random(0,1)==0){
                    h1.scale(-1,1);
                }
                h1.position = [this.box.bounds.topLeft.x+_.random(0,this.box.bounds.width), this.box.bounds.topLeft.y+_.random(0,this.box.bounds.height)];
                if(!this.collides(h1, false)){
                    this.fingers.push(h1);
                    lasttween = h1.tweenFrom({opacity: 0}, {duration: _.random(300,1200), easing: 'easeInOutCubic'})
                    //tween
                }else{
                    h1.remove();
                }
            }
            await lasttween.start();

        }else{
            this.fingers = [];
            
            
            await this.addText();
            
            this.box = new Path.Rectangle([0,0], [this.textpath.bounds.width+250, this.textpath.bounds.height+250]);
            this.box.position = pos;
            this.box.fillColor = this.colors.pop();
            
            this.box = new CompoundPath({ children: [this.box], fillColor: this.box.fillColor, fillRule: 'evenodd' });
            this.box.sendToBack();
            this.coloredObjs.push(this.box);

        
            
           

            


            for(let i = 0; i<this.text.length * 20 + 80; i++){
                //if(i%100==0)
                    //console.log(i);
                let h1 = this.drawhand();
                let handOffset = 50;

                if( i > 7 ){
                    h1.scale(_.random(5,20)/100);
                    handOffset = 0;
                }
                h1.rotate(_.random(0, 360));
                if(_.random(0,1)==0){
                    h1.scale(-1,1);
                }
                h1.position = [this.box.bounds.topLeft.x+_.random(-handOffset,this.box.bounds.width+handOffset), this.box.bounds.topLeft.y+_.random(-handOffset,this.box.bounds.height+handOffset)];
                if(!this.collides(h1, false)){
                    this.fingers.push(h1);
                    if( i <= 7){
                        this.decoHand(h1);
                        h1.strokeWidth *= 1.5;
                        h1.bringToFront();
                        
                        if(h1.intersects(paper.view.bounds)){
                            console.log('error');
                        }
                    }else{
                        let h2 = h1.clone();
                        h1.strokeColor = undefined;
                        h1.fillColor = this.getRandomColor();
                        this.tinyFingers.push(h1);
                        this.tinyFingers.push(h2);
                        this.coloredObjs.push(h1);
                    }
                    paper.view.update();
                }else{
                    h1.remove();
                }
            }

            if(paper.project.activeLayer.bounds.height > paper.view.bounds.height){
                paper.view.scale( paper.view.bounds.height*0.8 / paper.project.activeLayer.bounds.height );
            }
            if(paper.project.activeLayer.bounds.width > paper.view.bounds.width){
                paper.view.scale( paper.view.bounds.width*0.8 / paper.project.activeLayer.bounds.width );
            }
            
            //this.box.rotate(_.random(-3,3,true));
            //
            for(let letter of this.textpath.children){
                await this.box.tweenTo({}, 200);
                this.box.addChild(letter.clone());
                for(let i = 0; i<5; i++){ //iterate crumbles
                    let crumble = new Path.Rectangle([0,0], [20,20]);
                    crumble.fillColor = this.box.fillColor;
                    //crumble.strokeColor = 'black';
                    crumble.rotate(_.random(0,360));
                    crumble.position = letter.getPointAt(_.random(0, letter.length));
                    crumble.applyMatrix = false;
                    if(i==4){
                        this.shake(5);
                        crumble.tweenTo({position: crumble.position.add([0,700]), opacity: 0, rotation: crumble.rotation + _.random(300, 1000)}, 800);
                    }else{
                        crumble.tweenTo({position: crumble.position.add([0,700]), opacity: 0, rotation: crumble.rotation + _.random(300, 1000)}, 800);
                    }
                }
            }
            
            
        }
    }
    

    
    shake(times){
        paper.view.shakeOffset = times;
        paper.view.oldCenter = paper.view.center;
        paper.view.onFrame = this.shakeRender;

    }
    
    shakeRender(){
            paper.view.center = paper.view.oldCenter.add([_.random(-paper.view.shakeOffset, paper.view.shakeOffset), _.random(-paper.view.shakeOffset, paper.view.shakeOffset)]);
            paper.view.rotation = _.random(-paper.view.shakeOffset/2, paper.view.shakeOffset/2);
            paper.view.shakeOffset--;
            console.log(paper.view.shakeOffset);
            if(paper.view.shakeOffset <= 0){
                paper.view.onFrame = undefined;
                paper.view.rotation = 0;
            }
    }
    
    async addText(){

        //background.fillColor = colors[0];
        let txts = this.text.split(" ");
        this.textpath = new CompoundPath();
        
        txts.forEach( (txt, idx, arr) => {
            let fontpath = this.font.getPath(txt,0,idx*300, 300, {kerning: true});
            let p = paper.project.importSVG(fontpath.toSVG());
            this.textpath.addChildren(p.children);
        });

        this.textpath.position = view.center;
        this.fingers.push(this.textpath.clone());
        
        
        
        //console.log(this.box);
        //this.box.fillColor = 'red';
            
        
    }


    generateAnimationFingers(num, pos){
        let animFingers = [];
        for(let i = 0; i<num; i++){
            let h1 = this.drawhand();
            h1.scale(1.7);
            h1.strokeWidth *= 4;
            h1.strokeColor = 'black';
            h1.position = pos;
            if(i != 0 ){
                h1.remove();
            }
            animFingers.push(h1);
        }
        return animFingers;
    }

    collides(line, insideAllowed){
        for(let f of this.fingers){
            if(f.intersects(line)){
                return true;
            }
            if(!insideAllowed && f.contains(line.position)){
                return true;
            }
        }
        return false;
    }

    decoHand(hand){
        let h2 = hand.clone();
        h2.fillColor = this.getRandomColor();
        h2.strokeColor = undefined;

        let s = new Path.Line(hand.bounds.topLeft, hand.bounds.bottomRight);
        let line = this.wiggleLine(s);
        console.log(line);

        //line.selected = true;
        let lines = new CompoundPath(line);
        if(_.random(0,1)==0){
            let t = _.random(30,80);
            let line2 = line.clone().translate([t, -t]);
            lines.addChild(line2);
        }
        lines.rotate(_.random(0, 360));

        lines.strokeColor = this.getRandomColor();
        while(lines.strokeColor.equals(h2.fillColor)){
            lines.strokeColor = this.getRandomColor();
        }
        lines.strokeWidth = _.random(30, 100);
        lines.strokeCap = 'round';

        let g = new Group(hand.clone(), h2, lines);
        this.coloredObjs.push(h2);
        this.coloredObjs.push(lines);
        g.clipped = true;
        if(this.offset){
            g.translate(this.bigHandOffset);
            g.myOffset = this.bigHandOffset;
        }
        //this.coloredObjs.push(g);
        //g.sendToBack();
        return g;
    }

    wiggleLine(baseline){
        let dist = _.random(15,100)
        let p = new Path();
        let c = 0;
        for(let i = 0; i<baseline.length; i += _.random(10,80)){
            p.add(baseline.getPointAt(i).add(baseline.getNormalAt(i).multiply(c%2*dist)));
            c = c+1;
        }
        if(_.random(0,2)==0){
            p.smooth();
        }
        return p;
    }

    drawhand(){
        let h = 100;
        let w = 30;
        let c = w + _.random(-w/3, w/3);

        let line = new Path();
        line.strokeColor = 'black';
        line.strokeWidth = 3;

        line.add([300, 300]);
        line.add(new Segment(line.lastSegment.point.add([w, -h]), [-c, 0], [c, 0]));
        line.add(new Segment(line.segments[line.segments.length-2].point.add([w*2, 0]), [0, -h], [0, -h*2]));
        line.add(new Segment(line.lastSegment.point.add([w, -h*(1.5 + Math.random()*1.5)]), [-c, 0], [c, 0]));
        line.add(line.lastSegment.point.add([w*0.6, w*1.8]));
        line.add(line.lastSegment.point.add([-w, 0]));
        line.add(line.segments[line.segments.length-3]);

        line.add(new Segment(line.segments[line.segments.length-5].point.add([w*2, 0]), [0, -h*2], [0, -h]));
        line.add(new Segment(line.lastSegment.point.add([w, -h]), [-c, 0], [c, 0]));
        line.add(new Segment(line.segments[line.segments.length-2].point.add([w*2, 0]), [0, -h], [0, -h]));
        line.add(new Segment(line.lastSegment.point.add([w, -h]), [-c, 0], [c, 0]));
        line.add(new Segment(line.segments[line.segments.length-2].point.add([w*2, 0]), [0, 0], [0, h/2]));

        line.add(new Segment(line.lastSegment.point.add([-w*5, _.random(h*0.7, h*2)]), [_.random(h/2, h*1.5), 0], [-_.random(h/2, h*1.5), 0]));

        line.add(new Segment(line.firstSegment.point.add([-_.random(w, w*3), 0]), [0, w], [0, -_.random(w, w*2)]));

        let endpoint = line.firstCurve.getPointAt(Math.random()*line.firstCurve.length*0.7 + w/2);
        line.add(endpoint);

        if(!this.animation){
            this.wiggle(line);
        }

        return line;
    }

    wiggle(hand){
        for(let i = 0; i<hand.segments.length-1; i++){
            hand.segments[i].point.y += _.random(-10,10);
        }
    }

    getRandomColor(){
        return this.colors[_.random(0, this.colors.length-1)];
    }

    getObjsByColor(col){
        let objs = [];
        for(let o of this.coloredObjs){
            if(o.fillColor && o.fillColor.equals(col)){
                objs.push(o);
            }
            if(o.strokeColor && o.strokeColor.equals(col)){
                objs.push(o);
            }
        }
        return objs;
    }

    offsetColors(){
        this.colors.forEach(col => {
            let offset = [_.random(-4,4), _.random(-4,4)];
            let colObjs = this.getObjsByColor(new Color(col));
            colObjs.forEach(c => {
                c.translate(offset);
                c.myOffset = offset;
            });
        })

    }

    changeColor(fromC, toC){
        let colObjs = this.getObjsByColor(new Color(fromC));
        colObjs.forEach(c => {
            if(c.fillColor){
                c.fillColor = toC;
            }
            if(c.strokeColor){
                c.strokeColor = toC;
            }
        });
    }

    makeLineArt(){
        this.coloredObjs.forEach(o => o.remove());
    }

    makeColored(){
        project.activeLayer.insertChildren(0,this.coloredObjs);
    }

    removeTinyFingers(){
        this.tinyFingers.forEach(o => o.remove());
    }

    insertTinyFingers(){
        project.activeLayer.insertChildren(1,this.tinyFingers);
    }

    getBoxColor(){
        return this.box.fillColor.toCSS(true);
    }

    getHandColors(){
        return this.colors;
    }

}
