// Initialize Lenis
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Stop Lenis while loading
lenis.stop();

gsap.registerPlugin(ScrollTrigger);

// --- CUSTOM CURSOR & MOUSE FOLLOWER ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const mouseGlow = document.querySelector('.mouse-follower-glow');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let outlineX = mouseX;
let outlineY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate dot update
    if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }
    
    // CSS variable for glow background
    document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
});

// Smooth outline loop
function animateCursor() {
    let distX = mouseX - outlineX;
    let distY = mouseY - outlineY;
    outlineX += distX * 0.15;
    outlineY += distY * 0.15;
    
    if (cursorOutline) {
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
    }
    requestAnimationFrame(animateCursor);
}
if(window.innerWidth > 768) {
    animateCursor();
}

// Hover states
const hoverElements = document.querySelectorAll('a, button, .tilt-card, .magnetic, .faq-item');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursorOutline) cursorOutline.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        if (cursorOutline) cursorOutline.classList.remove('hover');
    });
});

// --- MAGNETIC BUTTONS ---
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        if(window.innerWidth <= 768) return;
        const position = el.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        
        // Use data-strength to control how much it moves
        const strength = el.getAttribute('data-strength') || 20;
        
        gsap.to(el, {
            x: (x / position.width) * strength,
            y: (y / position.height) * strength,
            duration: 1,
            ease: "power4.out"
        });
        
        // Move children slightly more for parallax effect
        const children = el.querySelectorAll('.btn-text, i');
        if (children.length > 0) {
            gsap.to(children, {
                x: (x / position.width) * (strength * 0.5),
                y: (y / position.height) * (strength * 0.5),
                duration: 1,
                ease: "power4.out"
            });
        }
    });
    
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        const children = el.querySelectorAll('.btn-text, i');
        if (children.length > 0) {
            gsap.to(children, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        }
    });
});

// --- HEADLINE REVEAL (Word-level, not character-level) ---
function buildHeadlineWords(selector) {
    const el = document.querySelector(selector);
    if (!el) return [];

    // Read the existing spans (Build., Grow., Dominate.)
    const spans = el.querySelectorAll('span');
    const wordSpans = [];

    spans.forEach((span, index) => {
        const text = span.innerText.trim();
        const isGradient = span.classList.contains('gradient-text');

        // Create a .line wrapper (overflow:hidden clips the slide-up)
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('line');

        // Create the inner animated .word span
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        wordSpan.innerText = text;
        if (isGradient) wordSpan.classList.add('gradient-text');

        lineDiv.appendChild(wordSpan);
        wordSpans.push(wordSpan);
        span.replaceWith(lineDiv);
    });

    return wordSpans;
}

const headlineWords = buildHeadlineWords('.split-text');

// --- LOADER TIMELINE ---
const loaderTl = gsap.timeline();
const percentEl = document.getElementById('loader-percentage');

// Simulate loading progress
let loadObj = { value: 0 };
loaderTl.to(loadObj, {
    value: 100,
    duration: 3,
    ease: "power2.inOut",
    onUpdate: () => {
        if(percentEl) percentEl.innerText = Math.round(loadObj.value);
    }
});

// Animation sequence
const mainIntroTl = gsap.timeline({ paused: true });

mainIntroTl
.to(".loader-logo-wrapper", { opacity: 1, scale: 1, duration: 1, ease: "power4.out" })
.to(".loader-glow", { opacity: 1, duration: 1 }, "-=0.5")
.to(".loader-title", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.5")
.to(".loader-subtitle", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8")
.to(".loader-progress", { opacity: 1, duration: 0.5 }, "-=0.5")
// Wait for loading progress
.to(".loader", { 
    yPercent: -100, 
    duration: 1.5, 
    ease: "power4.inOut", 
    delay: 3
})
.set("body", { className: "" })
.call(() => lenis.start())
// Reveal Hero Words (whole lines, not chars)
.to(headlineWords, {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 1.2,
    ease: "power4.out"
}, "-=0.5")
.to(".hero-tagline", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.7")
.to(".hero-desc", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.7")
.to(".hero-cta-group", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.5")
.to(".hero-visuals", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.5")


// Play loader
mainIntroTl.play();


// --- SCROLL PROGRESS BAR ---
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = progress + '%';
});

// --- NAVBAR EFFECT ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if(hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// Smooth Scrolling for Nav Anchors using Lenis
document.querySelectorAll('a.nav-anchor').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80, // adjust for sticky navbar
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        }
    });
});

