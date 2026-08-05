const CREDLY_USER_ID = "YOUR_CREDLY_USER_ID";
const CREDLY_PROXY = "https://api.allorigins.win/raw?url=";

function initHeroScene() {
  const canvas = document.querySelector("#hero-scene");
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const light = new THREE.HemisphereLight(0x9fb8ff, 0x0b0d1d, 1.1);
  scene.add(light);

  const pointLight = new THREE.PointLight(0xa07aff, 1.3, 80);
  pointLight.position.set(2.5, 4, 5);
  scene.add(pointLight);

  const baseGeometry = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 24);
  const baseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7c5cff,
    roughness: 0.22,
    metalness: 0.5,
    clearcoat: 0.8,
    transmission: 0.18,
    opacity: 0.98,
    transparent: true,
  });

  const knot = new THREE.Mesh(baseGeometry, baseMaterial);
  knot.rotation.x = Math.PI * 0.2;
  scene.add(knot);

  const group = new THREE.Group();
  const segmentMaterial = new THREE.MeshStandardMaterial({ color: 0x4fffb8, roughness: 0.35, metalness: 0.2 });

  for (let i = 0; i < 8; i += 1) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), segmentMaterial);
    const radius = 2.4;
    const angle = (Math.PI * 2 * i) / 8;
    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 0.8) * 0.8, Math.sin(angle) * radius);
    group.add(mesh);
  }

  scene.add(group);

  let mouseX = 0;
  let mouseY = 0;

  const handleMove = (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    mouseX = (x - 0.5) * 2;
    mouseY = (y - 0.5) * 2;
  };

  window.addEventListener("mousemove", handleMove);

  const clock = new THREE.Clock();

  function resize() {
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  resize();

  function animate() {
    const elapsed = clock.getElapsedTime();
    knot.rotation.x = elapsed * 0.18;
    knot.rotation.y = elapsed * 0.16;
    group.rotation.y = elapsed * -0.1;
    group.position.x += (mouseX * 0.35 - group.position.x) * 0.06;
    group.position.y += (-mouseY * 0.25 - group.position.y) * 0.06;
    camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.75, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

function fetchCredlyBadges() {
  const container = document.querySelector("#credly-badges");
  if (!container || CREDLY_USER_ID === "YOUR_CREDLY_USER_ID") {
    if (container) {
      container.innerHTML = "<p class=\"badge-placeholder\">Add your Credly user ID in <code>main.js</code> to load badges.</p>";
    }
    return;
  }

  const profileUrl = `https://www.credly.com/users/${encodeURIComponent(CREDLY_USER_ID)}/badges.json`;
  const endpoint = `${CREDLY_PROXY}${encodeURIComponent(profileUrl)}`;

  fetch(endpoint)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load badge data");
      return response.json();
    })
    .then((raw) => {
      const badges = raw?.badges || raw?.results || [];
      if (!badges.length) {
        throw new Error("No badges found.");
      }

      container.innerHTML = badges.slice(0, 6).map((badge) => {
        const image = badge.image || badge.badge_image || badge?.data?.attributes?.image_url || "";
        const name = badge.name || badge.title || "Certificate";
        const url = badge.url || badge.badge_url || "#";

        return `
          <a class="badge-item" href="${url}" target="_blank" rel="noreferrer noopener">
            <img src="${image}" alt="${name} badge" loading="lazy" />
            <strong>${name}</strong>
          </a>
        `;
      }).join("\n");
    })
    .catch(() => {
      container.innerHTML = "<p class=\"badge-placeholder\">Unable to load badges. Check your Credly profile and proxy settings.</p>";
    });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  const feedback = document.querySelector("#contact-feedback");
  if (!form || !feedback) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "Message captured! I’ll follow up via email soon.";
    form.reset();
  });
}

function initPageScripts() {
  initHeroScene();
  fetchCredlyBadges();
  initScrollAnimations();
  initContactForm();
}

window.addEventListener("DOMContentLoaded", initPageScripts);
