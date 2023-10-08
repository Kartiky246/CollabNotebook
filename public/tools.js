let toolsCont = document.querySelector(".tools-cont");
let optionsCont = document.querySelector(".options-cont");
let optionsFlag = true;
let pencilToolCont = document.querySelector(".pencil-tool-cont");
let eraserToolCont = document.querySelector(".eraser-tool-cont");
let pencil = document.querySelector(".pencil");
let eraser = document.querySelector(".eraser");
let sticky = document.querySelector(".sticky");
let upload = document.querySelector(".upload");
let pencilFlag = false;
let eraserFlag = false;
const user = sessionStorage.getItem('user')

optionsCont.addEventListener("click", (e) => {
    // true -> tools show, false -> hide tools
    optionsFlag = !optionsFlag;
    
    if (optionsFlag){
         openTools();
         const toggleData={
            open:true,
            userName:user
         }
         socket.emit('optionToggle',toggleData)
    }
    else{
     closeTools();
     const toggleData={
        open:false,
        userName:user
     }
     socket.emit('optionToggle',toggleData)
    }
})


function openTools() {
    let iconElem = optionsCont.children[0];
    iconElem.classList.remove("fa-times");
    iconElem.classList.add("fa-bars");
    toolsCont.style.display = "flex";
}
function closeTools() {
    let iconElem = optionsCont.children[0];
    iconElem.classList.remove("fa-bars");
    iconElem.classList.add("fa-times");
    toolsCont.style.display = "none";

    pencilToolCont.style.display = "none";
    eraserToolCont.style.display = "none";
}

pencil.addEventListener("click", (e) => {
    // true -> show pencil tool, false -> hide pencil tool
    pencilFlag = !pencilFlag;

    if (pencilFlag) pencilToolCont.style.display = "block";
    else pencilToolCont.style.display = "none";
})

eraser.addEventListener("click", (e) => {
    // true -> show eraser tool, false -> hide eraser tool
    eraserFlag = !eraserFlag;

    if (eraserFlag) eraserToolCont.style.display = "flex";
    else eraserToolCont.style.display = "none";
})

upload.addEventListener("click", (e) => {
    // Open file explorer
    let input = document.createElement("input");
    input.setAttribute("type", "file");
    input.click();

    input.addEventListener("change", (e) => {
        let file = input.files[0];
        if(file){
        let url = URL.createObjectURL(file);
        let stickyTemplateHTML = `
        <div class="header-cont">
            <div class="minimize">-</div>
            <div class="remove">x</div>
        </div>
        <div class="note-cont">
            <img src="${url}"/>
        </div>
        `;
        let stickyId = Math.random();
        createSticky(stickyTemplateHTML,stickyId);
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageBase64 = event.target.result;
              const stickyObject={
                userName:user,
                img:imageBase64,
                id:stickyId
              }
              socket.emit('stickyCreate', stickyObject);
            };
            reader.readAsDataURL(file);
        }

    })
})

sticky?.addEventListener("click", (e) => {
    let stickyId = Math.random()
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let txtId = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(stickyId * alphabet.length);
      txtId += alphabet.charAt(randomIndex);
    }
    let stickyTemplateHTML = `
    <div class="header-cont">
        <div class="minimize">-</div>
        <div class="remove">x</div>
    </div>
    <div class="note-cont">
        <textarea autofocus  class=${txtId} spellcheck="false"></textarea>
    </div>
    `;
    createSticky(stickyTemplateHTML,stickyId);
    const stickyObject={
        userName:user,
        id:stickyId,
        txtId:txtId
      }
      socket.emit('stickyCreate', stickyObject);
      handleTxtInput(txtId,stickyId);
})

function createSticky(stickyTemplateHTML,id) {
    let stickyCont = document.createElement("div");
    stickyCont.setAttribute("class", "sticky-cont");
    stickyCont.setAttribute("id",id);
    stickyCont.innerHTML = stickyTemplateHTML;
    document.body.appendChild(stickyCont);

    let minimize = stickyCont.querySelector(".minimize");
    let remove = stickyCont.querySelector(".remove");
    noteActions(minimize, remove, stickyCont);

    stickyCont.onmousedown = function (event) {
        dragAndDrop(stickyCont, event);
    };

    stickyCont.ondragstart = function () {
        return false;
    };

}

