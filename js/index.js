var i = 0;
var txt = 'Web Developer';
var speed = 80;

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("fullstack").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}
typeWriter();