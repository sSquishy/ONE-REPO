
//////////////////////////
// Ano ang chika Slider //
//////////////////////////
  let currentPosition = 0;
  // Slide step = card width (300) + margin (6)
  const slideStep = 306;

  function updateButtons() {
    const container = document.getElementById('slider-container');
    const slider = document.getElementById('card-slider');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    // The maximum negative slide value if the slider's total width is bigger than the container
    const maxScroll = container.offsetWidth - slider.scrollWidth;

    // Hide both buttons if slider can't scroll
    if (slider.scrollWidth <= container.offsetWidth) {
      btnLeft.style.display = 'none';
      btnRight.style.display = 'none';
      return;
    }

    // Show/hide each button depending on the current position
    btnLeft.style.display = currentPosition < 0 ? 'block' : 'none';
    btnRight.style.display = currentPosition > maxScroll ? 'block' : 'none';
  }

  function slideLeft() {
    const slider = document.getElementById('card-slider');
    // Slide back to the right (increase currentPosition),
    // but not past the start (0)
    currentPosition = Math.min(currentPosition + slideStep, 0);
    slider.style.transform = `translateX(${currentPosition}px)`;
    updateButtons();
  }

  function slideRight() {
    const container = document.getElementById('slider-container');
    const slider = document.getElementById('card-slider');
    const maxScroll = container.offsetWidth - slider.scrollWidth;
    // Slide left (decrease currentPosition),
    // but not past maxScroll
    currentPosition = Math.max(currentPosition - slideStep, maxScroll);
    slider.style.transform = `translateX(${currentPosition}px)`;
    updateButtons();
  }

  window.addEventListener('load', updateButtons);
  window.addEventListener('resize', updateButtons);


