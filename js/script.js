/**
 * Ayush Gupta - Portfolio 3D Experience, Theme Management & Core Interactions
 */

let update3DTheme = null;

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initThreeBackground();
    init3DTilt();
    initNavbar();
});

// ================= 1. ACCESSIBLE THEME MANAGEMENT =================
function initTheme() {
    const toggleBtn = document.getElementById("theme-toggle");
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    // Determine initial theme
    const activeTheme = storedTheme ? storedTheme : (systemPrefersLight ? "light" : "dark");
    applyTheme(activeTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    // Listen to system changes if user hasn't overridden
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
            applyTheme(e.matches ? "dark" : "light");
        }
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        const icon = toggleBtn.querySelector("i");
        if (icon) {
            if (theme === "light") {
                icon.className = "fas fa-moon";
                toggleBtn.setAttribute("aria-label", "Switch to dark theme");
                toggleBtn.setAttribute("title", "Switch to dark theme");
            } else {
                icon.className = "fas fa-sun";
                toggleBtn.setAttribute("aria-label", "Switch to light theme");
                toggleBtn.setAttribute("title", "Switch to light theme");
            }
        }
    }
    if (typeof update3DTheme === "function") {
        update3DTheme(theme);
    }
}

// ================= 2. THREE.JS 3D BACKGROUND (WITH ACCESSIBILITY) =================
function initThreeBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        canvas.style.display = "none";
        return;
    }

    if (typeof THREE !== "undefined") {
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.z = 220;

            const renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Particle Mesh Network
            const particleCount = 130;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const velocities = [];

            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 350;
                positions[i + 1] = (Math.random() - 0.5) * 250;
                positions[i + 2] = (Math.random() - 0.5) * 200;

                velocities.push({
                    x: (Math.random() - 0.5) * 0.22,
                    y: (Math.random() - 0.5) * 0.22,
                    z: (Math.random() - 0.5) * 0.22
                });
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

            // Custom glowing circle texture
            const canvasDot = document.createElement("canvas");
            canvasDot.width = 32;
            canvasDot.height = 32;
            const ctxDot = canvasDot.getContext("2d");
            const grad = ctxDot.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, "rgba(249, 115, 22, 1)");
            grad.addColorStop(0.4, "rgba(249, 115, 22, 0.7)");
            grad.addColorStop(1, "rgba(249, 115, 22, 0)");
            ctxDot.fillStyle = grad;
            ctxDot.fillRect(0, 0, 32, 32);

            const texture = new THREE.CanvasTexture(canvasDot);

            const pMaterial = new THREE.PointsMaterial({
                color: 0xf97316,
                size: 5.5,
                map: texture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const particleSystem = new THREE.Points(geometry, pMaterial);
            scene.add(particleSystem);

            // Connecting lines
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xf97316,
                transparent: true,
                opacity: 0.12,
                blending: THREE.AdditiveBlending
            });

            const linesGeometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array(particleCount * particleCount * 6);
            linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
            const lineMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
            scene.add(lineMesh);

            // Central rotating 3D wireframe core
            const geomWire = new THREE.IcosahedronGeometry(75, 1);
            const matWire = new THREE.MeshBasicMaterial({
                color: 0xfba858,
                wireframe: true,
                transparent: true,
                opacity: 0.07
            });
            const icosahedron = new THREE.Mesh(geomWire, matWire);
            scene.add(icosahedron);

            // Responsive 3D Theme Adapter
            update3DTheme = function(theme) {
                const isLight = theme === "light";
                if (pMaterial) {
                    pMaterial.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
                    pMaterial.color.setHex(isLight ? 0xea580c : 0xf97316);
                    pMaterial.opacity = isLight ? 0.75 : 0.85;
                    pMaterial.needsUpdate = true;
                }
                if (lineMaterial) {
                    lineMaterial.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
                    lineMaterial.color.setHex(isLight ? 0xea580c : 0xf97316);
                    lineMaterial.opacity = isLight ? 0.22 : 0.12;
                    lineMaterial.needsUpdate = true;
                }
                if (matWire) {
                    matWire.color.setHex(isLight ? 0xd97706 : 0xfba858);
                    matWire.opacity = isLight ? 0.14 : 0.07;
                    matWire.needsUpdate = true;
                }
            };

            const currentActiveTheme = document.documentElement.getAttribute("data-theme") || "dark";
            update3DTheme(currentActiveTheme);

            // Smooth Mouse Movement
            let mouseX = 0;
            let mouseY = 0;
            let targetX = 0;
            let targetY = 0;

            window.addEventListener("mousemove", (e) => {
                mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
                mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
            });

            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            function animate() {
                requestAnimationFrame(animate);

                targetX += (mouseX - targetX) * 0.04;
                targetY += (mouseY - targetY) * 0.04;

                particleSystem.rotation.y += 0.0007;
                particleSystem.rotation.x += 0.0003;

                icosahedron.rotation.y -= 0.001;
                icosahedron.rotation.x -= 0.0006;

                scene.rotation.y = targetX;
                scene.rotation.x = targetY;

                const pos = particleSystem.geometry.attributes.position.array;
                let lineIdx = 0;
                const lineArray = linesGeometry.attributes.position.array;

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    pos[i3] += velocities[i].x;
                    pos[i3 + 1] += velocities[i].y;
                    pos[i3 + 2] += velocities[i].z;

                    if (Math.abs(pos[i3]) > 180) velocities[i].x *= -1;
                    if (Math.abs(pos[i3 + 1]) > 130) velocities[i].y *= -1;
                    if (Math.abs(pos[i3 + 2]) > 120) velocities[i].z *= -1;

                    for (let j = i + 1; j < particleCount; j++) {
                        const j3 = j * 3;
                        const dx = pos[i3] - pos[j3];
                        const dy = pos[i3 + 1] - pos[j3 + 1];
                        const dz = pos[i3 + 2] - pos[j3 + 2];
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                        if (dist < 52) {
                            lineArray[lineIdx++] = pos[i3];
                            lineArray[lineIdx++] = pos[i3 + 1];
                            lineArray[lineIdx++] = pos[i3 + 2];
                            lineArray[lineIdx++] = pos[j3];
                            lineArray[lineIdx++] = pos[j3 + 1];
                            lineArray[lineIdx++] = pos[j3 + 2];
                        }
                    }
                }

                linesGeometry.setDrawRange(0, lineIdx / 3);
                linesGeometry.attributes.position.needsUpdate = true;
                particleSystem.geometry.attributes.position.needsUpdate = true;

                renderer.render(scene, camera);
            }

            animate();
            return;
        } catch (err) {
            console.warn("Three.js initialization fallback:", err);
        }
    }

    runCanvasFallback(canvas);
}

