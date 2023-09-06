/**
 * main. js handles all the html-inputs
 * and sends the input-values to the relevant scripts
 * 
 * FUNCTIONS:
 * -basis_changed(basis_positions, types)
 *      -called by handle_vairable_input.js when the basis_input has changed
 *      -forwards the values to crystal.js and triggers
 *       a recalculation of the laue patterns
 */








import * as BASIS_VIEW from "./basis_view.js"
import * as LAB_VIEW from "./lab_view.js"
import * as CRYSTAL from "./crystal.js"
import * as LAUE_VIEW from "./laue_view.js"
import * as HANDLE_VARIABLE_INPUT from "./handle_variable_input.js"
import { Line, Plane, Vector2, Vector3, rotateEulerAngles } from "./linear_algebra.js"
import { randomFloatBetween, randomIntBetween, removeItemAll, round, voltage_to_wavelength, wavelength_to_voltage, atan2 } from "./utility.js"

/*
handles all the ui input and communicates the relevant data to the other scripts
*/


/**************************************************

            SAVE UI ELEMENTS

**************************************************/


/**
 * here all the html input-elements are stored in variables
 * so that we can attach an event-listener to them
 * and change the variables in the scripts when their input has changed
 */




//crystal orientation input
const x_rotation_input = document.getElementById("x-rotation")
const y_rotation_input = document.getElementById("y-rotation")
const z_rotation_input = document.getElementById("z-rotation")
const reset_button = document.getElementById("reset-orientation")
const randomize_button = document.getElementById("randomize-orientation")
const screen_distance_input = document.getElementById("screen-distance")
const cutout_radius_input = document.getElementById("cutout-radius")
const screen_width_input = document.getElementById("screen-width")
const screen_height_input = document.getElementById("screen-height")

//crystal properties input
const cif_input = document.getElementById("cif-upload")
const cif_input_label = document.getElementById("cif-upload-label");

const a_constant_input = document.getElementById("a-constant")
const b_constant_input = document.getElementById("b-constant")
const c_constant_input = document.getElementById("c-constant")

const alpha_constant_input = document.getElementById("alpha-constant")
const beta_constant_input = document.getElementById("beta-constant")
const gamma_constant_input = document.getElementById("gamma-constant")

//display settings input
const consider_spectrum_input = document.getElementById("consider-spectrum")
const consider_structure_factor_input = document.getElementById("consider-structure-factor")
const normalize_brightest_input = document.getElementById("normalize-brightest")

const display_real_basis_input = document.getElementById("display-real-basis")
const display_reciprocal_basis_input = document.getElementById("display-reciprocal-basis")
const display_bounding_box_input = document.getElementById("display-bounding-box")
const display_atoms_input = document.getElementById("display-atoms")
const max_hkl_input = document.getElementById("max-hkl-input");
const all_hkl_button = document.getElementById("100-hkl")

//xray input
const voltage_input = document.getElementById("voltage-input")
const wavelength_input = document.getElementById("wavelength-input")

//laue canvas
const laue_canvas = document.getElementById("laue-canvas-container")
const laue_canvas_rect = laue_canvas.getBoundingClientRect()

const investigate_button = document.getElementById("investigate-reflection")
const rotate_button = document.getElementById("rotate-reflection")
const move_button = document.getElementById("move-reflection")
const download_button = document.getElementById("download-button")


/**
 * voltage_input and wavelength_input ultimately controll the same thing -> the spectrum of the x-rays calculated in crystal.js
 * since voltage determines the min_wavelength we set the default value of the voltage_input (30kV) 
 * and calculate the corresponding min_wavelength
 */
wavelength_input.value = wavelength_input.value = voltage_to_wavelength(Number(voltage_input.value)*1000) * 10**12



/**
 * updateLaueLoop (defined at the end of this document) checks every x mili seconds if updateLaue is true
 * and if so it updates the laue pattern. This yields a higher performance than calling the updateLaue functions
 * everywhere because is keeps the functions from being called every 5 ms  (this happens when dragging the laue image)
 */
let updateLaue = true
let recalculateReflections = true

export function updateAll(){
    updateLaue = true;
    recalculateReflections = true
}

/**************************************************

        INITIALISE THE VARIABLES IN THE SCRIPTS

**************************************************/

