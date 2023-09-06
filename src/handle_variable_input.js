import { randomFloatBetween, randomIntBetween} from "./utility.js";
import * as MAIN from "./main.js"
import * as CRYSTAl from "./crystal.js"

/**************************************************

                    BASIS INPUT

**************************************************/


const basis_input = document.getElementById("basis-input");
const basis_variable_input_container = basis_input.firstElementChild;
basis_variable_input_container.style.maxHeight = "0px";
const basis_content_prefab = basis_variable_input_container.firstElementChild.outerHTML;
basis_variable_input_container.removeChild(basis_variable_input_container.firstElementChild);

//remove the " " at the end
if(basis_input.removeChild.classList === undefined){
    basis_input.removeChild(basis_input.lastChild);
}

function createBasisInputElement(x,y,z,atom_type="C"){
    var placeholder = document.createElement("div");
    placeholder.innerHTML = basis_content_prefab;
    placeholder.getElementsByClassName("atom-type")[0].value = atom_type;
    placeholder.getElementsByClassName("x-input")[0].value = x;
    placeholder.getElementsByClassName("y-input")[0].value = y;
    placeholder.getElementsByClassName("z-input")[0].value = z;
    return placeholder.firstChild;
}

export function clearBasisInput(){
    
    let counter = 0;
    while(basis_variable_input_container.firstChild && counter < 100)
    {
        basis_variable_input_container.firstChild.remove();
    }
}

export function addBasisInputElement(x,y,z,atom_type){
    basis_variable_input_container.append(createBasisInputElement(x,y,z,atom_type));

    //add event listener of the remove button
    const removeButtons = basis_variable_input_container.getElementsByClassName("remove");
    removeButtons[removeButtons.length-1].addEventListener("click", event => {

        //remove the input-container when remove-button is clicked
        event.target.parentElement.parentElement.remove()
        
        //adjust the height of the containers to the changed content (when something got added)
        basis_variable_input_container.style.maxHeight = basis_variable_input_container.scrollHeight + "px";
        basis_input.style.maxHeight = (Number(basis_variable_input_container.style.maxHeight.replace("px","")) + 40)+"px"

        //trigger main.js to retrieve basis-data
        updateBasisData();
    })

    //add event listeners to all the input elements
    const inputElements = basis_variable_input_container.getElementsByTagName("input");
    for(let i = 0; i < inputElements.length; i++){
        inputElements[i].addEventListener("input",event => {
            updateBasisData();
        })
    }

    //adjust the height of the containers to the changed content (when something got added)
    basis_variable_input_container.style.maxHeight = basis_variable_input_container.scrollHeight + "px";

    //if the section is active adjust its height aswell
    if(basis_input.previousElementSibling.classList.contains("active")){
        
        basis_input.style.maxHeight = (Number(basis_variable_input_container.style.maxHeight.replace("px","")) + 40)+"px"
    }
    

    //trigger main.js to retrieve basis-data
    updateBasisData();
}

function updateBasisData(){
    const basis = [];
    const types = [];
    for(let i = 0; i < basis_variable_input_container.childElementCount;i++){
        const type = basis_variable_input_container.children[i].getElementsByClassName("atom-type")[0].value
        const x = Number(basis_variable_input_container.children[i].getElementsByClassName("x-input")[0].value);
        const y = Number(basis_variable_input_container.children[i].getElementsByClassName("y-input")[0].value);
        const z = Number(basis_variable_input_container.children[i].getElementsByClassName("z-input")[0].value);
        basis.push([x,y,z]);
        types.push(type);
    }
    MAIN.basisChanged(basis, types);
}

//when the add-button is clicked add an element
document.getElementById("basis-add-button").addEventListener("click",event => {
    addBasisInputElement(randomFloatBetween(0,1,2),randomFloatBetween(0,1,2),randomFloatBetween(0,1,2),"C");
})

//fcc
addBasisInputElement(0,0,0)
//addBasisInputElement(0.5,0,0)

/*addBasisInputElement(1,0,0)
addBasisInputElement(0,1,0)
addBasisInputElement(0,0,1)
addBasisInputElement(1,1,0)
addBasisInputElement(1,0,1)
addBasisInputElement(0,1,1)
addBasisInputElement(1,1,1)

addBasisInputElement(1/2,1/2,0)
addBasisInputElement(1/2,0,1/2)
addBasisInputElement(1/2,1/2,1)
addBasisInputElement(1/2,1,1/2)
addBasisInputElement(0,1/2,1/2)
addBasisInputElement(1,1/2,1/2)
*/

/**************************************************

                    MILLER INPUT

**************************************************/
/*
const miller_input = document.getElementById("miller-input");
const miller_variable_input_container = miller_input.firstElementChild;
miller_variable_input_container.style.maxHeight = "0px";
const miller_content_prefab = miller_variable_input_container.firstElementChild.outerHTML;
miller_variable_input_container.removeChild(miller_variable_input_container.firstElementChild);

//remove the " " at the end
if(miller_input.removeChild.classList === undefined){
    miller_input.removeChild(miller_input.lastChild);
}

function createMillerInputElement(h,k,l){
    var placeholder = document.createElement("div");
    placeholder.innerHTML = miller_content_prefab;
    placeholder.getElementsByClassName("h-input")[0].value = h;
    placeholder.getElementsByClassName("k-input")[0].value = k;
    placeholder.getElementsByClassName("l-input")[0].value = l;
    return placeholder.firstChild;
}

function addMillerInputElement(h,k,l){
    miller_variable_input_container.append(createMillerInputElement(h,k,l));

    //add event listener of the remove button
    const removeButtons = miller_variable_input_container.getElementsByClassName("remove");
    removeButtons[removeButtons.length-1].addEventListener("click", event => {

        //remove the input-container when remove-button is clicked
        event.target.parentElement.parentElement.remove()
        
        //adjust the height of the containers to the changed content (when something got added)
        miller_variable_input_container.style.maxHeight = miller_variable_input_container.scrollHeight + "px";
        miller_input.style.maxHeight = (Number(miller_variable_input_container.style.maxHeight.replace("px","")) + 40)+"px"

        //trigger main.js to retrieve miller-data
        updateMillerData();
    })

    //add event listeners to all the input elements
    const inputElements = miller_variable_input_container.getElementsByTagName("input");
    for(let i = 0; i < inputElements.length; i++){
        inputElements[i].addEventListener("input",event => {
            updateMillerData();
        })
    }

    //adjust the height of the containers to the changed content (when something got added)
    miller_variable_input_container.style.maxHeight = miller_variable_input_container.scrollHeight + "px";
    miller_input.style.maxHeight = (Number(miller_variable_input_container.style.maxHeight.replace("px","")) + 40)+"px"

    //trigger main.js to retrieve miller-data
    updateMillerData();
}

function updateMillerData(){
    const result = [];
    for(let i = 0; i < miller_variable_input_container.childElementCount;i++){
        const x = Number(miller_variable_input_container.children[i].getElementsByClassName("h-input")[0].value);
        const y = Number(miller_variable_input_container.children[i].getElementsByClassName("k-input")[0].value);
        const z = Number(miller_variable_input_container.children[i].getElementsByClassName("l-input")[0].value);
        result.push([x,y,z]);
    }
    MAIN.millerChanged(result);
}

//when the add-button is clicked add an element
document.getElementById("miller-add-button").addEventListener("click",event => {
    addMillerInputElement(1,1,1);
})


addMillerInputElement(1,1,1);
*/