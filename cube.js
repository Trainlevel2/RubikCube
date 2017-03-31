//code
var canvas;
var gl;

var NumVertices=36;

//var cubes = [];
var points = [];				//Array of Vertices
var colors = [];
// var yAxis = 0;
// var xAxis = 1;
// var zAxis = 2;

// var axis = 0;
var theta = [ 0, 0, 0 ];
var thetaLoc;
var moving = 0;
var rMatrixLoc;

var near   = -1.5;
var far    =  1.5;
var bottom = -1.5;
var ytop   =  1.5;
var left   = -1.5;
var right  =  1.5;
var eye    = vec3(0.2,0.2,1.0);
const at = vec3(0.0,0.0,0.0);
const up = vec3(0.0,1.0,0.0);
var mvMatrixLoc;
var pMatrixLoc;
var mvMatrix;	//Model-view Matrix
var pMatrix;	//Projection Matrix
var totpoints=[];
var totcolors=[];


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

//Initialize all the values
function initKeyGroups(){
	L = new Object();
	L.left   = [0,3,6];
	// L.vertic = [9,12,15];
	L.right  = [18,21,24];
	L.down   = [0,9,18];
	L.middle = 12;
	L.up     = [6,15,24];
	// L = [0,3,6,9,12,15,18,21,24]; //Left

	R = new Object();
	R.right  = [2,5,8];
	// R.vertic= [11,14,17];
	R.left = [20,23,26];
	R.down  = [2,11,20];
	R.middle= 14;
	R.up    = [8,17,26];
	// R = [2,5,8,11,14,17,20,23,26]; //Right

	U = new Object();
	U.up    = [6,7,8];
	U.middle=16;
	U.down  = [24,25,26];
	U.left  = [6,15,24];
	// U.vertic= [7,16,25];
	U.right = [8,17,26];
	// U = [6,7,8,15,16,17,24,25,26]; //Up/Top

	D = new Object();
	D.down  = [0,1,2];
	D.middle= 10;
	D.up    = [18,19,20];
	D.left  = [0,9,18];
	// D.vertic= [1,10,19];
	D.right = [2,11,20];
	// D = [0,1,2,9,10,11,18,19,20]; //Down/Bottom

	B = new Object();
	B.down  = [0,1,2];
	B.middle= 4;
	B.up    = [6,7,8];
	B.right  = [0,3,6];
	// B.vertic= [1,4,7];
	B.left = [2,5,8];
	// B = [0,1,2,3,4,5,6,7,8]; //Back

	F = new Object();
	F.down  = [18,19,20];
	F.middle= 22;
	F.up    = [24,25,26];
	F.left  = [18,21,24];
	// F.vertic= [19,22,25];
	F.right = [20,23,26];	
	// F = [18,19,20,21,22,23,24,25,26]; //Front

	// V = new Object();
	// V.left  = [1,4,7];
	// V.vertic=[10,13,16];
	// V.right = [19,22,25];
	// V.down  =[1,10,19];
	// V.middle=13;
	// V.up    =[7,16,25];
	// V = [1,4,7,10,13,16,19,22,25]; //Vertical Middle

	// M = new Object();
	// M.up    = [3,4,5];
	// M.middle= 13;
	// M.down  = [21,22,23];
	// M.left  = [3,12,21];
	// M.vertic= [4,13,22];
	// M.right = [5,14,23];
	// M = [3,4,5,12,13,14,21,22,23]; //Horizontal Middle

	// O = new Object();
	// O.down  = [9,10,11];
	// O.middle= 13;
	// O.up    = [15,16,17];
	// O.left  = [9,12,15];
	// O.vertic= [10,13,16];
	// O.right = [11,14,17];
	// O = [9,10,11,12,13,14,15,16,17]; //Second Layer

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


 	render();
    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {

		console.log(cubes[0].rMatrix);
    	for(var i = 0; i<cubes.length; i++){
    		if(cubes[i].moving){
    			return;
    		}
    	}
    	for(var i = 0; i<cubes.length; i++){
	        cubes[i].axis = cubes[i].xAxis;
	        // var temp = cubes[i].yAxis;
	        // switch(cubes[i].xState){
	        // 	case 0:
	        // 	cubes[i].yAxis=cubes[i].zAxis;
	        // 	cubes[i].zAxis=temp;
	        // 	break;
	        // 	case 1:
	        // 	cubes[i].yAxis=cubes[i].zAxis;
	        // 	cubes[i].zAxis=(temp+3)%6;
	        // 	break;
	        // 	case 2:
	        // 	cubes[i].yAxis=cubes[i].zAxis;
	        // 	cubes[i].zAxis=temp;
	        // 	break;
	        // 	case 3:
	        // 	cubes[i].yAxis=cubes[i].zAxis;
	        // 	cubes[i].zAxis=(temp+3)%6
	        // 	break;;
	        // }
	        
	    	// cubes[i].xState=(cubes[i].xState+1)%4;
    		cubes[i].moving = 1;
    	}
    	console.log(cubes[0].xAxis+","+cubes[0].yAxis+","+cubes[0].zAxis)
    };
    document.getElementById( "yButton" ).onclick = function () {
    	for(var i = 0; i<cubes.length; i++){
    		if(cubes[i].moving){
    			return;
    		}
    	}
     	for(var i = 0; i<cubes.length; i++){
        	cubes[i].axis = cubes[i].yAxis;
    		cubes[i].moving = 1;
    	}
    	console.log(cubes[0].xAxis+","+cubes[0].yAxis+","+cubes[0].zAxis)

    };
    document.getElementById( "zButton" ).onclick = function () {
    	for(var i = 0; i<cubes.length; i++){
    		if(cubes[i].moving){
    			return;
    		}
    	}
     	for(var i = 0; i<cubes.length; i++){
        	cubes[i].axis = cubes[i].zAxis;
    		cubes[i].moving = 1;
    	}
    	console.log(cubes[0].xAxis+","+cubes[0].yAxis+","+cubes[0].zAxis)

    };
    // document.getElementById( "Stop").onclick = function () { 
    // 	for(var i = 0; i<cubes.length; i++){
    // 		if(cubes[i].moving){
    // 			return;
    // 		}
    // 	}
    // 	for(var i = 0; i<cubes.length; i++){
    // 		cubes[i].moving = (cubes[i].moving+1)%2;
    // 	}
    // 	// if(moving==0)
	   //  // 	document.getElementById("Stop").innerHTML = "Move Cube";
	   //  // else
	   //  // 	document.getElementById("Stop").innerHTML = "Stop Cube";
    // };
	document.getElementById( "Reverse" ).onclick = function () {
    	for(var i = 0; i<cubes.length; i++){
	        cubes[i].axis=(cubes[i].axis+3)%6;
	        cubes[i].xAxis = (cubes[i].xAxis+3)%6;
	        cubes[i].yAxis = (cubes[i].yAxis+3)%6;
	        cubes[i].zAxis = (cubes[i].zAxis+3)%6;
	    }
    };    
}