/**
 * on start-up the default values in the html doc get inserted into 
 * the relevant scripts via setter-functions
 * CRYSTAL
 *  -setAllConstants (sets the crystal constants)
 *  -setRotation (sets the rotation of the crystal in the lab system)
 *  -set_min_lambda (sets the minimum )
 *  -setMaxHKL(the maximum sum h+k+l that is to be considered when calculating al the laue-reflexes)
 *  -calculateHKL (calculates all the HKL (only once) up to h+k+l = 100)
 *  -calculateLaueReflections (calculates the laue reflects and intensities and stores them)
 * 
 * LAUE_VIEW
 *  -updateCanvase (to display the calculated laue spots)
 * 
 * BASIS_VIEW 
 *  -createContent (creates all the 3D objects in the scene)
 *  -showRealAxis (all show functions are essentially setters for showing the real-axis)
 *  -showReciprocalAxis (... reciprocal axis)
 *  -showBoundingBox (...bounding box of the unit cell)
 */





//set the crystal constants to the default values set in html
CRYSTAL.setAllConstants(
    //convert the constants to angstrom
    Number(a_constant_input.value)*10**-10,
    Number(b_constant_input.value)*10**-10,
    Number(c_constant_input.value)*10**-10,
    Number(alpha_constant_input.value),
    Number(beta_constant_input.value),
    Number(gamma_constant_input.value)
)

//set the crystal rotation
CRYSTAL.setRotation(
    Number(x_rotation_input.value),
    Number(y_rotation_input.value),
    Number(z_rotation_input.value)
)

//set screen distance and cutout radius
CRYSTAL.setScreenDistance(
    Number(screen_distance_input.value)
)

CRYSTAL.setCutoutRadius(
    Number(cutout_radius_input.value)
)
LAUE_VIEW.setCutoutRadius(
    Number(cutout_radius_input.value)
)

//set screen width and height
CRYSTAL.setScreenWidth(
    
    Number(screen_width_input.value)
)
CRYSTAL.setScreenHeight(
    Number(screen_height_input.value)
)
LAUE_VIEW.setScreenWidth(
    Number(screen_width_input.value)
)
LAUE_VIEW.setScreenHeight(
    Number(screen_height_input.value)
)

//set the min_lambda
CRYSTAL.set_min_lambda((wavelength_input.value)*10**(-12))
//set the maximumg h+k+l to be considered whe calculating the laue-pattern
CRYSTAL.setMaxHKL(Number(max_hkl_input.value))
/**
 * calculate the acutual (hkl) aswell as the miller-plane spacing (for every hkl)
 * this has to be done bcause the spacing depends on the lattice constants
 */
CRYSTAL.calculateHKL()
/**
 * Now every relevant variable is set to a value:
 *  -lattice constants
 *  -miller-indices to consider
 *  -resulting plane-spacing
 *  -the crystal-basis (this is handled by handle_variable_input.js before main.js is loaded)
 *      -the structure factor can be calculated by crystal.js
 */
//these functions are automatically called in updateLaueLoop (this yields better performance than just calling it everywhere)
    //the laue pattern is calculated
    //CRYSTAL.calculateLaueReflections();
    //the laue_view canvas gets the positions and intensities from crystal.js
    //LAUE_VIEW.updateCanvas();


//create all the 3D elements
BASIS_VIEW.createContent();
//the setters for the 3D view are initialised with the default html-values
BASIS_VIEW.showRealAxis(display_real_basis_input.checked);
BASIS_VIEW.showReciprocalAxis(display_reciprocal_basis_input.checked);
BASIS_VIEW.showBoundingBox(display_bounding_box_input.checked);



/**************************************************

        SETUP UI INPUT AND EVENTLISTNERS

**************************************************/

/**
 * For every ui-element an eventListener is added
 * to change the variables once the input changes
 */


/**
 * Allows Input of files in the cif format
 * reads the crystal constants and basis of the crystal
 */