function noteActions(minimize, remove, stickyCont) {
    const actionData={
        minimize:false,
        remove:false
    }
    remove.addEventListener("click", (e) => {
        stickyCont.remove();
        actionData['remove']=true;
        actionData['minimize']=false;
        actionData['userName'] = user;
        actionData['id'] = stickyCont.getAttribute('id');
        socket.emit('stickyContainerActions',actionData)

    })
    minimize.addEventListener("click", (e) => {
        let noteCont = stickyCont.querySelector(".note-cont");
        let display = getComputedStyle(noteCont).getPropertyValue("display");
        if (display === "none") noteCont.style.display = "block";
        else noteCont.style.display = "none";
        actionData['remove']=false;
        actionData['minimize']=true;
        actionData['userName']=user;
        actionData['id'] = stickyCont.getAttribute('id');
        socket.emit('stickyContainerActions',actionData)
    })

  
}

function dragAndDrop(element, event) {
    let shiftX = event.clientX - element.getBoundingClientRect().left;
    let shiftY = event.clientY - element.getBoundingClientRect().top;

    element.style.position = 'absolute';
    element.style.zIndex = 1000;

    moveAt(event.pageX, event.pageY);


    function moveAt(pageX, pageY) {
        element.style.left = pageX - shiftX + 'px';
        element.style.top = pageY - shiftY + 'px';
        const moveObject={
            userName:user,
            pageX:pageX,
            pageY:pageY,
            id:element.getAttribute('id')
          }
          socket.emit('stickyContainerMove', moveObject);
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    // move the ball on mousemove
    document.addEventListener('mousemove', onMouseMove);

    // drop the ball, remove unneeded handlers
    element.onmouseup = function () {
        document.removeEventListener('mousemove', onMouseMove);
        element.onmouseup = null;
    };
}

socket.on("stickyCreate", (data) => {
  if(user!==data.userName){
    if(data.img){
        let stickyTemplateHTML = `
        <div class="header-cont">
            <div class="minimize">-</div>
            <div class="remove">x</div>
        </div>
        <div class="note-cont">
            <img src="${data?.img}"/>
        </div>
        `;
        createSticky(stickyTemplateHTML,data.id);
  }
    else{
        let stickyTemplateHTML = `
        <div class="header-cont">
            <div class="minimize">-</div>
            <div class="remove">x</div>
        </div>
        <div class="note-cont">
            <textarea autofocus  class=${data.txtId} spellcheck="false"></textarea>
        </div>
        `
        createSticky(stickyTemplateHTML,data.id);

    }

  }
})


socket.on('stickyContainerMove',(data)=>{
    if(data && user!==data.userName){
        let element =  document.getElementById(data.id);
        let shiftX = 0
        let shiftY = 0
        element.style.position = 'absolute';
        element.style.zIndex = 1000;
        element.style.left = data.pageX - shiftX + 'px';
        element.style.top =data.pageY - shiftY + 'px';
    }
})

socket.on('txtchange',(data)=>{
    if(data){
        let element = document.querySelector(`.${data.txtId}`)
        element.innerText = data?.value;
    }
})

socket.on('optionToggle',(data)=>{
    if(data.userName!==user){
        if(data.open){
            openTools()
        }
        else{
            closeTools()
        }
    }
})


socket.on('stickyContainerActions',(data)=>{
    if(data ){
        if(data.minimize && data.userName!==user){
            let noteCont =   document.getElementById(data.id).querySelector(".note-cont");
            let display = getComputedStyle(noteCont).getPropertyValue("display");
            if (display === "none") noteCont.style.display = "block";
            else noteCont.style.display = "none";
        }
        if(data.remove && user!==data.userName){
            document.getElementById(data.id).remove()
        }

    }
})

const handleTxtInput = (id) => {
    const txtArea = document.querySelector(`.${id}`);
    txtArea.addEventListener('input', function() {
        const txtObj={
            value:txtArea.value,
            txtId:id        }
        socket.emit('txtchange',txtObj)
    });

}