class Finger{


    constructor(boxsize, colors, offset){
        this.colors = colors;
        this.coloredObjs = [];
        this.tinyFingers = [];
        this.offset = offset;

        this.generate(boxsize);
        if(this.offset){
            this.offsetColors();
        }

    }

    generate(boxsize){
        this.fingers = [];
        this.box = new Path.Rectangle([0,0], boxsize);
        this.box.position = view.bounds.center;
        this.coloredObjs.push(this.box);

        this.bigHandOffset = [_.random(4,8)*_.sample([-1,1]),_.random(4,8)*_.sample([-1,1])];
        //view.zoom = 0.2;

        this.box.fillColor = this.colors.pop();


        for(let i = 0; i<500; i++){
            //if(i%100==0)
                //console.log(i);
            let h1 = this.drawhand();
            h1.fillColor = this.getRandomColor();
            if( i > 7 ){
                h1.scale(_.random(5,20)/100);
            }
            h1.rotate(_.random(0, 360));
            if(_.random(0,1)==0){
                h1.scale(-1,1);
            }
            h1.position = [this.box.bounds.topLeft.x+_.random(0,this.box.bounds.width), this.box.bounds.topLeft.y+_.random(0,this.box.bounds.height)];
            if(!this.collides(h1, false)){
                this.fingers.push(h1);
                if( i <= 7){
                    h1 = this.decoHand(h1);
                }else{
                    let h2 = h1.clone();
                    h1.strokeColor = undefined;
                    this.coloredObjs.push(h1);
                    h2.fillColor = undefined;

                    this.tinyFingers.push(h1);
                    this.tinyFingers.push(h2);
                }
            }else{
                h1.remove();
            }
        }

        this.box.rotate(_.random(-3,3,true));
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
        h2.strokeColor = undefined;
        let h3 = hand.clone();
        h3.fillColor = undefined;
        h3.strokeWidth *= 1.5;
        hand.strokeColor = undefined;
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

        let g = new Group(hand, h2, lines);
        this.coloredObjs.push(h2);
        this.coloredObjs.push(lines);
        g.clipped = true;
        if(this.offset){
            g.translate(this.bigHandOffset);
            g.myOffset = this.bigHandOffset;
        }
        this.coloredObjs.push(g);
        h3.bringToFront();
        //let g2 = new Group(g, h3);
        //return g2;
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

        this.wiggle(line);

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