function runCanvasFallback(canvas) {
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    const dots = Array.from({ length: 70 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2 + 1
    }));

    function frame() {
        ctx.clearRect(0, 0, w, h);
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        ctx.fillStyle = isLight ? "#EA580C" : "#F97316";

        for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            d.x += d.vx;
            d.y += d.vy;
            if (d.x < 0 || d.x > w) d.vx *= -1;
            if (d.y < 0 || d.y > h) d.vy *= -1;

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < dots.length; j++) {
                const d2 = dots[j];
                const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
                if (dist < 95) {
                    ctx.strokeStyle = isLight
                        ? `rgba(234, 88, 12, ${0.24 * (1 - dist / 95)})`
                        : `rgba(249, 115, 22, ${0.14 * (1 - dist / 95)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d2.x, d2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(frame);
    }
    frame();
}

// ================= 3. ACCESSIBLE 3D CARD TILT =================
function init3DTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return; // Touch device check

    const cards = document.querySelectorAll(
        ".card, .stat-card, .project-card, .skill-card, .timeline-card, .contact-card, .hero-card"
    );

    cards.forEach((card) => {
        if (!card.querySelector(".tilt-glare")) {
            const glare = document.createElement("div");
            glare.className = "tilt-glare";
            card.appendChild(glare);
        }

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
            card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
            card.classList.add("tilt-active");
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            card.classList.remove("tilt-active");
        });
    });
}

// ================= 4. NAVBAR & MOBILE DRAWER =================
function initNavbar() {
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".navbar ul");

    window.addEventListener("scroll", () => {
        if (navbar) {
            navbar.classList.toggle("sticky", window.scrollY > 35);
        }
    });

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle("active");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            const icon = navToggle.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars", !isOpen);
                icon.classList.toggle("fa-xmark", isOpen);
            }
        });

        // Close mobile drawer when any link is clicked
        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                navToggle.setAttribute("aria-expanded", "false");
                const icon = navToggle.querySelector("i");
                if (icon) {
                    icon.classList.add("fa-bars");
                    icon.classList.remove("fa-xmark");
                }
            });
        });

        document.addEventListener("click", (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove("active");
                navToggle.setAttribute("aria-expanded", "false");
                const icon = navToggle.querySelector("i");
                if (icon) {
                    icon.classList.add("fa-bars");
                    icon.classList.remove("fa-xmark");
                }
            }
        });
    }

    // Auto mark active nav link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".navbar ul li a");
    links.forEach((link) => {
        const linkPath = link.getAttribute("href");
        if (linkPath === currentPath) {
            link.classList.add("active");
        }
    });
}