function rotateL(){
   	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = (cubes[i].yAxis+3)%6;
	//Initialize Parameters
	L.up = U.left;
	L.right = F.left;
	L.down = D.left;
	L.left = B.right;		
	console.log(L.up+"\n"+L.left+"\n"+L.right+"\n"+L.down+"\n");
	//Rotate The Plane
	for(var i = 0; i<L.left.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[L.left[i]].curTheta[j] = cubes[R.left[i]].theta[j];
		}
		cubes[L.left[i]].moving = 1;
	}
	//Rotate center cube
	for(var j = 0; j<theta.length; j++){
		cubes[L.up[1]].curTheta[j] = cubes[R.up[1]].theta[j];
	}
	cubes[L.up[1]].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[L.middle].curTheta[j] = cubes[R.middle].theta[j];
	}
	for(var j = 0; j<theta.length; j++){
		cubes[L.down[1]].curTheta[j] = cubes[R.down[1]].theta[j];
	}
	cubes[L.down[1]].moving = 1;
	cubes[L.middle].moving = 1;
	for(var i = 0; i<L.right.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[L.right[i]].curTheta[j] = cubes[R.right[i]].theta[j];
		}
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
		console.log(L.up+"\n"+L.left+"\n"+L.right+"\n"+L.down+"\n");

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
	U.left = L.up;
	F.left = L.right;
	D.left = L.down;
	B.right = L.left;
}

function rotateR(){
   	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = cubes[i].yAxis;
	//Initialize Parameters
	R.up = U.right;
	R.left = F.right;
	R.right = B.left;
	R.down = D.right;
	//Rotate The Plane
	for(var i = 0; i<R.left.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[R.left[i]].curTheta[j] = cubes[L.left[i]].theta[j];
		}
		cubes[R.left[i]].moving = 1;
	}
	for(var j = 0; j<theta.length; j++){
		cubes[R.up[1]].curTheta[j] = cubes[L.up[1]].theta[j];
	}
	cubes[R.up[1]].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[R.middle].curTheta[j] = cubes[L.middle].theta[j];
	}
	cubes[R.middle].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[R.down[1]].curTheta[j] = cubes[L.down[1]].theta[j];
	}
	cubes[R.down[1]].moving = 1;
	for(var i = 0; i<R.right.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[R.right[i]].curTheta[j] = cubes[L.right[i]].theta[j];
		}
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
	U.right = R.up;
	F.right = R.left;
	D.right = R.down;
	B.left = R.right;	
}