cif_input.addEventListener("change", event => {
    const reader = new FileReader();
    const file = cif_input.files[0]

    //change the name of the cif_input field to the filename that was selected
    cif_input_label.innerText = file['name']
    
    reader.addEventListener(
        "load",
        () => {
            /**
             * The file is loaded resulting in a text file
             * called reader.result
             */
            const rows = reader.result.split("\n")
            
            /**
             * every row contains information about the crystal 
             * but we only care about the lattice constants 
             * and the basis atoms. In this for-loop we filter this information
             */
            for(let i = 0; i < rows.length; i++){
                //
                let row_content = removeItemAll(rows[i].split(" "),"")

                //console.log("_______________")
                //console.log(row_content)

                /**
                 * if the row starts with _cell_length_a/b/c it contains the crytal-axis
                 * lengths
                 */
                if(row_content[0] == "_cell_length_a"){
                    a_constant_input.value = Number(row_content[1])
                }
                if(row_content[0] == "_cell_length_b"){
                    b_constant_input.value = Number(row_content[1])
                }
                if(row_content[0] == "_cell_length_c"){
                    c_constant_input.value = Number(row_content[1])
                }

                /**
                 * same for angles
                 */
                if(row_content[0] == "_cell_length_alpha"){
                    alpha_constant_input.value = Number(row_content[1])
                }
                if(row_content[0] == "_cell_length_beta"){
                    beta_constant_input.value = Number(row_content[1])
                }
                if(row_content[0] == "_cell_length_gamma"){
                    gamma_constant_input.value = Number(row_content[1])
                }

                /**
                 * when _atom_site_type_symbol is reached the following rows contain the basis-atoms
                 */
                if(row_content[0] == "_atom_site_type_symbol"){

                    /**
                     * skip every row that starts with _ because that is not yet 
                     * an atom site
                     */
                    while(row_content[0][0] == "_" & i < rows.length){
                        i++;
                        row_content = removeItemAll(rows[i].split(" "),"")    
                    }
                    /**
                     * clear the basis and set max h+k+l to 0 
                     * because every time an element is added to handle_variable_input the laue_pattern is 
                     * recaluclated resulting in long loading times. The proper way to handle this would be to 
                     * add an parameter to addBasisInputElement that determines wether or not the pattern should
                     * be recalculated. This workaround works find though
                     */
                    CRYSTAL.setMaxHKL(0);
                    HANDLE_VARIABLE_INPUT.clearBasisInput();
                    //for every row add the atoms position and corresponding type into Handle_variable_input
                    while(i < rows.length){
                        row_content = removeItemAll(rows[i].split(" "),"")
                        if(row_content.length >= 5){
                            HANDLE_VARIABLE_INPUT.addBasisInputElement(round(row_content[3],2),round(row_content[4],2),round(row_content[5],2), row_content[0])
                        }
                        i++;
                    }
                    //setMaxHKL back to its normal value
                    CRYSTAL.setMaxHKL(Number(max_hkl_input.value))
                    //TODO: shouldnt there be calculateLaueReflections here???
                    //update the canvas to display the new  laue pattern
                    LAUE_VIEW.updateCanvas() //is already executed 15 lines lower 
                }
            }
            
            //set the lattice-constants to the values in the cif file
            CRYSTAL.setAllConstants(
                Number(a_constant_input.value)*10**-10,
                Number(b_constant_input.value)*10**-10,
                Number(c_constant_input.value)*10**-10,
                Number(alpha_constant_input.value),
                Number(beta_constant_input.value),
                Number(gamma_constant_input.value)
            )
            //recalculate new laue pattern and update all the views
            BASIS_VIEW.updateBasisView();
            CRYSTAL.calculateLaueReflections();
            LAUE_VIEW.updateCanvas();

        },
        false
      );
    
      if (file) {
        reader.readAsText(file);
      }
      
})

/**
 * Set the crystal orientation 
 * and recalculate the laue pattern and update the canvas
 */
