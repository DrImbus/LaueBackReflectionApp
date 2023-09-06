
var collapse_buttons = document.getElementsByClassName("section-headline");

for(let i = 0; i < collapse_buttons.length; i++){

    //at the start check if section-headline is active and collapse or show input-section accordingly
    if(collapse_buttons[i].classList.contains("active")){
        var content = collapse_buttons[i].nextElementSibling
        content.style.maxHeight = content.scrollHeight+"px"
    }else{
        var content = collapse_buttons[i].nextElementSibling
        content.style.maxHeight = 0
    }

    //add eventlistener to the headlines so they act like collapse buttons
    collapse_buttons[i].addEventListener("click", event => {
        event.target.classList.toggle("active");
        var content = event.target.nextElementSibling;        
        if(event.target.classList.contains("active")){
            content.style.maxHeight = content.scrollHeight+"px"
        }else{
            content.style.maxHeight = 0
        }
    })
    
}