function rotateU(){
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = (cubes[i].xAxis+3)%6;
	//Rotate The Plane
	//Initialize Plane Values
	U.down = F.up;
	U.right = R.up;
	U.left = L.up;
	U.up = B.up;
	for(var i = 0; i<U.left.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[U.left[i]].curTheta[j] = cubes[D.left[i]].theta[j];
		}
		cubes[U.left[i]].moving = 1;
	}
	for(var j = 0; j<theta.length; j++){
		cubes[U.up[1]].curTheta[j] = cubes[D.up[1]].theta[j];
	}
	cubes[U.up[1]].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[U.middle].curTheta[j] = cubes[D.middle].theta[j];
	}
	cubes[U.middle].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[U.down[1]].curTheta[j] = cubes[D.down[1]].theta[j];
	}
	cubes[U.down[1]].moving = 1;
	for(var i = 0; i<U.right.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[U.right[i]].curTheta[j] = cubes[D.right[i]].theta[j];
		}
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
	B.up = U.up;
	R.up = U.right;
	F.up = U.down;
	L.up = U.left;
}

function rotateD(){
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = cubes[i].xAxis;
	//Initialize Parameters
	D.up = F.down;
	D.right = R.down;
	D.left = L.down;
	D.down = B.down;

	//Rotate The Plane
	for(var i = 0; i<D.left.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[D.left[i]].curTheta[j] = cubes[U.left[i]].theta[j];
		}
		cubes[D.left[i]].moving = 1;
	}
	for(var j = 0; j<theta.length; j++){
			cubes[D.up[1]].curTheta[j] = cubes[U.up[1]].theta[j];
	}
	cubes[D.up[1]].moving = 1;
	for(var j = 0; j<theta.length; j++){
			cubes[D.middle].curTheta[j] = cubes[U.middle].theta[j];
	}
	cubes[D.middle].moving = 1;
	for(var j = 0; j<theta.length; j++){
			cubes[D.down[1]].curTheta[j] = cubes[U.down[1]].theta[j];
	}
	cubes[D.down[1]].moving = 1;
	for(var i = 0; i<D.right.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[D.right[i]].curTheta[j] = cubes[U.right[i]].theta[j];
		}
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
	F.down = D.up;
	R.down = D.right;
	B.down = D.down;
	L.down = D.left;
}

