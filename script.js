const typing = document.querySelector('.typing');
const phrases = ['Software Engineer', 'Problem Solver', 'Web Developer', 'Tech Enthusiast'];
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;
let currentText = '';
let delay = 100;

function typeEffect() {
  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    currentText = currentPhrase.substring(0, letterIndex - 1);
    letterIndex--;
  } else {
    currentText = currentPhrase.substring(0, letterIndex + 1);
    letterIndex++;
  }

  typing.textContent = currentText;

  // Adjust timing
  if (!isDeleting && letterIndex === currentPhrase.length) {
    delay = 1500; // Pause before deleting
    isDeleting = true;
  } else if (isDeleting && letterIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 500; // Pause before typing next
  } else {
    delay = isDeleting ? 50 : 100;
  }

  setTimeout(typeEffect, delay);
}

function createParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = Math.random() * 4 + 4 + "s";
    particlesContainer.appendChild(particle);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  typeEffect();       // from previous typing effect
  createParticles();  // add sparkle particles
});

