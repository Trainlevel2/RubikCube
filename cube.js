//code
var canvas;
var gl;

var NumVertices=36;

var points = [];				//Array of Vertices
var colors = [];

// var axis = 0;
var theta = [0,0,0]
var thetaLoc;
var moving = 0;
var reverse = 0;
var rMatrixLoc;
var start = false;
var enter = 0;
var ind = 0;

var near   = -1.5;
var far    =  1.5;
var bottom = -1.5;
var ytop   =  1.5;
var left   = -1.5;
var right  =  1.5;
var g = 0;
var eye    = vec3(0.2,0.2,1.0);
const at = vec3(0.0,0.0,0.0);
const up = vec3(0.0,1.0,0.0);
var mvMatrixLoc;
var pMatrixLoc;
var grMatrixLoc;
var mvMatrix;	//Model-view Matrix
var pMatrix;	//Projection Matrix
var totpoints=[];
var totcolors=[];

var mPrime=0;
var oPrime=0;
var vPrime=0;
var v=0;
var m=0;
var o=0;

// Keys - Planes
var numKey=0;
var thetatemp = 0;
var L; //Left
var R; //Right
var M; //Horizontal Middle
var D; //Down/Bottom
var U; //Up/Top
var B; //Back
var F; //Front
var V; //Vertical Middle
var O; //Second Layer
var SHFT = 0;

var cubes=[];



function noneMoving(){
	for(var i = 0; i<cubes.length; i++){
		if(cubes[i].moving){
			return false;
		}
	}
	return true;
}

//Initialize all the values
function initKeyGroups(){
	L = new Object();
	L.left   = [0,3,6];
	// L.vertic = [9,12,15];
	L.right  = [18,21,24];
	L.down   = [0,9,18];
	L.middle = 12;
	L.up     = [6,15,24];
	L.solved = [0,3,6,9,12,15,18,21,24]; //Left

	R = new Object();
	R.right  = [2,5,8];
	// R.vertic= [11,14,17];
	R.left = [20,23,26];
	R.down  = [2,11,20];
	R.middle= 14;
	R.up    = [8,17,26];
	R.solved = [2,5,8,11,14,17,20,23,26]; //Right

	U = new Object();
	U.up    = [6,7,8];
	U.middle=16;
	U.down  = [24,25,26];
	U.left  = [6,15,24];
	// U.vertic= [7,16,25];
	U.right = [8,17,26];
	U.solved = [6,7,8,15,16,17,24,25,26]; //Up/Top

	D = new Object();
	D.down  = [0,1,2];
	D.middle= 10;
	D.up    = [18,19,20];
	D.left  = [0,9,18];
	// D.vertic= [1,10,19];
	D.right = [2,11,20];
	D.solved = [0,1,2,9,10,11,18,19,20]; //Down/Bottom

	B = new Object();
	B.down  = [0,1,2];
	B.middle= 4;
	B.up    = [6,7,8];
	B.right  = [0,3,6];
	// B.vertic= [1,4,7];
	B.left = [2,5,8];
	B.solved = [0,1,2,3,4,5,6,7,8]; //Back

	F = new Object();
	F.down  = [18,19,20];
	F.middle= 22;
	F.up    = [24,25,26];
	F.left  = [18,21,24];
	// F.vertic= [19,22,25];
	F.right = [20,23,26];	
	F.solved = [18,19,20,21,22,23,24,25,26]; //Front

}

window.onload = function init(){
	canvas = document.getElementById("cube");
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || initWebGL(canvas);
	if (!gl) {
		window.alert("Error: Could not find WebGL");
		return;
	}



	//Setup WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor(0.0, 1.0, 1.0, 1.0);
	
	gl.enable(gl.DEPTH_TEST);

	// Shaders
	var program = initShaders(gl,"vertex-shader", "fragment-shader");
	gl.useProgram(program);

	for(var i = 0; i<27; i++){
		//Cube
		buildCube(i);
	}
	initKeyGroups();

	//After generating each cube, create everything to render each cube
	// Color Buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(totcolors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	// Vertex Buffer	
	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(totpoints), gl.STATIC_DRAW );

	// Associate shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	rMatrixLoc = gl.getUniformLocation (program, "rMatrix");
	thetaLoc   = gl.getUniformLocation (program, "theta"   );
	mvMatrixLoc= gl.getUniformLocation (program, "mvMatrix");
	pMatrixLoc = gl.getUniformLocation (program, "pMatrix" );
	grMatrixLoc = gl.getUniformLocation(program, "grMatrix");

	checkIt();

 	render();
    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
    	g=1;
    	rotateCubeHoriz();
    };
    document.getElementById( "yButton" ).onclick = function () {
    	g=1;
    	rotateCubeVert();
    };
 
	document.getElementById( "Reverse" ).onclick = function () {
		reverse = !reverse;
    };    
}
function rotateObjCo(Obj){

	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!reverse){
		var tempu = Obj.up;
		var tempr = Obj.right;
		var tempd = Obj.down;
		var templ = Obj.left; 
		Obj.right = tempu;   //right = up
		Obj.up  = templ;   //up = left
		Obj.left = tempd; //left = down
		Obj.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = Obj.up;
		var tempd = Obj.down;
		var templ = Obj.left;
		var tempr = Obj.right;
		Obj.up = tempr;	//up = right
		Obj.left = tempu;	//left = up
		Obj.down = templ; //down = left
		Obj.right = tempd;//right= down
	}
}