function rotateB(){
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = (cubes[i].zAxis+3)%6;
		//Initialize Paramters
		B.up = U.up;
		B.left = R.right;
		B.right = L.left;
		B.down = D.down;
		//Rotate The Plane
		for(var i = 0; i<B.left.length; i++){
			for(var j = 0; j<theta.length; j++){
				cubes[B.left[i]].curTheta[j] = cubes[F.left[i]].theta[j];
			}
			cubes[B.left[i]].moving = 1;
		}
		for(var j = 0; j<theta.length; j++){
			cubes[B.up[1]].curTheta[j] = cubes[F.up[1]].theta[j];
		}
		cubes[B.up[1]].moving = 1;
		for(var j = 0; j<theta.length; j++){
			cubes[B.middle].curTheta[j] = cubes[F.middle].theta[j];
		}
		cubes[B.middle].moving = 1;
		for(var j = 0; j<theta.length; j++){
			cubes[B.down[1]].curTheta[j] = cubes[F.down[1]].theta[j];
		}
		cubes[B.down[1]].moving = 1;
		for(var i = 0; i<B.right.length; i++){
			for(var j = 0; j<theta.length; j++){
				cubes[B.right[i]].curTheta[j] = cubes[F.right[i]].theta[j];
			}
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
		U.up = B.up;
		L.left = B.right;
		D.down = B.down;
		R.right = B.left;
}

function rotateF(){
	for(var i = 0; i<cubes.length; i++)
		cubes[i].axis = cubes[i].zAxis;
	//Initialize Parameters
	F.up = U.down;
	F.right = R.left;
	F.down = D.up;
	F.left = L.right;
	console.log(L.right+"\n");
	//Rotate The Plane
	for(var i = 0; i<F.left.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[F.left[i]].curTheta[j] = cubes[B.left[i]].theta[j];
		}
		cubes[F.left[i]].moving = 1;
	}
	for(var j = 0; j<theta.length; j++){
		cubes[F.up[1]].curTheta[j] = cubes[B.up[1]].theta[j];
	}
	cubes[F.up[1]].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[F.middle].curTheta[j] = cubes[B.middle].theta[j];
	}
	cubes[F.middle].moving = 1;
	for(var j = 0; j<theta.length; j++){
		cubes[F.down[1]].curTheta[j] = cubes[B.down[1]].theta[j];
	}
	cubes[F.down[1]].moving = 1;
	for(var i = 0; i<F.right.length; i++){
		for(var j = 0; j<theta.length; j++){
			cubes[F.right[i]].curTheta[j] = cubes[B.right[i]].theta[j];
		}
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
		F.up = tempr;	//up = right
		F.left = tempu;	//left = up
		F.down = templ; //down = left
		F.right = tempd;//right= down
	}
	//adjust other paramters
	U.down = F.up;
	R.left = F.right;
	D.up = F.down;
	L.right = F.left;
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
		case "V": SHFT = 1;
		case "v": 
			// axis = yAxis;
		//Rotate The Plane Use ROTATE L' AND R or L and R'
		// for(var i = 0; i<V.left.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[V.left[i]].curTheta[j] = cubes[R.left[i]].theta[j];
		// 	}
		// 	cubes[V.left[i]].moving = 1;
		// }
		// for(var j = 0; j<theta.length; j++){
		// 	cubes[13].curTheta[j] = cubes[R.vertic[i]].theta[j];
		// }
		// cubes[V.vertic[i]].moving = 1;
		// for(var i = 0; i<V.right.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[13].curTheta[j] = cubes[13].theta[j];
		// 	}
		// 	cubes[13].moving = 1;
		// }
		//Move the indices on the plane and change other plane's indices
		//Rotating face clockwise means right = up, up = left, left = down, down = right, middle = veritc, vertic = middle;

		//USE L' and R or R and L'
		// if(!SHFT){
		// 	var temp = []; var temp2 = [];
		// 	temp = V.right;
		// 	V.right = V.up;   //right = up
		// 	temp2 = V.down;
		// 	V.down = temp;  //down  = right
		// 	temp = V.left; 
		// 	V.left = temp2; //left = down
		// 	V.up  = temp;   //up = left
		// }
		// //Rotating face anticlockwise means right = down, down = left, left = up, up = right, middle = vertic, vertic = middle;
		// else{
		// 	var temp = []; var temp2 = [];
		// 	temp = V.up;
		// 	V.up = V.right;	//up = right
		// 	temp2 = V.left;
		// 	V.left = temp;	//left = up
		// 	temp = V.down;
		// 	V.down = temp2; //down = left
		// 	V.right = temp//right= down
		// }
		// //adjust other paramters
		// U.vertic = V.up;
		// F.vertic = V.right;
		// D.vertic = V.down;
		// B.vertic = V.left;
		break;

		//RIGHT EVENT
		case "R": SHFT = 1;
		case "r": rotateR(); break;

		//UP CASE
		case "U": SHFT = 1;
		case "u": rotateU(); break;

		//CASE M -- CONTINUE LATER
		case "M": SHFT = 1;
		case "m":
		// axis = xAxis+3;
		//Rotate The Plane USE U' and D and U and D'
		// for(var i = 0; i<M.left.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[M.left[i]].curTheta[j] = cubes[D.left[i]].theta[j];
		// 	}
		// 	cubes[M.left[i]].moving = 1;
		// }
		// for(var j = 0; j<theta.length; j++){
		// 	cubes[M.middle].curTheta[j] = cubes[D.middle].theta[j];
		// }
		// cubes[M.middle].moving = 1;
		// for(var i = 0; i<M.right.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[M.right[i]].curTheta[j] = cubes[D.right[i]].theta[j];
		// 	}
		// 	cubes[M.right[i]].moving = 1;
		// }
		break;

		//DOWN CASE
		case "D": SHFT = 1;
		case "d": rotateD(); break;

		//BACK CASE
		case "B": SHFT = 1;
		case "b": rotateB(); break;

		case "O": SHFT = 1;
		case "o":
		// axis = zAxis;
		//Rotate The Plane - fix later F' and B, or B' and F
		// for(var i = 0; i<O.left.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[O.left[i]].curTheta[j] = cubes[B.left[i]].theta[j];
		// 	}
		// 	cubes[O.left[i]].moving = 1;
		// }
		// for(var i = 0; i<O.vertic.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[O.vertic[i]].curTheta[j] = cubes[F.vertic[i]].theta[j];
		// 	}
		// 	cubes[O.vertic[i]].moving = 1;
		// }
		// for(var i = 0; i<O.right.length; i++){
		// 	for(var j = 0; j<theta.length; j++){
		// 		cubes[O.right[i]].curTheta[j] = cubes[B.right[i]].theta[j];
		// 	}
		// 	cubes[O.right[i]].moving = 1;
		// }
		break;
		case "F": SHFT = 1;
		case "f": rotateF(); break;
	}
	// The Shift Key Makes it prime
	if(SHFT){
		for(var i = 0; i<cubes.length; i++)
			cubes[i].axis = (cubes[i].axis+3)%6;
		SHFT=0;
	}

	event.preventDefault();
}, true);

