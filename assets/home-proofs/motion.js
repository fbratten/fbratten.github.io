(() => {
  const gallery = document.getElementById("supporting-proofs");
  const button = gallery.querySelector(".fb-proof-motion");
  const sources = gallery.querySelectorAll("picture source");
  const preference = window.matchMedia("(prefers-reduced-motion: no-preference)");
  let paused = false;

  function update() {
    button.hidden = !preference.matches;
    button.textContent = paused ? "Play animations" : "Pause animations";
    for (const source of sources) {
      source.media = paused ? "not all" : preference.media;
    }
  }

  button.addEventListener("click", () => {
    paused = !paused;
    update();
  });
  preference.addEventListener("change", update);
  update();
})();
