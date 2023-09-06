import * as CRYSTAL from "./crystal.js";
import { exp, randomFloatBetween, rectContains, round } from "./utility.js";
import * as THREE from '../node_modules/three/build/three.module.js'
import { Vector3 } from "./linear_algebra.js";

import atom_properties from "./atom_properties.json" assert { type: "json" };

/****************************************

            VARIABLES

****************************************/
var show_atoms = true;
var show_miller_planes = true;

//the basis atoms are stored in crystal.js
//miller planes are stored here because they are not a property of the crystal
//but rather appearance
var miller_planes = []

/****************************************

            SETUP 3D SCENE

****************************************/
//the window in which to display the 3D-Scene
const container = document.getElementById("basis-view-container")

//create scene
const scene = new THREE.Scene();

//create camera
const camera = new THREE.PerspectiveCamera(75,container.clientWidth/container.clientHeight, 0.6, 1200);
camera.position.set(0,0,8)

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
//renderer.setSize(500,500);
//renderer.setSize(container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);

const canvas = renderer.domElement;

canvas.style.width = "100%";
canvas.style.height = "100%";
container.style.width = "100%";
container.style.height = "100%";
camera.aspect = container.clientWidth / container.clientHeight;
camera.updateProjectionMatrix();
//in case of window resizing set the correct camera aspect
window.addEventListener('resize', () => {
    //renderer.setSize(renderer.clientWidth, renderer.clientHeight, true);
    
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

function createLine(start, end, color){
    var points = [];
    points.push(start);
    points.push(end);
    var line_geometry = new THREE.BufferGeometry().setFromPoints( points );
    return new THREE.Line( line_geometry, new THREE.LineBasicMaterial({color: color}) );
}

function createDashedLine(start, end, color){
    var points = [];
    points.push(start);
    points.push(end);
    var line_geometry = new THREE.BufferGeometry().setFromPoints( points );
    const result = new THREE.Line( line_geometry, new THREE.LineDashedMaterial({color: color,linewidth:1, scale:1,dashSize: 0.05, gapSize: 0.025}) );
    result.computeLineDistances ()
    return result;
}

function updateLine(line,start, end){
    const vertices = new Float32Array( [
        start.x,start.y,start.z,
        end.x,end.y,end.z
    ] );
    line.geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    line.computeLineDistances();
    line.geometry.attributes.position.needsUpdate = true;       
}

function createSphere(radius, color){
    const sphereGeometry = new THREE.SphereGeometry(radius,20,20);
    const sphereMaterial = new THREE.MeshLambertMaterial({color: color});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    return sphere;
}

function createLighting(){
    const position_factor = 3
    const lights = [];
    const lightHelpers = []; 
    const lightValues = [
        {colour: "white", intensity: 500*8*position_factor, dist: 12*position_factor, x: 1*position_factor, y: 0*position_factor, z: 8*position_factor},
        {colour: "white", intensity: 500*6*position_factor, dist: 12*position_factor, x: -2*position_factor, y: 1*position_factor, z: -10*position_factor},
        {colour: "white", intensity: 500*3*position_factor, dist: 10*position_factor, x: 0*position_factor, y: 10*position_factor, z: 1*position_factor},
        {colour: "white", intensity: 500*6*position_factor, dist: 12*position_factor, x: 0*position_factor, y: -10*position_factor, z: -1*position_factor},
        {colour: "white", intensity: 500*6*position_factor, dist: 12*position_factor, x: 10*position_factor, y: 3*position_factor, z: 0*position_factor},
        {colour: "white", intensity: 500*6*position_factor, dist: 12*position_factor, x: -10*position_factor, y: -1*position_factor, z: 0*position_factor}
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


        lightHelpers[i] = new THREE.PointLightHelper(lights[i], 0.7*position_factor);
        scene.add(lightHelpers[i]);
    }
}



const zero_vector = new Vector3(0,0,0)

const atom_inactive_pool = []
const atom_active_pool = []


//define global variables
var a_axis_line
var rec_a_axis_line
var b_axis_line 
var rec_b_axis_line
var c_axis_line
var rec_c_axis_line
var a_axis_line_b
var a_axis_line_c
var a_axis_line_bc 
var b_axis_line_a
var b_axis_line_c 
var b_axis_line_ac
var c_axis_line_a
var c_axis_line_b
var c_axis_line_ab




export function createContent(){

    //A Axis
    a_axis_line = createLine(zero_vector,CRYSTAL.getRealA(false,"A"),'red')
    scene.add( a_axis_line);

    rec_a_axis_line = createDashedLine(zero_vector, CRYSTAL.getReciprocalA(false,"A"), 'red')
    rec_a_axis_line.visible=true;
    scene.add( rec_a_axis_line);

    //B Axis

    b_axis_line = createLine(zero_vector,CRYSTAL.getRealB(false,"A"),'green')
    scene.add( b_axis_line );

    rec_b_axis_line = createDashedLine(zero_vector, CRYSTAL.getReciprocalB(false,"A"), 'green')
    rec_b_axis_line.visible=true;
    scene.add( rec_b_axis_line);

    //C Axis
    c_axis_line = createLine(zero_vector,CRYSTAL.getRealC(false,"A"),'blue')
    scene.add( c_axis_line );

    rec_c_axis_line = createDashedLine(zero_vector, CRYSTAL.getReciprocalC(false,"A"), 'blue')
    rec_c_axis_line.visible=true;
    scene.add( rec_c_axis_line);

    //complete the bounding box a_axis
    a_axis_line_b = createLine(zero_vector.add(CRYSTAL.getRealB(false,"A")),CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealB(false,"A")), 'grey')
    scene.add( a_axis_line_b )
    a_axis_line_c = createLine(zero_vector.add(CRYSTAL.getRealC(false,"A")),CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealC(false,"A")), 'grey')
    scene.add( a_axis_line_c )
    a_axis_line_bc = createLine(CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealC(false,"A")),CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealC(false,"A")).add(CRYSTAL.getRealB(false,"A")), 'grey')
    scene.add( a_axis_line_bc )

    //complete the bounding box b_axis
    b_axis_line_a = createLine(CRYSTAL.getRealA(false,"A"),CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealA(false,"A")), 'grey')
    scene.add( b_axis_line_a )
    b_axis_line_c = createLine(CRYSTAL.getRealC(false,"A"),CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealC(false,"A")), 'grey')
    scene.add( b_axis_line_c )
    b_axis_line_ac = createLine(CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealC(false,"A")),CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealA(false,"A")).add(CRYSTAL.getRealC(false,"A")), 'grey')
    scene.add( b_axis_line_ac )

    //complete the bounding box c_axis
    c_axis_line_a = createLine(CRYSTAL.getRealA(false,"A"),CRYSTAL.getRealC(false,"A").add(CRYSTAL.getRealA(false,"A")), 'grey')
    scene.add( c_axis_line_a )
    c_axis_line_b = createLine(CRYSTAL.getRealB(false,"A"),CRYSTAL.getRealC(false,"A").add(CRYSTAL.getRealB(false,"A")), 'grey')
    scene.add( c_axis_line_b )
    c_axis_line_ab = createLine(CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealB(false,"A")),CRYSTAL.getRealC(false,"A").add(CRYSTAL.getRealA(false,"A")).add(CRYSTAL.getRealB(false,"A")), 'grey')
    scene.add( c_axis_line_ab )


    //create atoms
    for(let i = 0; i < 50; i++){
        const atom = createSphere(1, "#82DD55")
        atom.visible = false;
        atom.position.set(randomFloatBetween(0,1), randomFloatBetween(0,1), randomFloatBetween(0,1));
        atom_inactive_pool.push(atom);
        scene.add(atom);
    }

    createLighting();

    

}







