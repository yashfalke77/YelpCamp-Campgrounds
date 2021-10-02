let images = ['/img/camp1.png', '/img/camp2.png', '/img/camp3.png'];
let slide = document.getElementById('slider');
const slider = () => {
    let i = 0;
    setInterval(
      function() {
        i = i < images.length - 1 ? ++i : 0;
        slide.src = images[i];
        console.log(i);
      }, 2000);
  }
  slide.addEventListener('load', slider());