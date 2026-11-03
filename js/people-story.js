/* A single detailed image is fragmented, then precisely reassembled.
   Anime.js controls the playhead; native interpolation handles CDN failure. */
(() => {
  const story = document.querySelector(".people-story");
  if (!story) return;
  const sculpture = story.querySelector(".sculpture-scene");
  const fragments = [...story.querySelectorAll("[data-fragment]")];
  const resolved = story.querySelector(".story-resolved");
  const aura = story.querySelector(".story-aura");
  const progressBar = story.querySelector(".story-progress span");
  const caption = story.querySelector("[data-story-caption]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const playhead = { progress: 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  // Deliberately asymmetric opening: detached pieces at different depths and angles.
  const offsets = [[-15,-12,18],[-4,-19,-23],[12,-14,15],[20,-4,-19],
    [13,9,25],[19,17,-14],[6,20,21],[-8,15,-25],
    [-17,19,13],[-20,3,-18],[-14,-5,27],[-19,-14,-16]];
  let timeline = null;
  let frame = 0;
  let lastCaption = "";
  function render() {
    const p = clamp(playhead.progress);
    // Turn the whole sculpture slowly, keeping all fragments and the final image aligned.
    // Reduced-motion visitors see the upright, fully assembled artwork.
    sculpture.style.transform = motion.matches ? "none" : "rotate(" + (-18 + 36 * p) + "deg)";
    const open = smooth(p / .42);
    const join = smooth((p - .55) / .36);
    fragments.forEach((fragment, i) => {
      const [sx, sy, rotation] = offsets[i];
      const angle = (i / fragments.length) * Math.PI * 2 - Math.PI * .75;
      const spreadX = Math.cos(angle) * 25;
      const spreadY = Math.sin(angle) * 25;
      const x = (sx * (1 - open) + spreadX * open) * (1 - join);
      const y = (sy * (1 - open) + spreadY * open) * (1 - join);
      const turn = rotation * (1 - .65 * open) * (1 - join);
      const scale = 1 - .09 * (1 - join);
      fragment.style.transform = "translate(" + x + "%," + y + "%) rotate(" + turn + "deg) scale(" + scale + ")";
      // The intact image covers subpixel seams at the final position.
      fragment.style.opacity = String(1 - smooth((join - .96) / .04));
    });
    resolved.style.opacity = String(smooth((join - .82) / .18));
    aura.style.opacity = String(.1 + .8 * join);
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