/****************************************

            FUNCTIONS

****************************************/

export function showRealAxis(show){
    a_axis_line.visible = show;
    b_axis_line.visible = show;
    c_axis_line.visible = show;
}

export function showReciprocalAxis(show){
    rec_a_axis_line.visible = show;
    rec_b_axis_line.visible = show;
    rec_c_axis_line.visible = show;
}

export function showBoundingBox(show){
    a_axis_line_b.visible = show;
    a_axis_line_c.visible = show;
    a_axis_line_bc.visible = show;

    b_axis_line_a.visible = show;
    b_axis_line_c.visible = show;
    b_axis_line_ac.visible = show;

    c_axis_line_a.visible = show;
    c_axis_line_b.visible = show;
    c_axis_line_ab.visible = show;
}

export function showAtoms(show){
    show_atoms = show;
    for(let i = 0; i < atom_active_pool.length; i ++){
        atom_active_pool[i].visible = show;
    }
}

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

export function updateBasisView(){

    //update real basis
    updateLine(a_axis_line, zero_vector, CRYSTAL.getRealA(false,"A"))
    updateLine(b_axis_line, zero_vector, CRYSTAL.getRealB(false,"A"))
    updateLine(c_axis_line, zero_vector, CRYSTAL.getRealC(false,"A"))

    //update reciprocal basis
    updateLine(rec_a_axis_line, zero_vector, CRYSTAL.getReciprocalA(false,"A"))
    updateLine(rec_b_axis_line, zero_vector, CRYSTAL.getReciprocalB(false,"A"))
    updateLine(rec_c_axis_line, zero_vector, CRYSTAL.getReciprocalC(false,"A"))

    //update bounding box
    updateLine(a_axis_line_b,zero_vector.add(CRYSTAL.getRealB(false,"A")),CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealB(false,"A")))
    updateLine(a_axis_line_c,zero_vector.add(CRYSTAL.getRealC(false,"A")),CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealC(false,"A")))
    updateLine(a_axis_line_bc,CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealC(false,"A")),CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealC(false,"A")).add(CRYSTAL.getRealB(false,"A")))

    updateLine(b_axis_line_a,CRYSTAL.getRealA(false,"A"),CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealA(false,"A")))
    updateLine(b_axis_line_c,CRYSTAL.getRealC(false,"A"),CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealC(false,"A")))
    updateLine(b_axis_line_ac,CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealC(false,"A")),CRYSTAL.getRealB(false,"A").add(CRYSTAL.getRealA(false,"A")).add(CRYSTAL.getRealC(false,"A")))

    updateLine(c_axis_line_a,CRYSTAL.getRealA(false,"A"),CRYSTAL.getRealC(false,"A").add(CRYSTAL.getRealA(false,"A")))
    updateLine(c_axis_line_b,CRYSTAL.getRealB(false,"A"),CRYSTAL.getRealC(false,"A").add(CRYSTAL.getRealB(false,"A")))
    updateLine(c_axis_line_ab,CRYSTAL.getRealA(false,"A").add(CRYSTAL.getRealB(false,"A")),CRYSTAL.getRealC(false,"A").add(CRYSTAL.getRealA(false,"A")).add(CRYSTAL.getRealB(false,"A")))

    updateBasisAtoms();
}


export function updateBasisAtoms(){

    const basis_positions = CRYSTAL.getAtomPositions("A")
    const sizes = CRYSTAL.getAtomSizes()
    const colors = CRYSTAL.getAtomColors()



    while(atom_active_pool.length > 0){
        atom_active_pool[0].visible = false;
        atom_inactive_pool.push(atom_active_pool.shift());
    }

    for(let i = 0; i < basis_positions.length & i < atom_inactive_pool.length; i++){
        atom_inactive_pool[0].visible = show_atoms;
        atom_inactive_pool[0].position.set(...basis_positions[i].getArray());

        atom_inactive_pool[0].scale.set(sizes[i],sizes[i],sizes[i])


        atom_inactive_pool[0].material.color.setHex(colors[i])

        
        atom_active_pool.push(atom_inactive_pool.shift());
    }
}