function rotateCubeHoriz(){
    	for(var i = 0; i<cubes.length; i++){
    		if(cubes[i].moving){
    			return;
    		}
    	}
    	for(var i = 0; i<cubes.length; i++){
    		if(!reverse)
    			cubes[i].axis = 1;
    		else
		        cubes[i].axis = 4;
    		cubes[i].moving = 1;
    	}
    	if(cubes[0].axis>2){
    		var tempF = JSON.parse(JSON.stringify(F));
    		var tempR = JSON.parse(JSON.stringify(R));
    		var tempL = JSON.parse(JSON.stringify(L));
    		var tempB = JSON.parse(JSON.stringify(B));
    		L = tempB;
    		F = tempL;
    		R = tempF;
    		B = tempR;
    		reverse = 0;
       		rotateObjCo(D);	//rotate D plane counterclockwise
    		reverse = 1;
    		rotateObjCo(U);    //rotate U plane clockwise
    		// reverse = 1;
    	}
    	else{
    		var tempF = JSON.parse(JSON.stringify(F));
    		var tempR = JSON.parse(JSON.stringify(R));
    		var tempL = JSON.parse(JSON.stringify(L));
    		var tempB = JSON.parse(JSON.stringify(B));
    		L = tempF;
    		F = tempR;
    		R = tempB;
    		B = tempL
    		reverse = 1;
    		rotateObjCo(D);   //rotate U plane counterclockwise
    		reverse = 0;
    		rotateObjCo(U);   //rotate D plane clockwise
    	}

}

function rotateCubeVert(){
    	for(var i = 0; i<cubes.length; i++){
    		if(cubes[i].moving){
    			return;
    		}
    	}
     	for(var i = 0; i<cubes.length; i++){
     		if(!reverse)
     			cubes[i].axis=0;
     		else
	        	cubes[i].axis =3;
    		cubes[i].moving = 1;
    	}
    	if(cubes[0].axis>2){
    		var tempF = JSON.parse(JSON.stringify(F));
    		var tempD = JSON.parse(JSON.stringify(D));
    		var tempB = JSON.parse(JSON.stringify(B));
    		var tempU = JSON.parse(JSON.stringify(U));
    		F = tempU;
    		D = tempF;
    		rotateObjCo(tempD);
    		rotateObjCo(tempD);
    		B = tempD
    		rotateObjCo(tempB);
    		rotateObjCo(tempB);
    		U = tempB;
    		reverse = 0;
    		rotateObjCo(L);
    		reverse = 1;
    		rotateObjCo(R);
    	}
    	else{
			// console.log("F.left"+F.left);
			// console.log("U.left"+U.left);
    		var tempF = JSON.parse(JSON.stringify(F));
    		var tempD = JSON.parse(JSON.stringify(D));
    		var tempB = JSON.parse(JSON.stringify(B));
    		var tempU = JSON.parse(JSON.stringify(U));
    		F = tempD;
    		rotateObjCo(tempB);
    		rotateObjCo(tempB);
    		D = tempB;
    		rotateObjCo(tempU);
    		rotateObjCo(tempU);
    		B = tempU;
    		U = tempF;
    		reverse = 0;
    		rotateObjCo(R);
    		reverse = 1;
    		// console.log("L.Left",L.left,"UP",L.up,"Right",L.right,"down",L.down+"\n");
    		rotateObjCo(L);
    		reverse = 0;
			// console.log("L.Left",L.left,"UP",L.up,"Right",L.right,"down",L.down+"\n");
			// console.log("F.left"+F.left);
    	}
}

