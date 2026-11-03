/* Anime.js scrubs a numeric playhead; SVG parts remain ordinary, editable markup.
   Native interpolation also works if the CDN is unavailable. No scroll interception. */
(() => {
  const story = document.querySelector(".people-story");
  if (!story) return;
  const people = [...story.querySelectorAll("[data-person]")];
  const platform = story.querySelector(".story-platform");
  const glow = story.querySelector(".story-glow");
  const core = story.querySelector(".story-core");
  const connections = story.querySelector(".story-connections");
  const progressBar = story.querySelector(".story-progress span");
  const caption = story.querySelector("[data-story-caption]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const playhead = { progress: 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let timeline = null;
  let frame = 0;
  let lastCaption = "";
  function render() {
    const p = clamp(playhead.progress);
    // Open the compressed organisation, then draw its parts into alignment.
    const open = smooth(p / .38);
    const join = smooth((p - .58) / .32);
    const radius = 68 + 147 * open - 60 * join;
    const scatter = open * (1 - join);
    const tension = 1 - open;
    people.forEach((person, i) => {
      const angle = i * Math.PI / 3;
      const x = 300 + Math.cos(angle) * radius;
      const y = 280 + Math.sin(angle) * radius * .55;
      const twist = (i % 2 ? 1 : -1) * (22 * tension + 12 * scatter);
      person.setAttribute("transform", "translate(" + x + " " + y + ") rotate(" + twist + ")");
      person.querySelector(".person-head").setAttribute("transform",
        "translate(" + Math.cos(angle) * 19 * scatter + " " + (-42 * scatter) + ")");
      person.querySelector(".person-body").setAttribute("transform",
        "translate(0 " + (i % 2 ? 16 : -10) * scatter + ")");
      person.querySelector(".person-arms").setAttribute("transform",
        "translate(0 " + 28 * scatter + ") scale(" + (1 + .35 * scatter) + " 1)");
    });
    platform.setAttribute("transform", "translate(0 " + 22 * scatter + ")");
    glow.setAttribute("opacity", String(.05 + .85 * join));
    core.setAttribute("transform", "translate(0 " + (-48 * scatter) + ") rotate(" + 35 * tension + " 300 280)");
    connections.setAttribute("opacity", String(.12 + .78 * join));
    progressBar.style.transform = "scaleX(" + p + ")";
    const text = p < .2 ? "Competing priorities. Shared potential."
      : p < .5 ? "Unpack the challenge."
      : p < .77 ? "Connect people, process and technology."
      : "People. Connected. Moving forward.";
    if (text !== lastCaption) { caption.textContent = text; lastCaption = text; }
  }
  function update() {
    frame = 0;
    if (motion.matches) { playhead.progress = 1; render(); return; }
    const rect = story.getBoundingClientRect();
    const p = clamp(-rect.top / Math.max(1, story.offsetHeight - window.innerHeight));
    if (timeline) timeline.seek(p * 1000, true);
    else playhead.progress = p;
    render();
  }
  function requestUpdate() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }
  function configure() {
    story.classList.toggle("is-animated", !motion.matches);
    update();
  }
  // A pinned version prevents upstream updates changing the choreography.
  if (window.anime && typeof window.anime.createTimeline === "function") {
    try {
      timeline = window.anime.createTimeline({ autoplay: false })
        .add(playhead, { progress: [0, 1], duration: 1000, ease: "linear" });
    } catch (_) { timeline = null; }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("pageshow", requestUpdate);
  motion.addEventListener("change", configure);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(requestUpdate).observe(story);
  configure();
})();
