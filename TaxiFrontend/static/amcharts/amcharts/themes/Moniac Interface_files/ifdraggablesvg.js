
function startMove(evt){
    group=evt.target.parentNode;
    x1=evt.clientX - group.$x;
    y1=evt.clientY - group.$y;
    group.setAttribute("onmousemove","moveIt(evt)");
  
  //would adjust other bits in the group here as well (such as the dot, and the plot
  // area
}
function moveIt(evt){
    dx=evt.clientX-x1;
    dy=evt.clientY-y1;
    group.setAttributeNS(null,"transform","translate("+ dx + ", " + dy +")");
    group.$x = dx; 
    group.$y = dy; 
}
function drop(){
    group.setAttributeNS(null, "onmousemove",null);
}
