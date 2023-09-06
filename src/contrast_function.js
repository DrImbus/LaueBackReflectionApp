
import { distancePythagoras, log10 } from './utility.js';
import { updateAll } from './main.js';

const canvasContainer = document.getElementById('contrast-function')
const canvas = canvasContainer.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');

canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight; 


var mid_x = canvas.width/2;
var mid_y = canvas.height/2;

const handles = [
                [0,0],
                [0.15,0.8],
                [1,1]
            ]

window.onresize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    mid_x = canvas.width/2;
    mid_y = canvas.height/2;
    updateCanvas();
}



function screen2normalized(screenPosition){
    const screenX = screenPosition[0]
    const screenY = screenPosition[1]

    const rect = canvas.getClientRects()[0]
    const normalizedX = (screenX-rect.left)/rect.width;
    const normalizedY = (rect.height-(screenY-rect.top))/rect.height;
    return [normalizedX,normalizedY]
}

function normalized2screen(normalizedPosition){
    const normalizedX = normalizedPosition[0]
    const normalizedY = normalizedPosition[1]
    const rect = canvas.getClientRects()[0]
    const screenX = normalizedX*rect.width;
    const screenY = rect.height - normalizedY*rect.height;
    return [screenX,screenY]

}

function drawPoint(pos,color='white', size=3){
    const screen_pos = normalized2screen(pos)
    context.lineWidth = 0;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.beginPath();
    context.arc(screen_pos[0],screen_pos[1], size, 0, 2 * Math.PI, false);
    context.fill();
}

function drawLine(start_pos, end_pos, color='white', size = 1){
    context.beginPath();
    const start_screen_pos = normalized2screen(start_pos)
    const end_screen_pos = normalized2screen(end_pos)

    context.moveTo(start_screen_pos[0], start_screen_pos[1]);
    context.lineTo(end_screen_pos[0], end_screen_pos[1]);

    context.strokeStyle = color;
    context.lineWidth = size;
    context.stroke();
}


function updateCanvas(){
    context.clearRect(0,0,canvas.width, canvas.height)
    context.fillStyle = `rgb(${50},${50},${50})`;
    context.fillRect(0, 0, canvas.width, canvas.height);


    for(let i = 0; i < handles.length; i++){
        drawPoint(handles[i])
    }
    for(let i = 0; i < handles.length-1; i++){
        drawLine(handles[i], handles[i+1])
    }
}

updateCanvas()

canvasContainer.addEventListener("contextmenu", event => {
    event.preventDefault();
})

let draggingHandleIndex = -1;

canvasContainer.addEventListener("mousedown", event => {
    if(event.button == 0){//left click
        const normalizedPos = screen2normalized([event.x,event.y])
        
    
            let closestHandleIndex = 1
            let closestDistance = distancePythagoras(normalizedPos,handles[closestHandleIndex])
            for(let i = 1; i < handles.length-1; i++){
                const tempDistance = distancePythagoras(normalizedPos,handles[i])
                if (tempDistance < closestDistance){
                    closestDistance = tempDistance
                    closestHandleIndex = i
                }
            }

            if(closestDistance < 0.05 && closestHandleIndex != 0 && closestHandleIndex != handles.length-1){
                draggingHandleIndex = closestHandleIndex;
            }else{
                handles.push(normalizedPos)
                handles.sort((a,b) => {
                    return a[0]-b[0]
                })
                draggingHandleIndex = handles.indexOf(normalizedPos)
            }    
    }else if(event.button == 2){//right click
        const normalizedPos = screen2normalized([event.x,event.y])
        if(handles.length > 2){
            let closestHandleIndex = 1
            let closestDistance = distancePythagoras(normalizedPos,handles[closestHandleIndex])
            for(let i = 1; i < handles.length-1; i++){
                const tempDistance = distancePythagoras(normalizedPos,handles[i])
                if (tempDistance < closestDistance){
                    closestDistance = tempDistance
                    closestHandleIndex = i
                }
            }
            if(closestDistance < 0.2){
                handles.splice(closestHandleIndex,1)
                handles.sort((a,b) => {
                    return a[0]-b[0]
                })
            }
            
        }
    }
    updateCanvas()
    updateAll()
})

canvasContainer.addEventListener("mouseup",event=>{
    draggingHandleIndex = -1
})



canvasContainer.addEventListener("mousemove", event => {
    if(draggingHandleIndex == -1 || event.buttons == 2/*right click */){
        return
    }
    const normalizedPos = screen2normalized([event.x,event.y])
    handles[draggingHandleIndex] = normalizedPos

    handles.sort((a,b) => {
        return a[0]-b[0]
    })
    draggingHandleIndex = handles.indexOf(normalizedPos)
    updateCanvas()
    updateAll()
})

export function contrast(x){
    x = x**(1/2)
    if(x < 0){
        //console.log(`f(${x}) = ${0}`)
        return 0
    }
    if(x > 1){
        //console.log(`f(${x}) = ${1}`)
        return 1
    }

    //console.log("input: ",x)
    for(let i = 0; i < handles.length-1; i++){
        const a = handles[i]
        const b = handles[i+1]
        if(x >= a[0] && x <= b[0]){
            const distanceBetween = (x-a[0])/(b[0]-a[0])

            //console.log(`f(${x}) = ${((b[1]-a[1])*distanceBetween + a[1])}`)
            return ((b[1]-a[1])*distanceBetween + a[1])
        }
    }
    console.log("no result")
}