function rotateL(){
	// console.log("RotateL");
	// console.log("Left",L.left,"UP",L.up,"Right",L.right,"down",L.down+"\n");
   	for(var i = 0; i<cubes.length; i++){
		cubes[i].axis = 3;
   	}
	//Rotate The Plane
	for(var i = 0; i<L.left.length; i++){
		cubes[L.left[i]].moving = 1;
	}
	cubes[L.up[1]].moving = 1;
	cubes[L.middle].moving = 1;
	cubes[L.down[1]].moving = 1;
	for(var i = 0; i<L.right.length; i++){
		cubes[L.right[i]].moving = 1;
	}
	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!SHFT){
		var tempu = L.up;
		var tempr = L.right;
		var tempd = L.down;
		var templ = L.left; 
		L.right = tempu;   //right = up
		L.up  = templ;   //up = left
		L.left = tempd; //left = down
		L.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = L.up;
		var tempd = L.down;
		var templ = L.left;
		var tempr = L.right;
		L.up = tempr;	//up = right
		L.left = tempu;	//left = up
		L.down = templ; //down = left
		L.right = tempd;//right= down
	}

	//adjust other paramters
	var indup = intersect(U.up,U.left);
	var inddown = intersect(U.down,U.left);
	U.left = JSON.parse(JSON.stringify(L.up));
	U.up[indup] = JSON.parse(JSON.stringify(L.up[intersect(L.up,L.left)]));
	U.down[inddown] = JSON.parse(JSON.stringify(L.up[intersect(L.up,L.right)]));

	indup = intersect(F.up,F.left);
	inddown = intersect(F.down, F.left);
	F.left = JSON.parse(JSON.stringify(L.right));
	F.up[indup] = JSON.parse(JSON.stringify(L.right[intersect(L.right,L.up)]));
	F.down[inddown] = JSON.parse(JSON.stringify(L.right[intersect(L.right,L.down)]));

	indup = intersect(D.up,D.left);
	inddown = intersect(D.down, D.left);
	D.left = JSON.parse(JSON.stringify(L.down));
	D.up[indup] = JSON.parse(JSON.stringify(L.down[intersect(L.down,L.right)]));
	D.down[inddown] = JSON.parse(JSON.stringify(L.down[intersect(L.down,L.left)]));

	indup = intersect(B.up,B.right);
	inddown = intersect(B.down,B.right);
	B.right = JSON.parse(JSON.stringify(L.left));
	B.up[indup] =JSON.parse(JSON.stringify(L.left[intersect(L.left,L.up)]));
	B.down[inddown] = JSON.parse(JSON.stringify(L.left[intersect(L.left,L.down)]));

	console.log("Left",L.left,"UP",L.up,"Right",L.right,"down",L.down+"\n");

}

function rotateR(){

	// console.log("RotateR");
	// console.log("Left",R.left,"UP",R.up,"Right",R.right,"down",R.down+"\n");

   	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = 0;
	for(var i = 0; i<R.left.length; i++){
		cubes[R.left[i]].moving = 1;
	}
	cubes[R.up[1]].moving = 1;
	cubes[R.middle].moving = 1;
	cubes[R.down[1]].moving = 1;
	for(var i = 0; i<R.right.length; i++){
		cubes[R.right[i]].moving = 1;
	}
	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!SHFT){
		var tempu = R.up;
		var tempr = R.right;
		var tempd = R.down;
		var templ = R.left; 
		R.right = tempu;   //right = up
		R.up  = templ;   //up = left
		R.left = tempd; //left = down
		R.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = R.up;
		var tempd = R.down;
		var templ = R.left;
		var tempr = R.right;
		R.up = tempr;	//up = right
		R.left = tempu;	//left = up
		R.down = templ; //down = left
		R.right = tempd;//right= down
	}
	//adjust other paramters
	var indup = intersect(U.up,U.right);
	var inddown = intersect(U.down,U.right);
	U.right = JSON.parse(JSON.stringify(R.up));
	U.up[indup] = JSON.parse(JSON.stringify(R.up[intersect(R.up,R.right)]));
	U.down[inddown] = JSON.parse(JSON.stringify(R.up[intersect(R.up,R.left)]));

	indup = intersect(F.up,F.right);
	inddown = intersect(F.down,F.right);
	F.right = JSON.parse(JSON.stringify(R.left));
	F.up[indup] = JSON.parse(JSON.stringify(R.left[intersect(R.left,R.up)]));
	F.down[inddown] = JSON.parse(JSON.stringify(R.left[intersect(R.left,R.down)]));

	indup = intersect(D.up,D.right);
	inddown = intersect(D.down, D.right);
	D.right = JSON.parse(JSON.stringify(R.down));
	D.up[indup] = JSON.parse(JSON.stringify(R.down[intersect(R.down,R.left)]));
	D.down[inddown] = JSON.parse(JSON.stringify(R.down[intersect(R.down,R.right)]));

	indup = intersect(B.up,B.left);
	inddown = intersect(B.down, B.left);
	B.left = JSON.parse(JSON.stringify(R.right));
	B.up[indup] = JSON.parse(JSON.stringify(R.right[intersect(R.right,R.up)]));
	B.down[inddown] = JSON.parse(JSON.stringify(R.right[intersect(R.right,R.down)]));

	console.log("Left",R.left,"UP",R.up,"Right",R.right,"down",R.down+"\n");	
}

