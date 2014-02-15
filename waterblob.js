var ctx;
var mousedown = false;

var oldX;
var oldY;

var waterSize = 30;

var mouseX;
var mouseY;

var seperationEnabled = false;

$(function() {
	var canvasQ = $('.water');
  var canvas = canvasQ.get(0);
  ctx = canvas.getContext('2d');
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  WIDTH = canvas.width;
  HEIGHT = canvas.height;
	pixels = new Array(WIDTH * HEIGHT);

  water_init();

  $('body').keypress(function( event ) {
  	if (event.which == 101) { //e
  		draw_owner = 0;
  		draw_color = WHITE;
  	}
  	else if (event.which == 100) { //d
  		draw_owner = -2
  		draw_color = ORANGE;
  	}
  	else if (event.which == 119) { //d
  		draw_owner = 1;
  	}
	});
 

  canvasQ.mousedown(function(e){
    mousedown = true;
	});

	canvasQ.mouseup(function(e){
    mousedown = false;
 	});

  canvasQ.mousemove(function(e){
   	mouseX = Math.floor((e.pageX-canvasQ.offset().left));
    mouseY = Math.floor((e.pageY-canvasQ.offset().top));
 	});

  setInterval(iteration, 5);
});

$("#canvas")

var WIDTH;
var HEIGHT;

var start_blob = new Blob();
var current_blob = null;

var queueStart = new Blob();

var pixels;
var lineX = new Array(5000);
var lineY = new Array(5000);

var frame = 0;
var frameRate = 0;
var previousFrameTime = 0;

var previousRepaint = 0;

var debug = true;

var BLUE = [0,0,255,255];
var ORANGE = [200,100,50,128];
var WHITE = [0,0,0,0];
var RED = [255,0,0,255];
var CYAN = [255,255,0,255];


var refs = new Array(1000000);

var idCount = 1;

var groupCount = 0;
var groups = new Array(100000);
var c = 0;

var draw_owner = -2;
var draw_color = ORANGE;

//static final int[] color = new int[Water.WIDTH*Water.HEIGHT];
var imageData;

function draw() {
  //ctx.fillStyle = "rgb(200,0,0)";
  //console.log('drawing');
  ctx.putImageData(imageData, 0, 0);
}

function water_init() {
	start_blob.next = start_blob;
	start_blob.prev = start_blob;

	for(var x = 0; x < WIDTH; x++)
		for(var y = 0; y < HEIGHT; y++)
		{
			pixels[x+y*WIDTH] = new Pixel((x==0?null:pixels[x-1+y*WIDTH]),x+y*WIDTH);

			if(x == 50 || x == WIDTH-50 || y == 50  /*|| Math.abs(12*Math.sin(0.06*x) - y + 430) < 4*/  || x == 1 || x == WIDTH-1 || y == HEIGHT-50 || y == HEIGHT-1)
				changePixel(x,y,-2,ORANGE);
			else
				changePixel(x,y,0,WHITE);
		}

		for(var x = 1; x < WIDTH-1; x++)
			for(var y = 1; y < HEIGHT-1; y++) {
				imageData.data[(x*WIDTH+y)*4] = 100;
				pixels[x+y*WIDTH].setNeighbors(	pixels[x+((y-1)*WIDTH)],
												pixels[(x+1)+(y*WIDTH)],
												pixels[x+((y+1)*WIDTH)],
												pixels[(x-1)+(y*WIDTH)],
												pixels[(x+1)+((y-1)*WIDTH)],
												pixels[(x+1)+((y+1)*WIDTH)],
												pixels[(x-1)+((y+1)*WIDTH)],
												pixels[(x-1)+((y-1)*WIDTH)]);
			}

		queueStart.prev = queueStart.next = queueStart;

		//changePixels(50, 50, 25, 50, BLUE);
		//pixelRegion(50, 50, 100, 100);
}

function pixelRegion(x, y, length, width) {
	var c;
	for(var x2 = x; x2 < x + length; x2++) {
		for(var y2 = y; y2 < y + width; y2++) {
			if(pixels[x2+(y2*WIDTH)].owner == 0) {
				var w = pixels[x2+(y2*WIDTH)];

				c = null;

				for(var i = 0; i < 4; i++) {
					var n = w.neighbors[i];
					n.open++;
					if(n.owner > 0)
						c = (c != null ? combineBlobs(c,refs[n.owner]) : refs[n.owner]);
				}

				if(c != null)
					c.acceptPixel(w);
				else
				{
					var p = new Pixel();
					p.prev = p.next = w;
					w.next = w.prev = p;
					//w.next = w.prev = w;
					addBlob(new Blob(p));
				}
			}
		}
	}
}

