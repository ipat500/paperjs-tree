"use strict";

// var path = new Path.Rectangle(new Point(0, 0), new Point(view.viewSize.width, view.viewSize.height));
// project.activeLayer.lastChild.fillColor = 'black';
// var path = new Path.Rectangle(new Point(5, 5), new Point(view.viewSize.width-5, view.viewSize.height-5));
// project.activeLayer.lastChild.fillColor = 'white';

var path = new Path.Rectangle(new Point(0, 0), new Point(view.viewSize.width, view.viewSize.height));
project.activeLayer.lastChild.fillColor = '#a7e4e1';

var start = new Point(view.viewSize.width*0.5, view.viewSize.height*1);
var height = view.viewSize.height*0.70;
createTree(start, height)

function createTree(start, height) {
  var aspect = 1;
  var width = height*aspect;
  var from = start - new Size(width*0.5, height)
  var bounding = new Path.Rectangle(from, new Size(width, height));
  project.activeLayer.lastChild.fillColor = '#a7e4e1';

  var offset = new Point(width*-0.1, height*-0.3);
  //drawTrunk(start, height*0.9)
  drawSkeleton(start, height*0.9)
  //drawLeaf(start+offset, height*0.1)
}

function drawSkeleton(start, height) {
    var initialBranch = new Point(0, height*-0.45);
    var skeleton = addBranch(initialBranch, 1, 3);
    renderSkeletonSmooth(start, skeleton, height*0.12);
    //renderSkeleton(start, skeleton, height*0.005);
}

function addBranch(p, weight, n) {
  var children = [];
  if (n>0) {
    var b1= new Point(p);
    b1.angle += 45;
    b1.length *= 0.6;
    children.push(addBranch(b1, weight*0.6, n-1));
    var b2= new Point(p);
    b2.angle -= 10;
    b2.length *= 0.65;
    children.push(addBranch(b2, weight*0.6, n-1));
    var b2= new Point(p);
    b2.angle -= 60;
    b2.length *= 0.62;
    children.push(addBranch(b2, weight*0.6, n-1));
  }
  return {p: p, c: children, weight: weight};
}

function renderSkeleton(start, skeleton, strokeWidth) {
  new Path.Line(start, start+skeleton.p);
  project.activeLayer.lastChild.strokeColor = '#F00';
  project.activeLayer.lastChild.strokeWidth = strokeWidth;
  for (var i=0; i<skeleton.c.length; ++i) {
    renderSkeleton(start+skeleton.p, skeleton.c[i], strokeWidth*0.8);
  }
}

function renderSkeletonSmooth(start, skeleton, baseWidth) {
  var path = new Path({
    fillColor: '#5d4120',
    // strokeColor: '#5d4120'
  });

  var hOutThere = new Point(length*0.5, -length*0.3);
  path.add(new Segment(start+new Point(baseWidth/2, 0), null, hOutThere));
  recurse(path, start, skeleton);
  var hInBack = new Point(length*-0.7, -length*0.2);
  path.add(new Segment(start+new Point(-baseWidth/2, 0), null, hOutThere));

  function recurse(path, start, skeleton) {
    var length = skeleton.p.length;
    if (skeleton.c.length==0) {
      var hOutThere = new Point(skeleton.p) * -0.4;
      var hInBack = new Point(skeleton.p) * -0.4;
      //markPoint(start+skeleton.p);
      path.add(new Segment(start + skeleton.p, hInBack, hOutThere));
    } else {
      path.add(getSideSection(start, skeleton, skeleton.c[0], true));
      var lastChild = null;
      for (var i=0; i<skeleton.c.length; ++i) {
        if (lastChild) {
          // var hInBack = new Point(lastChild.p) * 0.4;
          // var hOutThere = new Point(skeleton.c[i].p) * 0.4;
          // path.add(new Segment(start + skeleton.p*1.2, hInBack, hOutThere));
          path.add(getJoinSection(start + skeleton.p, lastChild, skeleton.c[i]));
        }
        recurse(path, start + skeleton.p , skeleton.c[i]);
        lastChild = skeleton.c[i];
      }
      path.add(getSideSection(start, skeleton, skeleton.c.slice(-1)[0], false));
    }
  }

  function getJoinSection(start, b1, b2) {
    var averageWidth = (b1.weight + b2.weight)/2.0;
    console.log(averageWidth);
    var p = (b1.p + b2.p).normalize()*((b1.p-b2.p)/b1.p.length).length*averageWidth*50;
    var h1 = (b1.p-p)*0.2;
    var h2 = (b2.p-p)*0.2;
    return new Segment(start + p, h1, h2);
  }

  function getSideSection(start, parentBranch, childBranch, isThere) {
    var p = childBranch.p.normalize()-parentBranch.p.normalize();
    p.length = baseWidth*parentBranch.weight/2;
    //markPoint(start + parentBranch.p + p);

    var hThere = parentBranch.p + childBranch.p;
    hThere.length = childBranch.p.length*0.18;
    var hBack = new Point(hThere);
    hBack.length = parentBranch.p.length*-0.18;
    // markPoint(start + parentBranch.p + p + hThere);
    // markPoint(start + parentBranch.p + p + hBack);
    if (isThere) {
      return new Segment(start + parentBranch.p + p, hBack, hThere);
    } else {
      return new Segment(start + parentBranch.p + p, hThere, hBack);
    }
  }
}