function rotateU(){
	// console.log("RotateU");
	// console.log("Left",U.left,"UP",U.up,"Right",U.right,"down",U.down+"\n");
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = 1;
	//Rotate The Plane
	for(var i = 0; i<U.left.length; i++){
		cubes[U.left[i]].moving = 1;
	}
	cubes[U.up[1]].moving = 1;
	cubes[U.middle].moving = 1;
	cubes[U.down[1]].moving = 1;
	for(var i = 0; i<U.right.length; i++){
		cubes[U.right[i]].moving = 1;
	}
	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!SHFT){
		var tempu = U.up;
		var tempr = U.right;
		var tempd = U.down;
		var templ = U.left; 
		U.right = tempu;   //right = up
		U.up  = templ;   //up = left
		U.left = tempd; //left = down
		U.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = U.up;
		var tempd = U.down;
		var templ = U.left;
		var tempr = U.right;
		U.up = tempr;	//up = right
		U.left = tempu;	//left = up
		U.down = templ; //down = left
		U.right = tempd;//right= down
	}
	//adjust other paramters
	var indleft = intersect(B.left,B.up);
	var indright = intersect(B.right,B.up);
	B.up = JSON.parse(JSON.stringify(U.up));
	B.left[indleft] = JSON.parse(JSON.stringify(U.up[intersect(U.up,U.right)]));
	B.right[indright] = JSON.parse(JSON.stringify(U.up[intersect(U.up,U.left)]));

	indleft = intersect(R.left,R.up);
	indright = intersect(R.right,R.up);
	R.up = JSON.parse(JSON.stringify(U.right));
	R.left[indleft] = JSON.parse(JSON.stringify(U.right[intersect(U.right,U.down)]));
	R.right[indright] = JSON.parse(JSON.stringify(U.right[intersect(U.right,U.up)]));

	indleft = intersect(F.left,F.up);
	indright = intersect(F.right,F.up);
	F.up = JSON.parse(JSON.stringify(U.down));
	F.left[indleft] = JSON.parse(JSON.stringify(U.down[intersect(U.down,U.left)]));
	F.right[indright] = JSON.parse(JSON.stringify(U.down[intersect(U.down,U.right)]));

	indleft = intersect(L.left,L.up);
	indright = intersect(L.right,L.up);
	L.up = JSON.parse(JSON.stringify(U.left));
	L.left[indleft] = JSON.parse(JSON.stringify(U.left[intersect(U.left,U.up)]));
	L.right[indright] = JSON.parse(JSON.stringify(U.left[intersect(U.left,U.down)]));
	console.log("Left",U.left,"UP",U.up,"Right",U.right,"down",U.down+"\n");
}

function rotateD(){
	// console.log("RotateD");
	// console.log("Left",D.left,"UP",D.up,"Right",D.right,"down",D.down+"\n");
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = 4;
	//Initialize Parameters
	//Rotate The Plane
	for(var i = 0; i<D.left.length; i++){
		cubes[D.left[i]].moving = 1;
	}
	cubes[D.up[1]].moving = 1;
	cubes[D.middle].moving = 1;
	cubes[D.down[1]].moving = 1;
	for(var i = 0; i<D.right.length; i++){
		cubes[D.right[i]].moving = 1;
	}
	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!SHFT){
		var tempu = D.up;
		var tempr = D.right;
		var tempd = D.down;
		var templ = D.left; 
		D.right = tempu;   //right = up
		D.up  = templ;   //up = left
		D.left = tempd; //left = down
		D.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = D.up;
		var tempd = D.down;
		var templ = D.left;
		var tempr = D.right;
		D.up = tempr;	//up = right
		D.left = tempu;	//left = up
		D.down = templ; //down = left
		D.right = tempd;//right= down
	}
	//adjust other paramters
	var indleft = intersect(F.left,F.down);
	var indright = intersect(F.right,F.down);
	F.down = JSON.parse(JSON.stringify(D.up));
	F.left[indleft] = JSON.parse(JSON.stringify(D.up[intersect(D.up,D.left)]));
	F.right[indright] = JSON.parse(JSON.stringify(D.up[intersect(D.up,D.right)]));

	indleft = intersect(R.left,R.down);
	indright = intersect(R.right,R.down);
	R.down = JSON.parse(JSON.stringify(D.right));
	R.left[indleft] = JSON.parse(JSON.stringify(D.right[intersect(D.right,D.up)]));
	R.right[indright] = JSON.parse(JSON.stringify(D.right[intersect(D.right,D.down)]));

	indleft = intersect(B.left,B.down);
	indright = intersect(B.right,B.down);
	B.down = JSON.parse(JSON.stringify(D.down));
	B.left[indleft] = JSON.parse(JSON.stringify(D.down[intersect(D.down,D.right)]));
	B.right[indright] = JSON.parse(JSON.stringify(D.down[intersect(D.down,D.left)]));

	indleft = intersect(L.left,L.down);
	indright = intersect(L.right,L.down);
	L.down = JSON.parse(JSON.stringify(D.left));
	L.left[indleft] = JSON.parse(JSON.stringify(D.left[intersect(D.left,D.down)]));
	L.right[indright] = JSON.parse(JSON.stringify(D.left[intersect(D.left,D.up)]));
	console.log("Left",D.left,"UP",D.up,"Right",D.right,"down",D.down+"\n");
}

