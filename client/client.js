
let canvas;
let ctx;
let socket;
let characters = {};
let hash;
const leftarrow = 37;
let leftarrowBool = false;
const rightarrow = 39;
let rightarrowBool = false;
const spacebar = 32;
let spacebarBool = false;
let hasJumped = true;
let walkImage;

const spriteSize = {
    WIDTH: 100,
    HEIGHT: 100
};



const init = () => {

    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    walkImage = document.querySelector("#walk");

    //connect to socket
    socket = io.connect();


    //after connect to socket
    socket.on("Joined", (data) => {

        characters[data.hash] = data;
        hash = data.hash;
    });

    //other users joined
    socket.on("userJoined", (data) => {
        if(!characters[data.hash])
        {
            characters[data.hash] = data;
        }
    });

    //update position of all chars
    socket.on("serverUpdateposAll", (data) => {
        characters = data.characters;
    });

    //start drawing
    draw();

    //handle buttons
    document.addEventListener("keydown",keydownHandler);
    document.addEventListener("keyup",keyUpHandler);

};

//draw objects on screen
const draw = () => {

    ctx.clearRect(0,0,canvas.width,canvas.height);
    updatePosition();
    let keys = Object.keys(characters);
    for(let x =0;x<keys.length;x++)
    {


        let object = characters[keys[x]];


        if(object.hash === hash)
        {
        if( leftarrowBool || rightarrowBool)
        {
            object.frameCount++;
            
            if(object.frameCount % 3 === 0)
            {
                if(object.frame < 3)
                {
                    object.frame++;
                }
                else
                {
                    object.frame = 1;
                }
            }
        }
        else
        {
            object.frame = 0;
        }
        

        if(leftarrowBool)
        {
            object.direction = 0;
        }
        else if(rightarrowBool)
        {
            object.direction = 1;
        }
        else
        {
            object.direction = 0;
        }
    }

    if(object.hash === hash)
    {
        ctx.filter = "none";
    }
    else
    {
        ctx.filter = "hue-rotate(90deg)";
    }

        ctx.drawImage(
            walkImage, 
            spriteSize.WIDTH * object.frame,
            spriteSize.HEIGHT * object.direction,
            spriteSize.WIDTH, 
            spriteSize.HEIGHT,
            object.x, 
            object.y, 
            spriteSize.WIDTH, 
            spriteSize.HEIGHT
          );




    }

    requestAnimationFrame(draw);
}

//update positions
const updatePosition = () => {

    moveLeftandRight();

    let keys = Object.keys(characters);
    //grab each user
    for(let x =0;x<keys.length;x++)
    {
        let square = characters[keys[x]];

        if(square.alpha < 1)
        {
            square.alpha += 0.05;
        }

        square.x = lerp(square.prevX,square.destX,square.alpha);
        square.y = lerp(square.prevY,square.destY,square.alpha);
        square.prevX = square.x;
        square.prevY = square.y;
        characters[keys[x]] = square;
        
        
    }

    if(hash != undefined)
    {
        if(characters[hash].y > 399)
        {
            hasJumped = false;
        }
    }

    socket.emit("updateFromclient",{"character":characters[hash],"hash":hash});


};

//lerp
const lerp = (v0, v1, alpha) => {
    return (1 - alpha) * v0 + alpha * v1;
  };

// look for keycodes
const keydownHandler = (e) =>
{
    var keyCode = e.keyCode;
    console.log(keyCode);
    if(keyCode == leftarrow)
    {
        leftarrowBool = true;
    }
    else if(keyCode == rightarrow)
    {
        rightarrowBool = true;
    }
    else if(keyCode == spacebar)
    {
        spacebarBool = true;
    }

}

//if keys are released
const keyUpHandler = (e) =>
{
    var keyCode = e.keyCode;

    if(keyCode == leftarrow)
    {
        leftarrowBool = false;
    }
    else if(keyCode == rightarrow)
    {
        rightarrowBool = false;
    }
    else if(keyCode = spacebar)
    {
        spacebarBool = false;
    }

}

const moveLeftandRight = () => {

    let square = characters[hash];

    if(square != undefined)
    {
        if(leftarrowBool && square.destX > 0)
        {
            square.destX -= 2;
        }
        else if(rightarrowBool && square.destX < 400)
        {
            square.destX += 2;
        }
        if(spacebarBool && hasJumped == false)
        {
            square.destY -= 200;
            hasJumped = true;
        }

        square.alpha = 0.05;
    }
};





window.onload = init;