// --- VANILLA TILT ---
VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": 0.1,
    scale: 1.02
});

// --- SCROLL TRIGGER REVEALS ---
gsap.utils.toArray('.reveal-up').forEach(element => {
    gsap.to(element, {
        scrollTrigger: {
            trigger: element,
            start: "top 85%",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// Counter Animations
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
    ScrollTrigger.create({
        trigger: counter,
        start: "top 90%",
        onEnter: () => {
            const target = +counter.getAttribute('data-target');
            gsap.to(counter, {
                innerHTML: target,
                duration: 2,
                snap: { innerHTML: 1 },
                ease: "power2.out"
            });
        },
        once: true
    });
});

// --- FLOATING PARTICLES ---
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        particlesContainer.appendChild(particle);
        
        gsap.to(particle, {
            y: `-=${Math.random() * 200 + 100}`,
            x: `+=${Math.random() * 100 - 50}`,
            rotation: Math.random() * 360,
            duration: Math.random() * 10 + 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * -20
        });
    }
}

// --- FAQ ACCORDION ---
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const head = item.querySelector('.faq-head');
    head.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all
        faqItems.forEach(f => {
            f.classList.remove('active');
            f.querySelector('.faq-body').style.maxHeight = null;
        });
        
        // Open clicked if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            const body = item.querySelector('.faq-body');
            body.style.maxHeight = body.scrollHeight + "px";
        }
    });
});

// --- INTERACTIVE CALCULATOR ---
const calcService = document.getElementById('calc-service');
const calcQty = document.getElementById('calc-qty');
const qtyContainer = document.getElementById('qty-container');
const calcTotal = document.getElementById('calc-total');
const calcNotice = document.getElementById('calc-notice');

function updateCalculator() {
    if (!calcService) return;
    
    const serviceValue = parseInt(calcService.value);
    const qty = parseInt(calcQty.value) || 1;
    let total = 0;
    
    if (calcNotice) calcNotice.style.display = 'none';

    if (serviceValue === 0) {
        qtyContainer.style.display = 'none';
        total = 0;
    } else {
        // Single unit services (no quantity selector)
        if ([4199, 6999, 7999, 8499].includes(serviceValue)) {
            qtyContainer.style.display = 'none';
            total = serviceValue;
        } else {
            qtyContainer.style.display = 'block';
            total = serviceValue * qty;
        }
    }

    gsap.to(calcTotal, {
        innerHTML: total,
        duration: 0.5,
        snap: { innerHTML: 1 },
        onUpdate: function() {
            if(calcTotal) calcTotal.innerHTML = Number(Math.ceil(calcTotal.innerHTML)).toLocaleString('en-IN');
        }
    });
}

if(calcService) {
    calcService.addEventListener('change', () => {
        calcQty.value = 1;
        updateCalculator();
    });
}

if(calcQty) {
    calcQty.addEventListener('input', updateCalculator);
}

// --- WHATSAPP CONTACT FORM ---
const contactForm = document.getElementById('contact-form');
const formError = document.getElementById('form-error');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const service = document.getElementById('contact-service').value;
        const message = document.getElementById('contact-message').value.trim();
        
        // Validation
        if (!name || !email || !phone || !service || !message) {
            formError.innerText = "Please fill out all fields before sending.";
            formError.style.display = "block";
            gsap.fromTo(formError, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
            return;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            formError.innerText = "Please enter a valid email address.";
            formError.style.display = "block";
            gsap.fromTo(formError, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: "bounce.out" });
            return;
        }

        formError.style.display = "none";

        // Construct WhatsApp Message
        const waMessage = `Hello Alpha_Grow_Creation,

I would like to enquire about your services.

Name:
${name}

Email:
${email}

Phone:
${phone}

Service:
${service}

Project Details:
${message}

Looking forward to your response.`;

        // Encode message
        const encodedMessage = encodeURIComponent(waMessage);
        
        // Open WhatsApp
        const waUrl = `https://wa.me/917812888729?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
    });
}