function rotateB(){

	// console.log("RotateB");
	// console.log("Left",B.left,"UP",B.up,"Right",B.right,"down",B.down+"\n");
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = 2;
	//Initialize Paramters
	// B.up = U.up;
	// B.left = R.right;
	// B.right = L.left;
	// B.down = D.down;
	//Rotate The Plane
	for(var i = 0; i<B.left.length; i++){
		cubes[B.left[i]].moving = 1;
	}
	cubes[B.up[1]].moving = 1;
	cubes[B.middle].moving = 1;
	cubes[B.down[1]].moving = 1;
	for(var i = 0; i<B.right.length; i++){
		cubes[B.right[i]].moving = 1;
	}
	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!SHFT){
		var tempu = B.up;
		var tempr = B.right;
		var tempd = B.down;
		var templ = B.left; 
		B.right = tempu;   //right = up
		B.up  = templ;   //up = left
		B.left = tempd; //left = down
		B.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = B.up;
		var tempd = B.down;
		var templ = B.left;
		var tempr = B.right;
		B.up = tempr;	//up = right
		B.left = tempu;	//left = up
		B.down = templ; //down = left
		B.right = tempd;//right= down
	}
	//adjust other paramters
	var indleft = intersect(U.left,U.up);
	var indright = intersect(U.right,U.up);
	U.up = JSON.parse(JSON.stringify(B.up));
	U.left[indleft] = JSON.parse(JSON.stringify(B.up[intersect(B.up,B.right)]));
	U.right[indright] =JSON.parse(JSON.stringify(B.up[intersect(B.up,B.left)]));

	var indup = intersect(L.up,L.left);
	var inddown = intersect(L.down,L.left);
	L.left = JSON.parse(JSON.stringify(B.right));
	L.up[indup] = JSON.parse(JSON.stringify(B.right[intersect(B.right,B.up)]));
	L.down[inddown] = JSON.parse(JSON.stringify(B.right[intersect(B.right,B.down)]));

	indleft = intersect(D.left,D.down);
	indright = intersect(D.right,D.down);
	D.down = JSON.parse(JSON.stringify(B.down));
	D.left[indleft] = JSON.parse(JSON.stringify(B.down[intersect(B.down,B.right)]));
	D.right[indright] = JSON.parse(JSON.stringify(B.down[intersect(B.down,B.left)]));

	indup = intersect(R.up,R.right);
	inddown = intersect(R.down,R.right);
	R.right = JSON.parse(JSON.stringify(B.left));
	R.up[indup] = JSON.parse(JSON.stringify(B.left[intersect(B.left,B.up)]));
	R.down[inddown] = JSON.parse(JSON.stringify(B.left[intersect(B.left,B.down)]));

	console.log("Left",D.left,"UP",D.up,"Right",D.right,"down",D.down+"\n");
}

function rotateF(){
	// console.log("RotateF");
	// console.log("Left",F.left,"UP",F.up,"Right",F.right,"down",F.down+"\n");
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = 5;
	//Initialize Parameters
	// F.up = U.down;
	// F.right = R.left;
	// F.down = D.up;
	// F.left = L.right;
	//Rotate The Plane
	for(var i = 0; i<F.left.length; i++){
		cubes[F.left[i]].moving = 1;
	}
	cubes[F.up[1]].moving = 1;
	cubes[F.middle].moving = 1;
	cubes[F.down[1]].moving = 1;
	for(var i = 0; i<F.right.length; i++){
		cubes[F.right[i]].moving = 1;
	}
	//Move the indices on the plane and change other plane's indices
	//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;
	if(!SHFT){
		var tempu = F.up;
		var tempr = F.right;
		var tempd = F.down;
		var templ = F.left; 
		F.right = tempu;   //right = up
		F.up  = templ;   //up = left
		F.left = tempd; //left = down
		F.down = tempr;  //down  = right
	}
	//Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
	else{
		var tempu = F.up;
		var tempd = F.down;
		var templ = F.left;
		var tempr = F.right;
		F.up =    tempr; //up = right
		F.left =  tempu; //left = up
		F.down =  templ; //down = left
		F.right = tempd; //right= down
	}

	//adjust other paramters
	var indleft = intersect(U.left,U.down);
	var indright = intersect(U.right,U.down);
	U.down = JSON.parse(JSON.stringify(F.up));
	U.left[indleft] = JSON.parse(JSON.stringify(F.up[intersect(F.up,F.left)]));
	U.right[indright] = JSON.parse(JSON.stringify(F.up[intersect(F.up,F.right)]));

	var indup = intersect(R.up,R.left);
	var inddown = intersect(R.down,R.left);
	R.left = JSON.parse(JSON.stringify(F.right));
	R.up[indup] = JSON.parse(JSON.stringify(F.right[intersect(F.right,F.up)]));
	R.down[inddown] = JSON.parse(JSON.stringify(F.right[intersect(F.right,F.down)]));

	indleft = intersect(D.left,D.up);
	indright = intersect(D.right,D.up);
	D.up =   JSON.parse(JSON.stringify(F.down));
	D.left[indleft] = JSON.parse(JSON.stringify(F.down[intersect(F.down,F.left)]));
	D.right[indright] = JSON.parse(JSON.stringify(F.down[intersect(F.down,F.right)]));

	indup = intersect(L.up,L.right);
	inddown = intersect(L.down,L.right);
	L.right =JSON.parse(JSON.stringify(F.left));
	L.up[indup] = JSON.parse(JSON.stringify(F.left[intersect(F.left,F.up)]));
	L.down[inddown] = JSON.parse(JSON.stringify(F.left[intersect(F.left,F.down)]));


	// console.log("Left",F.left,"UP",F.up,"Right",F.right,"down",F.down+"\n");
}