function changePixels(x,y,r,m,c)
{
	for(var x2 = -r; x2 < r; x2++)
		for(var y2 = -r; y2 < r; y2++)
			changePixel(x-2 + x2,y-2 + y2,m,c);
}

function changePixel(x,y,m,c)
{
	if(x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
		return;

	var p = pixels[x+y*WIDTH];

	if(p.owner > 0 || p.owner == -1)
		blobAt(p).clearPixel(p);

	p.owner = m;
	p.setColor(c);
}

function iteration() {
	frame++;
	frameRate++;

	now = new Date().getTime();

	if(now - previousFrameTime > 1000)
	{
		//console.log("FPS: " + frameRate);
		frameRate = 0;
		previousFrameTime = now;
	}

	var current = start_blob.next;
	while(current != start_blob)
	{
		current.run();
		current = current.next;
	}

	//start - queueStart.next - queueStart.prev - start.next
	if(queueStart != queueStart.next)
	{
		queueStart.prev.next = start_blob.next;
		queueStart.next.prev = start_blob;
		start_blob.next.prev = queueStart.prev;
		start_blob.next = queueStart.next;

		queueStart.prev = queueStart.next = queueStart;
	}

	gui_iteration();

	if(now-previousRepaint> 15)
	{
		draw();
		previousRepaint = now;
	}
}

function gui_iteration() {
	if (mousedown) {
		//changePixels(x - 3, y - 3, 7, -2, ORANGE);

		if (draw_owner != 1) {
			var incr = .9/Math.sqrt((oldX-mouseX)*(oldX-mouseX)+(oldY-mouseY)*(oldY-mouseY));

			for(var i = 0;i < 1;i += incr)
			{
				changePixel(Math.floor(mouseX*i-oldX*i+oldX),Math.floor(mouseY*i-oldY*i+oldY),draw_owner,draw_color);
				changePixel(Math.floor(mouseX*i-oldX*i+oldX)+1,Math.floor(mouseY*i-oldY*i+oldY),draw_owner,draw_color);
				changePixel(Math.floor(mouseX*i-oldX*i+oldX),Math.floor(mouseY*i-oldY*i+oldY)+1,draw_owner,draw_color);
				changePixel(Math.floor(mouseX*i-oldX*i+oldX)+1,Math.floor(mouseY*i-oldY*i+oldY)+1,draw_owner,draw_color);
			}
		} else {
			if (frame % 5 == 0) {
				pixelRegion(mouseX-(waterSize/2),mouseY-(waterSize/2),waterSize,waterSize);
			}
		}
	}

	oldX = mouseX;
	oldY = mouseY;
}

function changePixels(x,y,r,m,c) {
	for(var x2 = -r; x2 < r; x2++)
		for(var y2 = -r; y2 < r; y2++)
			changePixel(x-2 + x2,y-2 + y2,m,c);
}

function changePixel(x,y,m,c) {
	if(x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
		return;

	var p = pixels[x+y*WIDTH];

	if(p.owner > 0 || p.owner == -1)
		blobAt(p).clearPixel(p);

	p.owner = m;
	p.setColor(c);
}

function combineBlobs(a, b) {
	if(a == b) return a;

	a.destroy();
	b.destroy();

	var startA = a.startB;
	var startB = b.startB;

	//startA - startB.next - startB.prev - startA.next
	startB.next.prev = startA;
	startB.prev.next = startA.next;
	startA.next.prev = startB.prev;
	startA.next = startB.next;

	var newB = new Blob(startA);
	addBlob(newB);

	return newB;
}

///start - newb - start.next
function addBlob(newb) {
	///queueStart - newb - queueStart.next
	newb.prev = queueStart;
	newb.next = queueStart.next;
	queueStart.next.prev = newb;
	queueStart.next = newb;
}



function Pixel(left, value, x, y, neighbors, neighborsAll) {
	this.left = left;
	this.value = value;
	this.x = x || value % WIDTH;
	this.y = y || value / WIDTH;
	this.neighbors = neighbors || [null,null,null,null];
	this.neighborsAll = neighborsAll || [null,null,null,null,null,null,null,null];

	this.prev = null;
	this.next = null;

	this.t = null;

	this.owner = 0;
	this.open = 0;
	this.group = 0;
}

Pixel.prototype.setNeighbors = function (north, east, south, west, ne, se, sw, nw)
{
	this.neighbors[0] = north;
	this.neighbors[1] = east;
	this.neighbors[2] = south;
	this.neighbors[3] = west;
	//this.neighbors = [north, east, south, west];

	this.neighborsAll[0] = north;
	this.neighborsAll[1] = east;
	this.neighborsAll[2] = ne;
	this.neighborsAll[3] = nw;
	this.neighborsAll[4] = ne;
	this.neighborsAll[5] = se;
	this.neighborsAll[6] = sw;
	this.neighborsAll[7] = nw;
}

Pixel.prototype.setColor = function (color)
{
	//todo - before was color[value] = c;
	imageData.data[this.value*4] = color[0];
	imageData.data[this.value*4 + 1] = color[1];
	imageData.data[this.value*4 + 2] = color[2];
	imageData.data[this.value*4 + 3] = color[3];
}

function Blob(startA) {
	this.ID = 0;
	this.startB = null;

	this.remove = null;
	this.current = null;

	this.next = null;
	this.prev = null;

	if (startA) {
		refs[this.ID = ++idCount] = this;

		this.startB = startA;
		this.remove = this.startB;

		this.current = startA.next;
		while (this.current != startA) {
			this.current.owner = this.ID;
			this.current = this.current.next;
		}
	}
}

Blob.prototype.run = function()
{
	if(this.startB == this.startB.next){this.destroy();return;}

	if(this.startB == this.startB.next.next){this.destroy2();return;}
	if(this.startB == this.startB.next.next.next){this.destroy2();return;}

	var current = this.startB;

	//Iterates through every outer pixel
	do
	{
		current = current.next;

		if (!current.neighbors[0])
			continue;

		//Iterates through each neighbor and evaluating each as the new pixel
		for(var i = 0; i < 4; i++) {
			var pixelA = current.neighbors[i];
			if(pixelA.owner != 0) continue;

			//Iterates through the new pixel's neighbors to check for colliding blobs
			for(var k = 0; k < 4; k++) {
				n = pixelA.neighbors[k];
				if(n.owner > 0 && n.owner != this.ID)
				{
					combineBlobs(this,blobAt(n));
					return;
				}
			}

			var pixelR = (this.remove = this.remove.prev);

			///////////////////////////////////////////////////////////////////////////

			if(pixelR.x - pixelA.x < -100) continue;//Realistic Phyics Modifier
			if(pixelR.x - pixelA.x > 100) continue;//Realistic Phyics Modifier

			if(pixelA.value < pixelR.value) continue;

			if(this.remove == this.startB) continue;
			if(this.remove == current) continue;

			///////////////////////////////////////////////////////////////////////////

			this.removeFromBorder(pixelR);

			pixelR.owner = 0;
			pixelR.setColor(WHITE);

			//Iterates through the removee's neighbors and adds water to the border.
			for(k = 0; k < 4; k++)
			{
				n = pixelR.neighbors[k];
				n.open--;

				if(n.owner == -1)
					this.addToBorder(n);
			}

			//Either adds the new pixel to the border or to the middle
			if(pixelA.open != 4)
			{
				this.addToBorder(pixelA);
			}
			else
			{
				pixelA.owner = -1;
				pixelA.setColor(BLUE);
			}

			//Iterates through the new pixel's neighbors and
			for(k = 0; k < 4; k++) {
				n = pixelA.neighbors[k];
				n.open++;

				if(n.open == 4 && n.owner == this.ID)
					this.removeFromBorder(n);
			}
		}
	}
	while(current != this.startB);

	if (frame % 5 == 0 && seperationEnabled) {
		this.seperationDetect();
	}
}

Blob.prototype.acceptPixel = function(p)
{
	p.setColor(BLUE);

	if(p.open == 4)
		p.owner = -1;
	else
		this.addToBorder(p);

	for(var i = 0; i < 4; i++) {
		n = p.neighbors[i];
		if(n.open == 4 && n.owner == this.ID)
			this.removeFromBorder(n);
	}

	for(var i = 0; i < 4; i++) {
		n = p.neighbors[i];
		if(n.owner > 0 && n.owner != this.ID)
			combineBlobs(this,blobAt(n));
	}
}

Blob.prototype.addToBorder = function(p) {
	if(debug)
		p.setColor(RED);
	else
		p.setColor(BLUE);

	p.owner = this.ID;

	//smooth movement - (Odd Movement can be achieved by inverting the "prev" and "next")
	//startB - p -  startB.next
	p.prev = this.startB;
	p.next = this.startB.next;
	this.startB.next.prev = p;
	this.startB.next = p;
}

Blob.prototype.removeFromBorder = function(p)
{
	if(debug)
		p.setColor(BLUE);

	if(this.remove == p)
		this.remove = this.remove.prev;

	if(p == this.current)
		this.current = this.current.next;

	p.owner = -1;

	//p.prev - p.next
	p.next.prev = p.prev;
	p.prev.next = p.next;
}

Blob.prototype.destroy = function() {
	this.prev.next = this.next;
	this.next.prev = this.prev;

	if(current_blob == this)
		current_blob = this.prev;
}

Blob.prototype.destroy2 = function() {
	this.destroy();

	var current = this.startB;

	do
	{
		current = current.next;

		if(current != this.startB)
			this.vaporizePixel(current);
	}
	while(current != this.startB);
}

Blob.prototype.clearPixel = function(p) {
	if(p.owner == this.ID)
		this.removeFromBorder(p);

	p.setColor(WHITE);
	p.owner = 0;

	for(var i = 0; i < 4; i++) {
		n = p.neighbors[i];
		n.open--;

		if(n.owner == -1)
			this.addToBorder(n);
	}
}

Blob.prototype.vaporizePixel = function(p) {
  if (!p.neighbors[0])
  	return;

	p.setColor(WHITE);
	p.owner = 0;

	for(var i = 0; i < 4; i++) {
		n = p.neighbors[i];
		n.open--;
	}
}

///////////////////////////////////////////////////////////////////////////
//////////////////         Seperation Code          ///////////////////////
///////////////////////////////////////////////////////////////////////////

Blob.prototype.seperationDetect = function()
{
	groupCount = 0;

	var current = this.startB;
	do
	{
		current.t = current.next;
		current.next = null;
		current = current.t;
	}
	while(current != this.startB);

	current = this.startB;
	do
	{
		current = current.t;

		if (!current.neighborsAll[0])
			continue;

		for(var i = 0; i < 8; i++) {
			n = current.neighborsAll[i];
			if(n.owner == this.ID)
				this.connect(current,n);
		}
	}
	while(current != this.startB);

	current = this.startB.t;
	while(current != this.startB)
	{
		if(current.next == null)
			this.vaporizePixel(current);

		current = current.t;
	}

	this.destroy();

	for(var i = 0;i < groupCount;i++)
	{
		var b = groups[i];

		if(b != null)
		{
			var a = new Pixel();
			a.next = b.next;
			a.prev = b;
			a.next.prev = a;
			b.next = a;

			addBlob(new Blob(b));
		}
	}
}

Blob.prototype.connect = function(a, b) {
	var ag = a.next;
	var bg = b.next;

	if(ag == null && bg == null)
	{
		b.group = a.group = groupCount;

		a.prev = a.next = b;
		b.prev = b.next = a;

		groups[groupCount++] = a;
	}
	else if(ag == null)
	{
		a.group = b.group;

		a.prev = b;
		a.next = b.next;
		b.next = b.next.prev = a;
	}
	else if(bg == null)
	{
		b.group = a.group;

		b.prev = a;
		b.next = a.next;
		a.next = a.next.prev = b;
	}
	else if(a.group != b.group)
	{
		b.prev.next = a.next;
		a.next.prev = b.prev;
		b.prev = a;
		a.next = b;

		groups[b.group] = groups[a.group] = null;

		var current = a;
		do
		{
			current.group = groupCount;
			current = current.next;
		}while(current != a);

		groups[groupCount++] = a;
	}
}

function blobAt(p) {
	while(p.owner <= 0)
		p = p.left;

	return refs[p.owner];
}