x_rotation_input.addEventListener("input",event => {
    CRYSTAL.setXRot(Number(x_rotation_input.value))
    LAB_VIEW.setXRot(Number(x_rotation_input.value))
    CRYSTAL.calculateLaueReflections()
    LAUE_VIEW.updateCanvas();
})
y_rotation_input.addEventListener("input",event => {
    CRYSTAL.setYRot(Number(y_rotation_input.value))
    LAB_VIEW.setYRot(Number(y_rotation_input.value))
    CRYSTAL.calculateLaueReflections()
    LAUE_VIEW.updateCanvas();
})
z_rotation_input.addEventListener("input",event => {
    CRYSTAL.setZRot(Number(z_rotation_input.value))
    LAB_VIEW.setZRot(Number(z_rotation_input.value))
    CRYSTAL.calculateLaueReflections()
    LAUE_VIEW.updateCanvas();
})
//reset the crystal orientation to 0°;0°,0°
reset_button.addEventListener("click", event => {
    x_rotation_input.value = 0;
    y_rotation_input.value = 0;
    z_rotation_input.value = 0;

    CRYSTAL.setRotation(0,0,0);
    LAB_VIEW.setRotation(0,0,0)
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

//randomize the crystal orientation
randomize_button.addEventListener("click", event => {
    //set random value for the input_elements
    const x = randomIntBetween(0,359);
    const y = randomIntBetween(0,359);
    const z = randomIntBetween(0,359);

    x_rotation_input.value = x;
    y_rotation_input.value = y;
    z_rotation_input.value = z;


    //set the values for the crstal and Lab_view
    CRYSTAL.setRotation(x,y,z);
    LAB_VIEW.setRotation(x,y,z);
    //recalculate the laue pattern and update the canvas
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

screen_distance_input.addEventListener("input", event => {
    CRYSTAL.setScreenDistance(Number(screen_distance_input.value))
    updateLaue = true;
})

cutout_radius_input.addEventListener("input", event => {
    CRYSTAL.setCutoutRadius(Number(cutout_radius_input.value))
    LAUE_VIEW.setCutoutRadius(Number(cutout_radius_input.value))
    updateLaue = true;
})

screen_width_input.addEventListener("input", event => {
    CRYSTAL.setScreenWidth(Number(screen_width_input.value))
    LAUE_VIEW.setScreenWidth(Number(screen_width_input.value))
    updateLaue = true
})

screen_height_input.addEventListener("input", event => {
    CRYSTAL.setScreenHeight(Number(screen_height_input.value))
    LAUE_VIEW.setScreenHeight(Number(screen_height_input.value))
    updateLaue = true
})

/**
 * update the lattice consatnats
 * and recalculate the laue pattern and update the canvas
 */
a_constant_input.addEventListener("input",event => {
    CRYSTAL.setA(Number(a_constant_input.value)*10**-10)

    BASIS_VIEW.updateBasisView();

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;

})

b_constant_input.addEventListener("input",event => {
    CRYSTAL.setB(Number(b_constant_input.value)*10**-10)
    BASIS_VIEW.updateBasisView();

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})
c_constant_input.addEventListener("input",event => {
    CRYSTAL.setC(Number(c_constant_input.value)*10**-10)
    BASIS_VIEW.updateBasisView();

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;


})
alpha_constant_input.addEventListener("input",event => {
    CRYSTAL.setAlpha(Number(alpha_constant_input.value))
    BASIS_VIEW.updateBasisView();

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;


})
beta_constant_input.addEventListener("input",event => {
    CRYSTAL.setBeta(Number(beta_constant_input.value))
    BASIS_VIEW.updateBasisView();

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;

})
gamma_constant_input.addEventListener("input",event => {
    CRYSTAL.setGamma(Number(gamma_constant_input.value))
    BASIS_VIEW.updateBasisView();

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;


})

/**
 * sets wether the spectrum of the x-rays should
 * have an impact on the brightnes of the laue spots (which it does in realty)
 * increases speed of program when turned off
 */
consider_spectrum_input.addEventListener("input",event => {
    CRYSTAL.set_consider_spectrum(consider_spectrum_input.checked)
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

/**
 * sets wether the structure factor should have an impact on the 
 * brightnes of the laue spots (which it does)
 * increases speed of program when turned off
 */
consider_structure_factor_input.addEventListener("input",event => {
    CRYSTAL.set_consider_structure_factor(consider_structure_factor_input.checked)
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

/**
 * normalizes the brightnes of the brightest visible laue spot
 * use full when there are only very dim reflections 
 */
normalize_brightest_input.addEventListener("input",event => {
    CRYSTAL.set_normalize_brightest(normalize_brightest_input.checked)
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

/**
 * display settings for the basis_view
 */
display_real_basis_input.addEventListener("input",event => {
    BASIS_VIEW.showRealAxis(display_real_basis_input.checked);
})
display_reciprocal_basis_input.addEventListener("input",event => {
    BASIS_VIEW.showReciprocalAxis(display_reciprocal_basis_input.checked);
})
display_bounding_box_input.addEventListener("input",event => {
    BASIS_VIEW.showBoundingBox(display_bounding_box_input.checked);
})
display_atoms_input.addEventListener("input",event => {
    BASIS_VIEW.showAtoms(display_atoms_input.checked);
})

/**
 * set the max_HKL for the calculation of the laue pattern 
 */
max_hkl_input.addEventListener("input",event => {
    CRYSTAL.setMaxHKL(Number(max_hkl_input.value))
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

/**
 * the all_hkl_button forces a calculation of many (not all) laue reflections
 */
all_hkl_button.addEventListener("click", event =>{
    CRYSTAL.calculateLaueReflections(60)
    LAUE_VIEW.updateCanvas()
})

/**
 * voltage input and wavelength input determine spectrum of the incoming x-rays
 * there is a one-to-one relationship between voltage (of the x-ray tube) and the min_voltage
 * so when the value of one changes the other one changes as well
 */
voltage_input.addEventListener("input",event => {
    //set the wavelength input according the voltage (voltage is set in kV => has to be converted to V)
    wavelength_input.value = voltage_to_wavelength(Number(voltage_input.value)*1000) * 10**12
    //set the min wavelenth into the crytal
    CRYSTAL.set_min_lambda((wavelength_input.value)*10**(-12))
    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})
wavelength_input.addEventListener("input",event => {
    //set the voltage input according the min_wavelength (convert to kV)
    voltage_input.value = wavelength_to_voltage(Number(voltage_input.value) * 10**(-12))/1000
    //set the min wavelength into crystal
    CRYSTAL.set_min_lambda((wavelength_input.value)*10**(-12))

    /*
    CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    //recalculte the laue pattern
    updateLaue = true;
})

/*******************
 * 
 * laue canvas buttons
 * 
 ******************/

investigate_button.addEventListener("click", event => {

    if(investigate_button.classList.contains("active")){
        
    }else{
        investigate_button.classList.add("active")
        rotate_button.classList.remove("active")
        move_button.classList.remove("active")
    
        laue_canvas.classList.remove("move")
        laue_canvas.classList.remove("rotate")

        laue_canvas.classList.add("info")
        

        laue_mode = "investigate"
    }
})

rotate_button.addEventListener("click", event => {

    if(rotate_button.classList.contains("active")){
        
    }else{
        investigate_button.classList.remove("active")
        rotate_button.classList.add("active")
        move_button.classList.remove("active")

        laue_canvas.classList.remove("move")
        laue_canvas.classList.remove("info")
    
        laue_canvas.classList.add("rotate")

        laue_mode = "rotate"
    }
})

move_button.addEventListener("click", event => {

    if(move_button.classList.contains("active")){
        
    }else{
        investigate_button.classList.remove("active")
        rotate_button.classList.remove("active")
        move_button.classList.add("active")

        laue_canvas.classList.remove("info")
        laue_canvas.classList.remove("rotate")
    
        laue_canvas.classList.add("move")

        laue_mode = "move"
    }
})

function save_csv(content, filename){
    // Create element with <a> tag
    const link = document.createElement("a");

    // Create a blog object with the file content which you want to add to the file
    const file = new Blob([content], { type: "text/plain" });

    // Add file content in the object URL
    link.href = URL.createObjectURL(file);

    // Add file name
    link.download = filename;

    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
}

function save_img(content, filename){
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', filename);
    //let canvas = document.getElementById('myCanvas');
    //let dataURL = canvas.toDataURL('image/png');
    let dataURL = content
    let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
    downloadLink.setAttribute('href', url);
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href)
}

download_button.addEventListener("click", event => {
    const date = new Date();
    let day = date.getDate();
    if(day < 10){
        day = "0"+String(day)
    }
    else{
        day = String(day)
    }
    let month = date.getMonth()+1;
    if(month < 10){
        month = "0"+String(month)
    }
    else{
        month = String(month)
    }
    let year = date.getFullYear();
    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${year}_${month}_${day}`;

    save_csv(CRYSTAL.getReflectionCSV(), currentDate+"_test.csv")
    save_img(LAUE_VIEW.getImage(), currentDate+"_laue.png")
    
})

/**************************************************

            INPUT FUNCTIONS

**************************************************/

/**
 * this function gets called by the handle_variable_input module when the basis-input has changed
 * it sets the position and types of atoms
 * and updates the laue image and basis view
*/


export function basisChanged(basis_positions, types){
    CRYSTAL.setBasisAtoms(basis_positions, types);
    /*CRYSTAL.calculateLaueReflections();
    LAUE_VIEW.updateCanvas();
    these functions are called down below in updateLaueLoop if updateLaue is true (this yields better perfomance)
    */
    updateLaue = true;
    BASIS_VIEW.updateBasisAtoms();

}

/**************************************************

            SETUP KEY & MOUSE INPUT

**************************************************/

/**
 * Handles all the user input and sends
 * mouse and keybord presses to the relevant scripts
 */

var mouseStart = new Vector2(0,0)
var leftClick = false;
var mouseDown = false;
var mouseOver = "none" //can be "laue" "basis", "lab" or none

var laue_mode = "rotate"; //can be rotate, move or investigate

//rotate the crystal by dragging the laue-picture requires to know the starting position
//let startRot = [x_rotation_input.value,y_rotation_input.value,z_rotation_input.value];
    
/**
 * track what canvas the mouse is over so that it doesnt 
 * move every canvas at once
 */
document.addEventListener("mousedown", event => {

    //console.log(event)

    mouseDown = true;
    mouseStart.x = event.x;
    mouseStart.y = event.y;

    
    
    if(BASIS_VIEW.contains(event.x,event.y)){
        mouseOver = "basis"
    }
    if(LAB_VIEW.contains(event.x, event.y)){
        mouseOver = "lab"
    }
    if(LAUE_VIEW.contains(event.x, event.y)){
        mouseOver = "laue"
        //startRot = [x_rotation_input.value,y_rotation_input.value,z_rotation_input.value]
        if(laue_mode == "investigate"){
            if(LAUE_VIEW.clickInBoundingBox(event.x,event.y)){
                LAUE_VIEW.getReflectionAt(event.x,event.y, false, event.button == 2 /*=> rightclick */)
            }   
        }else if (laue_mode == "rotate"){
            laue_canvas.classList.add("rotating")
        }

    }
})

laue_canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
})

document.addEventListener("mouseup",event => {
    mouseDown = false;
    if(mouseOver == "laue" && laue_mode=="investigate" && event.button == 0/*left click*/){
        if(LAUE_VIEW.clickInBoundingBox(event.x,event.y)){
            LAUE_VIEW.getReflectionAt(event.x,event.y, true)//lock the current info box
        }   
    }
    laue_canvas.classList.remove("rotating")
})

document.addEventListener("mousemove",event => {
    if(mouseDown){
        /**
         * if the mouse is moving, pressed down and was over a canvas
         * when it was pressed it rotates/moves the canvas
         */
        if(mouseOver == "basis"){

            BASIS_VIEW.rotate(event.x-mouseStart.x, event.y-mouseStart.y);
        }
        if(mouseOver == "lab"){

            LAB_VIEW.rotate(event.x-mouseStart.x, event.y-mouseStart.y);
        }
        if(mouseOver == "laue" && laue_mode == "rotate"){
            /**
             * move laue view by rotating the cube around the global z/x-axis
             *
             */       
            if(event.buttons == 1){
                const deltaX = (event.x-mouseStart.x)*0.06
                const deltaY = (event.y-mouseStart.y)*0.06
    
                
                let oldX = x_rotation_input.value;
                let oldY = y_rotation_input.value;
                let oldZ = z_rotation_input.value;
                
    
                const newEulerAngles = rotateEulerAngles(oldX,oldY,oldZ,0,deltaY,-deltaX);//here deltaX/-Y refers to the mouse-movement not the angle difference
    
                const x = newEulerAngles[0]
                const y = newEulerAngles[1]
                const z = newEulerAngles[2]
    
                x_rotation_input.value = x;
                y_rotation_input.value = y;
                z_rotation_input.value = z;
    
                //set the values for the crstal and Lab_view
                CRYSTAL.setRotation(x,y,z);
                LAB_VIEW.setRotation(x,y,z);

                /**
                 * the function updateLaueLoop gets called every 5ms and checks if updateLaue = true
                 * if so it updates the laue pattern by calling CRYSTAL.calculateLaueReflections() and LAUE_VIEW.updateCanvas();
                 * these functions could also be called here instead but that leads to very poor perfomance when the mouse is continuously moved.
                 * Because the update functions are called before the preceeding update is completed
                 */
                
                updateLaue = true;

            }else if(event.buttons == 2){

                
                
                const midX = laue_canvas_rect.left + (laue_canvas_rect.right-laue_canvas_rect.left)/2
                const midY = laue_canvas_rect.top + (laue_canvas_rect.bottom-laue_canvas_rect.top)/2
                
                const current_angle = atan2(event.y-midY, event.x-midX)
                const start_angle = atan2(mouseStart.y-midY, mouseStart.x-midX)
                const delta_angle = current_angle-start_angle;

                let oldX = x_rotation_input.value;
                let oldY = y_rotation_input.value;
                let oldZ = z_rotation_input.value;

                const newEulerAngles = rotateEulerAngles(oldX,oldY,oldZ,delta_angle,0,0);//here deltaX/-Y refers to the mouse-movement not the angle difference
    
                const x = newEulerAngles[0]
                const y = newEulerAngles[1]
                const z = newEulerAngles[2]
    
                x_rotation_input.value = x;
                y_rotation_input.value = y;
                z_rotation_input.value = z;
    
                //set the values for the crstal and Lab_view
                CRYSTAL.setRotation(x,y,z);
                LAB_VIEW.setRotation(x,y,z);
                
                updateLaue = true; 
            }
        }else if(mouseOver == "laue" && laue_mode=="investigate" && event.buttons == 1){
            
            if(LAUE_VIEW.clickInBoundingBox(event.x,event.y)){
                LAUE_VIEW.getReflectionAt(event.x,event.y, false, false)
            }  
        }else if(mouseOver == "laue" && laue_mode=="move"&& event.buttons == 1){
            const deltaX = (event.x-mouseStart.x)
            const deltaY = (event.y-mouseStart.y)
            LAUE_VIEW.move(deltaX, deltaY)
            updateLaue = true;
            recalculateReflections = false;
        }
        mouseStart.x = event.x;
        mouseStart.y = event.y;
    }else{
        /**
         * track what canvas the mouse is over when moving
         */
        mouseOver = "none";
        if(BASIS_VIEW.contains(event.x,event.y)){
            mouseOver = "basis"
        }
        if(LAB_VIEW.contains(event.x,event.y)){
            mouseOver = "lab"
        }
        if(LAUE_VIEW.contains(event.x,event.y)){
            mouseOver = "laue"
        }
    }
})

//zoom into or out of the canvas the mouse is currently over
document.addEventListener("wheel", event => {
    const deltaZ = event.deltaY/100;
    if(mouseOver == "basis"){
        BASIS_VIEW.zoom(deltaZ);
    }
    if(mouseOver == "lab"){
        LAB_VIEW.zoom(deltaZ);
    }
    if(mouseOver == "laue"){
        LAUE_VIEW.zoom(deltaZ);
    }
})

document.addEventListener("keydown", function(event) {


    let deltaX = 0;
    let deltaY = 0;
    let deltaZ = 0;
    
    if(event.code == "ArrowRight"){
        deltaZ = 1
    }
    if(event.code == "ArrowLeft"){
        deltaZ = -1
    }
    if(event.code == "ArrowUp"){
        deltaY = -1
    }
    if(event.code == "ArrowDown"){
        deltaY = 1
    }

    let oldX = x_rotation_input.value;
    let oldY = y_rotation_input.value;
    let oldZ = z_rotation_input.value;

    const newEulerAngles = rotateEulerAngles(oldX,oldY,oldZ,0,deltaY,deltaZ);

    const x = newEulerAngles[0]
    const y = newEulerAngles[1]
    const z = newEulerAngles[2]

    x_rotation_input.value = x;
    y_rotation_input.value = y;
    z_rotation_input.value = z;

    //set the values for the crstal and Lab_view
    CRYSTAL.setRotation(x,y,z);
    LAB_VIEW.setRotation(x,y,z);
    //recalculate the laue pattern and update the canvas
    updateLaue = true;
});


function updatingLaueLoop(){
    if(updateLaue == false){
        setTimeout(updatingLaueLoop, 5)
        return
    }
    updateLaue = false

    if(recalculateReflections){
        CRYSTAL.calculateLaueReflections()
    }else{
        //recalculating the laue indices is the default
        //it can only be skipped if the canvas has been moved (the reflections remain the same only moved by an offset)
        recalculateReflections = true
    }
    

    LAUE_VIEW.updateCanvas();
    setTimeout(updatingLaueLoop, 5)

}
updatingLaueLoop()