function intersect(a1,a2){
	for(var i = 0; i<a1.length; i++){
		for (var j = 0; j < a2.length; j++) {
			if(a1[i]==a2[j]){
				return i;
			}
		}
	}
	window.alert("Error at "+a1+"and"+a2+".");
}


window.addEventListener("keydown", function(event){
	//If already pressed, prevent re-pressing
	if(event.defaultPrevented){
		return;
	}
	for(var i = 0; i<cubes.length; i++){
		if(cubes[i].moving==1){
			event.preventDefault();
			return;
		}
	}

	// Turn on a trigger var to trigger a rotation
	switch(event.key){
		//If Uppercase, trigger the SHFT variable to rotate the other way
		//LEFT EVENT
		case "L": SHFT = 1;
		case "l": rotateL(); break;

		//VERTICAL EVENT
		case "V": g=1; rotateCubeVert(); vPrime=2; break;
		case "v": var temp = reverse; reverse = 1; g=1; rotateCubeVert(); reverse = temp; v=2; 
		break;

		//RIGHT EVENT
		case "R": SHFT = 1;
		case "r": rotateR(); break;

		//UP CASE
		case "U": SHFT = 1;
		case "u": rotateU(); break;

		//CASE M -- CONTINUE LATER
		case "M": reverse=1; g=1; rotateCubeHoriz(); mPrime = 2; break;
		case "m": reverse=0; g=1; rotateCubeHoriz(); m=2;
		break;

		//DOWN CASE
		case "D": SHFT = 1;
		case "d": rotateD(); break;

		//BACK CASE
		case "B": SHFT = 1;
		case "b": rotateB(); break;

		case "O": SHFT = 1; oPrime=2; break;
		case "o": o=2; break;
		case "F": SHFT = 1;
		case "f": rotateF(); break;
		case "Enter" : if(!enter){
			enter = 1;
			ind = parseInt(document.getElementById("initialNum").value);
			// console.log(ind);
		} event.preventDefault(); return;
		default : return;
	}
	// The Shift Key Makes it prime
	if(SHFT){
		for(var i = 0; i<cubes.length; i++){
			if(moving)
				console.log(i);
	        cubes[i].xAxis = 3;
	        cubes[i].yAxis = 4;
	        cubes[i].zAxis = 5;
			cubes[i].axis = (cubes[i].axis+3)%6;
		}
		SHFT=0;
	}
	event.preventDefault();
}, true);

function doRotation(){
	var index = Math.floor(Math.random()*(8));
	SHFT = 0;
	console.log(index);
	switch(index){
		case 0: rotateL(); break;
		case 1: rotateR(); break;
		case 2: rotateU(); break;
		case 3: rotateD(); break;
		case 4: rotateF(); break;
		case 5: rotateB(); break;
		case 6: g=1; rotateCubeVert(); break;
		case 7: g=1; rotateCubeHoriz(); break;
		default : return;
	}
}

function solvedAll(){
	// return solved(F)&&solved(B)&&solved(U)&&solved(D)&&solved(L)&&solved(R);
	var count = 0; var ind2 = 0;
	for(var i=0; i<cubes.length-1; i++){
		if(i+1==L.middle||i+1==R.middle||i+1==U.middle||i+1==D.middle||i+1==B.middle||i+1==F.middle){
			ind2 = i+2;
		}
		else if(i==L.middle||i==R.middle||i==U.middle||i==D.middle||i==B.middle||i==F.middle){
			continue;
		}
		else{
			ind2 = i+1;
		}
		// console.log(matRound(cubes[i].rMatrix)+"vs");
		// console.log(matRound(cubes[i+1].rMatrix));
		for (var j=0; j<cubes[i].rMatrix.length; j++){
			for (var k=0; k<cubes[i].rMatrix[j].length; k++){
				if(Math.round(cubes[i].rMatrix[j][k])!==Math.round(cubes[ind2].rMatrix[j][k])){
					// console.log("i"+i+"i+1"+(i+1));
					count++;
				}
			}
		}
		if(i+1==L.middle||i+1==R.middle||i+1==U.middle||i+1==D.middle||i+1==B.middle||i+1==F.middle){
			i++;
		}
	}
	return count==0;
}

function matRound(mat){
	rmat = JSON.parse(JSON.stringify(mat));
	for(var i=0; i<mat.length; i++)
		for(var j=0; j<mat[i].length; j++)
			rmat[i][j] = Math.round(rmat[i][j]);
	return rmat;
}


function contains(value,array){
	for(var i = 0; i<array.length; i++){
		if(value==array[i]){
			return true;
		}
	}
	return false;
}

function SHFTY(){
	if(SHFT){
		for(var i = 0; i<cubes.length; i++){
			cubes[i].axis = (cubes[i].axis+3)%6;
		}
		SHFT=0;
	}
}


