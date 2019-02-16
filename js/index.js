var i = 0;
var txt = 'ML Web Api';
var speed = 80;

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("fullstack").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}
typeWriter();

VANTA.TRUNK({ el: "#particles-js", color: 0xcd2458, backgroundColor: 0x0c1c2c })