function drawTrunk(start, length) {
  markPoint(start);
  var width = length*0.1;

  var path = new Path({
    fillColor: '#5d4120',
    //strokeColor: '#5d4120'
  });
  var backList = [];
  var r = getBottomSection(start, 0, 0.2*length, width);
  path.add(r[0]);
  backList.push(r[1]);
  markPoint(r[2]);
  r = getSection(r[2], 0, 0.2*length, width);
  path.add(r[0]);
  backList.push(r[1]);
  markPoint(r[2]);
  r = getSection(r[2], 0, 0.2*length, width);
  path.add(r[0]);
  backList.push(r[1]);
  markPoint(r[2]);
  r = getSection(r[2], 0, 0.2*length, width);
  path.add(r[0]);
  backList.push(r[1]);
  markPoint(r[2]);
  var top = getTopSection(r[2], 0, 0.2*length);
  path.add(top);
  for (var i = backList.length-1; i >= 0; --i) {
    path.add(backList[i]);
  }

  // Each section is an elbow in the chain. h1 is the
  // There is left, back is right.
  function getSection(start, angle, length, width) {
    var pThere = start + new Point(width/2, 0);
    var pBack = start + new Point(-width/2, 0);
    markPoint(pThere);
    markPoint(pBack);
    var hInThere = new Point(length*0.5, length*0.3);
    var hOutBack = new Point(length*-0.7, length*0.2);
    var hOutThere = new Point(length*0.5, -length*0.3);
    var hInBack = new Point(length*-0.7, -length*0.2);
    var segmentThere = new Segment(pThere, hInThere, hOutThere);
    var segmentBack = new Segment(pBack, hInBack, hOutBack);
    return [segmentThere, segmentBack, (start + new Point(0, -length))]
  }

  function getBottomSection(start, angle, length, width) {
    var pStart = start + new Point(width/2, 0);
    var pEnd = start + new Point(-width/2, 0);
    markPoint(pStart);
    markPoint(pEnd);
    var hOutThere = new Point(length*0.5, -length*0.3);
    var hInBack = new Point(length*-0.7, -length*0.2);
    var segmentThere = new Segment(pStart, null, hOutThere);
    var segmentBack = new Segment(pEnd, hInBack, null);
    return [segmentThere, segmentBack, (start + new Point(0, -length))]
  }

  function getTopSection(start, angle, length) {
      var hInThere = new Point(length*0.5, length*0.3);
      var hOutBack = new Point(length*-0.7, length*0.2);
      var segmentTop = new Segment(start, hInThere, null);//hOutBack);
      return segmentTop
  }
}

function markPoint(p) {
  new Path.Circle(p, 5);
  project.activeLayer.lastChild.fillColor = 'black';
}

function drawLeaf(start, length) {
  markPoint(start);
  var bounding = new Path.Rectangle(start, new Size(length, length));
  project.activeLayer.lastChild.fillColor = 'green';
}