function render(){
	gl.depthFunc(gl.LEQUAL); 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mvMatrix = lookAt(eye, at, up);
	pMatrix  = ortho (left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv( mvMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pMatrixLoc, false, flatten(pMatrix) );
    //Take care of special cases where the cube rotates more than once, i.e. middle layers
    if(noneMoving()&&ind>0){
    	console.log("Done");
    	doRotation();
    	ind--;
    }
    else if(mPrime>0&&noneMoving()){
    	switch(mPrime){
    	case 2: rotateU(); SHFTY(); break;
    	case 1: SHFT = 1; rotateD(); SHFTY(); break;
    	}
    	mPrime--;
    }
    else if(m>0&&noneMoving()){
    	switch(m){
    	case 2: SHFT = 1; rotateU(); SHFTY(); break;
    	case 1: rotateD(); SHFTY(); break;
    	}
    	m--;
    }
    else if(v>0&&noneMoving()){
    	switch(v){
    	case 2: SHFT = 1; rotateL(); SHFTY(); break;
    	case 1: rotateR(); SHFTY(); break;
    	}
    	v--;
    }
    else if(vPrime>0&&noneMoving()){
    	switch(vPrime){
    	case 2: SHFT = 1; rotateR(); SHFTY(); break;
    	case 1: rotateL(); SHFTY(); break;
    	}
    	vPrime--;
    }
    else if(o>0&&noneMoving()){
    	switch(o){
    	case 2: SHFT = 1; rotateF(); SHFTY(); break;
    	case 1: rotateB(); SHFTY(); break;
    	}
    	o--;
    }
    else if(oPrime>0&&noneMoving()){
    	switch(oPrime){
    	case 2: SHFT = 1; rotateB(); SHFTY(); break;
    	case 1: rotateF(); SHFTY(); break;
    	}
    	oPrime--;
    }
    var gfinal=0;
    //Calculate rotation matrices
	for(var i = 0; i<cubes.length; i++){
		if(cubes[i].moving&&cubes[i].axis>2){
			cubes[i].theta-=10.0;
			switch(cubes[i].axis){
				case 3: cubes[i].rMatrixX=mult(cubes[i].rMatrixX,rotate(-10,1.0,0.0,0.0)); break;
				case 4: cubes[i].rMatrixY=mult(cubes[i].rMatrixY,rotate(-10,0.0,1.0,0.0)); break;
				case 5: cubes[i].rMatrixZ=mult(cubes[i].rMatrixZ,rotate(-10,0.0,0.0,1.0)); break;
			}
			if((cubes[i].theta)%90==0){
				cubes[i].theta = 0;
				cubes[i].moving = 0;
				if(g) gfinal=1;
				if(solvedAll()&&start!=false){
					document.getElementById("Title").innerHTML="Rubik's Cube Master (SOLVED IT!)";
				}
				start = true;
				if(start&&!solvedAll()){
					document.getElementById("Title").innerHTML="Rubik's Cube Practice";
					start = false
				}
			}
		}
		else if(cubes[i].moving)   {
		    cubes[i].theta += 10.0;
			switch(cubes[i].axis){
				case 0: cubes[i].rMatrixX=mult(cubes[i].rMatrixX,rotate(10,1.0,0.0,0.0)); break;
				case 1: cubes[i].rMatrixY=mult(cubes[i].rMatrixY,rotate(10,0.0,1.0,0.0)); break;
				case 2: cubes[i].rMatrixZ=mult(cubes[i].rMatrixZ,rotate(10,0.0,0.0,1.0)); break;
			}
		    if((cubes[i].theta)%90==0){
		    	cubes[i].theta = 0;
			    cubes[i].moving = 0;
			    if(g) gfinal=1;
				if(solvedAll()&&start!=false)
					document.getElementById("Title").innerHTML="Rubik's Cube Master (SOLVED IT!)";
				start = true;
				if(start){
					document.getElementById("Title").innerHTML="Rubik's Cube Practice";
					start = false
				}
		    }

		}
		//Multiply to current rotation matrix
		cubes[i].rMatrix =mult(mult(mult(cubes[i].rMatrixZ,cubes[i].rMatrixY),cubes[i].rMatrixX),cubes[i].rMatrix);
		gl.uniformMatrix4fv(grMatrixLoc, false, flatten(cubes[i].grMatrix));
		gl.uniformMatrix4fv(rMatrixLoc, false, flatten(cubes[i].rMatrix));
		cubes[i].rMatrixX = mat4(); cubes[i].rMatrixY = mat4(); cubes[i].rMatrixZ = mat4();

	    // gl.uniform3fv(thetaLoc, cubes[i].theta);
	    gl.drawArrays( gl.TRIANGLES, 0+NumVertices*i, NumVertices);
	}

	window.requestAnimationFrame(render,canvas);
	
}

//Returns a textfile version of the code
function getCurrentState(){
	var str=JSON.stringify(L)+"#"+JSON.stringify(R)+"#"+JSON.stringify(U)+"#"+JSON.stringify(D)+"#"+JSON.stringify(F)+"#"+JSON.stringify(B)+"#";
	for(var i = 0; i<cubes.length; i++)
		str = str + JSON.stringify(cubes[i].rMatrix)+"@"+JSON.stringify(cubes[i].grMatrix)+"%";
	return str;
}

//Loads a textfile version of the code
function loadCurrentState(string){
	var f = 0; var temparray=[];
	L = JSON.parse(string.substring(0,string.indexOf("#")));
	string = string.substring(string.indexOf("#")+1);
	R = JSON.parse(string.substring(0,string.indexOf("#")));
	string = string.substring(string.indexOf("#")+1);
	U = JSON.parse(string.substring(0,string.indexOf("#")));
	string = string.substring(string.indexOf("#")+1);
	D = JSON.parse(string.substring(0,string.indexOf("#")));
	string = string.substring(string.indexOf("#")+1);
	F = JSON.parse(string.substring(0,string.indexOf("#")));
	string = string.substring(string.indexOf("#")+1);
	B = JSON.parse(string.substring(0,string.indexOf("#")));
	string = string.substring(string.indexOf("#")+1);
	for(var i = 0; i<cubes.length; i++){
		var index = string.indexOf("%");
		if(index<0)
			window.alert(index);
		var cubeStr = string.substring(f,index);
		var indexat = cubeStr.indexOf("@");
		var temp = JSON.parse(cubeStr.substring(f,indexat));
		for(var a=0; a<temp.length; a++)
			for(var b=0; b<temp[a].length; b++)
				temparray.push(temp[a][b]);
		cubes[i].rMatrix = mat4(temparray);
		cubes[i].grMatrix = JSON.parse(cubeStr.substring(indexat+1));
		string = string.substring(index+1,string.length);
		temparray = [];
	}
}

//Makes the text file
function checkIt(){
var textFile = null,
  makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  };
  var create = document.getElementById("create");

  create.addEventListener('click', function () {
    var link = document.getElementById('downloadlink');
    link.href = makeTextFile(getCurrentState());
    link.style.display = 'block';
  }, false);
};