function render(){
	gl.depthFunc(gl.LEQUAL); 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mvMatrix = lookAt(eye, at, up);
	pMatrix  = ortho (left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( mvMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pMatrixLoc, false, flatten(pMatrix) );

	for(var i = 0; i<cubes.length; i++){
		if(cubes[i].moving&&cubes[i].axis>2){
			cubes[i].theta[cubes[i].axis-3]-=2.0;
			switch(cubes[i].axis){
				case 3: cubes[i].rMatrix=mult(cubes[i].rMatrix,rotate(cubes[i].theta[0],1.0,0.0,0.0)); break;
				case 4: cubes[i].rMatrix=mult(cubes[i].rMatrix,rotate(cubes[i].theta[1],0.0,1.0,0.0)); break;
				case 5: cubes[i].rMatrix=mult(cubes[i].rMatrix,rotate(cubes[i].theta[2],0.0,0.0,1.0)); break;
			}
			
			if((cubes[i].theta[cubes[i].axis-3]-cubes[i].curTheta[cubes[i].axis-3])%90==0){
				cubes[i].theta[cubes[i].axis-3] = cubes[i].theta[cubes[i].axis-3]%360;
				cubes[i].moving = 0;

			}
		}
		else if(cubes[i].moving)   {
		    cubes[i].theta[cubes[i].axis] += 2.0;
			switch(cubes[i].axis){
				case 0: cubes[i].rMatrix=mult(cubes[i].rMatrix,rotate(cubes[i].theta[0],1.0,0.0,0.0)); break;
				case 1: cubes[i].rMatrix=mult(cubes[i].rMatrix,rotate(cubes[i].theta[1],0.0,1.0,0.0)); break;
				case 2: cubes[i].rMatrix=mult(cubes[i].rMatrix,rotate(cubes[i].theta[2],0.0,0.0,1.0)); break;
			}
		    if((cubes[i].theta[cubes[i].axis]-cubes[i].curTheta[cubes[i].axis])%90==0){
		    	cubes[i].theta[cubes[i].axis] = cubes[i].theta[cubes[i].axis]%360;
			    cubes[i].moving = 0;

		    }
		}
		cubes[i].theta = 0;
		gl.uniformMatrix4fv( rMatrixLoc, false, flatten(cubes[i].rMatrix));
	    // gl.uniform3fv(thetaLoc, cubes[i].theta);
	    gl.drawArrays( gl.TRIANGLES, 0+NumVertices*i, NumVertices);
	}

	window.requestAnimationFrame(render,canvas);
	
}

function keyPressed(){
	if(L)
		numKey=1;
	else if(R)
		numKey=2;
	else if(M)
		numKey=3;
	else if(D)
		numKey=4;
	else if(U)
		numKey=5;
	else if(B)
		numKey=6;
	else if(F)
		numKey=7;
	else if(V)
		numKey=8;
	else
		numKey=9;
	return L||R||M||D||U||B||F||V||O;
}

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
	cube.theta    = [0,0,0];
	cube.curTheta = [0,0,0];
	cube.moving   = 0;
	cube.axis = 0;
	cube.yAxis = 0;
	cube.xAxis = 1;
	cube.zAxis = 2;
	cube.xState= 0;
	cube.yState= 0;
	cube.zState= 0;
	cube.rMatrix = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
	//Add cube to cube array
    cubes.push(cube);
}

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

        // Outer cube defined as:
        // vec4( -0.5, -0.5,  0.5, 1.0 ),
        // vec4( -0.5,  0.5,  0.5, 1.0 ),
        // vec4(  0.5,  0.5,  0.5, 1.0 ),
        // vec4(  0.5, -0.5,  0.5, 1.0 ),
        // vec4( -0.5, -0.5, -0.5, 1.0 ),
        // vec4( -0.5,  0.5, -0.5, 1.0 ),
        // vec4(  0.5,  0.5, -0.5, 1.0 ),
        // vec4(  0.5, -0.5, -0.5, 1.0 )
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