
import * as THREE from '../node_modules/three/build/three.module.js'
import * as CRYSTAL from "./crystal.js";
import { Vector3 } from './linear_algebra.js';
import { rectContains } from './utility.js';


/****************************************

            VARIABLES

****************************************/

var x_rotation = 0;
var y_rotation = 0;
var z_rotation = 0;


/****************************************

            SETUP 3D SCENE

****************************************/
//the window in which to display the 3D-Scene
const container = document.getElementById("lab-view-container")

//create scene
const scene = new THREE.Scene();

//create camera
const camera = new THREE.PerspectiveCamera(75,container.clientWidth/container.clientHeight, 0.6, 1200);
camera.position.set(0,0,3)

//camera pivot for orbital control
const camera_pivot = new THREE.Object3D()
camera_pivot.position.set(0,0,0);
scene.add(camera_pivot);
camera_pivot.add(camera);

//set camera start-rotation
camera_pivot.rotateOnAxis(new Vector3(1,0,0), Math.PI/180 * 60);
camera_pivot.rotateOnWorldAxis(new Vector3(0,0,1), Math.PI/180 * (90+45+30));



//create renderer
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor('#233143');
renderer.setSize(container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);


//in case of window resizing set the correct camera aspect
window.addEventListener('resize', () => {

    renderer.setSize(container.clientWidth, container.clientHeight, false);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
})



//render loop
const rendering = function(){   
    requestAnimationFrame(rendering);
    
    //rotate the entire scene
    scene.rotation.z -= 0.000006;
    scene.rotation.x -=0.000005;
    renderer.render(scene,camera);
}
rendering();

/****************************************

            CREATE CONTENT

****************************************/

function createCube(edgeLength, color=0xFFFFFF){
    //create crystal
    const boxGeometry = new THREE.BoxGeometry(1,1,1);
    const boxMaterial = new THREE.MeshLambertMaterial({color: color});
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.visible = true;
    return box;
}


function createLighting(){
    const lights = [];
    const lightHelpers = []; 
    const lightValues = [
        {colour: 0x14D14A, intensity: 8, dist: 12, x: 1, y: 0, z: 8},
        {colour: 0xBE61CF, intensity: 6, dist: 12, x: -2, y: 1, z: -10},
        {colour: 0x00FFFF, intensity: 3, dist: 10, x: 0, y: 10, z: 1},
        {colour: 0x00FF00, intensity: 6, dist: 12, x: 0, y: -10, z: -1},
        {colour: 0x16A7F5, intensity: 6, dist: 12, x: 10, y: 3, z: 0},
        {colour: 0x90F615, intensity: 6, dist: 12, x: -10, y: -1, z: 0}
    ];
    for (let i=0; i<lightValues.length; i++) {
        lights[i] = new THREE.PointLight(
            lightValues[i]['colour'], 
            lightValues[i]['intensity'], 
            lightValues[i]['dist']);
        lights[i].position.set(
            lightValues[i]['x'], 
            lightValues[i]['y'], 
            lightValues[i]['z']);
        scene.add(lights[i]);


        lightHelpers[i] = new THREE.PointLightHelper(lights[i], 0.7);
        scene.add(lightHelpers[i]);
    }
}

function createLine(start, end, color){
    var points = [];
    points.push(new Vector3(...start.getComponents()));
    points.push(new Vector3(...end.getComponents()));
    var line_geometry = new THREE.BufferGeometry().setFromPoints( points );
    return new THREE.Line( line_geometry, new THREE.LineBasicMaterial({color: color}) );
}

function createPlane(width, height, color){
    const plane_geometry = new THREE.PlaneGeometry( width, height );
    const plane_material = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
    return new THREE.Mesh( plane_geometry, plane_material );
}

const crystal = createCube(1);
scene.add(crystal);

//create detector plane
var plane = createPlane(5,5,"black")
plane.position.x = 5;
plane.rotation.y = Math.PI/2
scene.add( plane );

//create reflected x-ray
const incidentBeam = createLine(new Vector3(5,0,0), new Vector3(0,0,0), "white");
scene.add(incidentBeam);

createLighting();



/****************************************

            FUNCTIONS FOR UI INPUT

****************************************/



export function contains(x,y){
    return rectContains(container.getBoundingClientRect(), x,y);
}

export function rotate(deltaX,deltaY){
    camera_pivot.rotateOnWorldAxis(new Vector3(0,0,-1), deltaX/100);
    camera_pivot.rotateOnAxis(new Vector3(-1,0,0), deltaY/100);
}

export function zoom(deltaZ){
    const max_zoom = 20
    const min_zoom = 3

    //enforce min max zoom
    if(camera.position.z > max_zoom & deltaZ > 0){
        return
    }
    if(camera.position.z < min_zoom & deltaZ < 0){
        return
    }

    camera.translateOnAxis(new Vector3(0,0,1), deltaZ);
}

export function setRotation(x,y,z){
    x_rotation = x*Math.PI/180;
    y_rotation = y*Math.PI/180;
    z_rotation = z*Math.PI/180;
    updateLabView();
}


export function setXRot(x){
    x_rotation = x*Math.PI/180
    updateLabView()
}
export function setYRot(y){
    y_rotation = y*Math.PI/180
    updateLabView()
}
export function setZRot(z){
    z_rotation = z*Math.PI/180;
    updateLabView()
}

function updateLabView(){
    crystal.rotation.set(0,0,0);
    crystal.rotateOnWorldAxis(new THREE.Vector3(0,0,1), z_rotation);
    crystal.rotateOnWorldAxis(new THREE.Vector3(1,0,0), x_rotation);
    crystal.rotateOnWorldAxis(new THREE.Vector3(0,1,0), y_rotation);
}
