//Initializes all parameters for every cube, including 6 "quad" faces
function buildCube(i)
{
    quad( 1, 0, 3, 2 ,i);
    quad( 2, 3, 7, 6 ,i);
    quad( 3, 0, 4, 7 ,i);
    quad( 6, 5, 1, 2 ,i);
    quad( 4, 5, 6, 7 ,i);
    quad( 5, 4, 0, 1 ,i);

    //Put initial information into cube array
	var cube = new Object();
	cube.vertices = points;
	cube.colors   = colors;
	points = []; colors = [];
	cube.theta    = 0;
	cube.curTheta = [0,0,0];
	cube.moving   = 0;
	cube.axis = 0;
	cube.yAxis = 0;
	cube.xAxis = 1;
	cube.zAxis = 2;
	cube.xState= 0;
	cube.yState= 0;
	cube.zState= 0;
	cube.grMatrix = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
	cube.rMatrixX = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
	cube.rMatrixY = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
	cube.rMatrixZ = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
	cube.rMatrix = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
	//Add cube to cube array
    cubes.push(cube);
}

//Cubenum affects the location of each of the 27 cubes - some simple graph math avoiding translations
function quad(a, b, c, d, cubenum)
{
	//define vertices for all 27 .32x.32x.32 cubes in one single vertices definition, with .02 spacing
    var vertices = [
        vec4( -0.5 +(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.5 +(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.5 -(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.5 +(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.5 +(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.18+(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 ),
        vec4( -0.18+(cubenum%3)*0.34, -0.5 +(Math.floor(cubenum/3)%3)*0.34,  0.18-(Math.floor(cubenum/9)%3)*0.34, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],   // white
        [ 1.0, 0.65, 0.0, 1.0 ],  //orange
        [ 0.0, 1.0, 1.0, 1.0 ]  // cyan

    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];
	for ( var i = 0; i < indices.length; ++i ) {
	    points.push( vertices[indices[i]] );
	    totpoints.push( vertices[indices[i]] );
	    

	    // If it isn't an outer face, make it black
	    if(!(outerFace(vertices[a])&&outerFace(vertices[b])&&outerFace(vertices[b])&&outerFace(vertices[c])&&outerFace(vertices[d]))){
	    	colors.push(vertexColors[0]);
	    	totcolors.push(vertexColors[0]);
	    }
	    // for solid colored faces use
	    else{
	    	colors.push(vertexColors[a]);
	    	totcolors.push(vertexColors[a]);
	    }

	}
}

function outerFace(vertex){
	return Math.abs(vertex[0])>0.4||Math.abs(vertex[1])>0.4||Math.abs(vertex[2])>0.4;
}

window.onresize = function(){
	var min = innerWidth;
	if (innerHeight<innerWidth)
		min = innerHeight;
	if (min<canvas.width || min< canvas.height)
		gl.viewport(0,canvas.height-min, min, min);
}