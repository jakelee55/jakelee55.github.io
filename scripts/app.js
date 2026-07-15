(function () {
  const data = window.SITE_DATA;
  const state = {
    activePage: 0,
    isPageMoving: false,
    touchStartY: 0,
    definitionAnimationPlayed: false,
    definitionAnimationRun: 0,
    momentsAnimationPlayed: false,
    featuredBarrageTimer: null,
    featuredBarrageStartTimer: null,
    featuredBarrageActive: false,
    featuredBarrageLaneCursor: 0,
    featuredBarrageLaneHistory: [],
    featuredPhotoViewerItem: null,
    featuredPhotoViewerAnimation: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function makeImage(src, className, alt = "") {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    if (className) image.className = className;
    image.loading = "lazy";
    return image;
  }

  function setBackgroundImage(element, src) {
    element.innerHTML = "";
    element.appendChild(makeImage(src, "", ""));
  }

  function fullPageEnabled() {
    return !window.matchMedia("(max-width: 980px)").matches;
  }

  function pageSections() {
    return $$("#snapPage > .section");
  }

  function sectionTop(section) {
    const root = $("#snapPage");
    return section.getBoundingClientRect().top + root.scrollTop - root.getBoundingClientRect().top;
  }

  function maxPageScrollTop() {
    const root = $("#snapPage");
    return Math.max(0, root.scrollHeight - root.clientHeight);
  }

  function footerSection() {
    const sections = pageSections();
    const last = sections[sections.length - 1];
    return last?.classList.contains("footer-section") ? last : null;
  }

  function targetPageTop(section) {
    const root = $("#snapPage");
    const top = sectionTop(section);
    const target = section.classList.contains("footer-section")
      ? top + section.offsetHeight - root.clientHeight
      : top;

    return Math.max(0, Math.min(target, maxPageScrollTop()));
  }

  function nearestPageIndex() {
    const root = $("#snapPage");
    const sections = pageSections();
    const footer = footerSection();

    if (footer && root.scrollTop >= targetPageTop(footer) - 2) {
      return sections.length - 1;
    }

    let closest = 0;
    let distance = Infinity;
    sections.forEach((section, index) => {
      const nextDistance = Math.abs(targetPageTop(section) - root.scrollTop);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    return closest;
  }

  function updatePageChrome(index, playSectionAnimation = true) {
    const sections = pageSections();
    const section = sections[index];
    if (!section) return;

    state.activePage = index;
    const navId = section.dataset.nav;
    const isLight = section.dataset.theme === "light";
    const isFooter = section.classList.contains("footer-section");
    const joinSection = $("#join");
    sections.forEach((item, itemIndex) => {
      item.classList.toggle("is-current", itemIndex === index);
    });
    joinSection?.classList.toggle("is-before-footer", isFooter);
    $("#topbar").classList.toggle("is-light", isLight);
    $("#topbar").classList.toggle("is-hidden", isFooter);
    $("#socialRail").classList.toggle("is-blue", isLight);
    $$("[data-nav-link]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.navLink === navId);
    });

    if (navId !== "definition") {
      resetDefinitionAnimation();
    }

    if (playSectionAnimation) {
      if (navId === "definition") playDefinitionAnimation();
      if (navId === "featured") scheduleFeaturedBarrage();
      if (navId === "moments") playMomentsAnimation();
    }

    if (navId !== "featured") {
      stopFeaturedBarrage();
    }
  }

  function easeInOutCubic(progress) {
    return progress < .5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  function easeInOutExpo(progress) {
    if (progress === 0 || progress === 1) return progress;
    return progress < .5
      ? Math.pow(2, 20 * progress - 10) / 2
      : (2 - Math.pow(2, -20 * progress + 10)) / 2;
  }

  function animateOpacity(element, targetOpacity, delay) {
    if (!element) return;

    window.setTimeout(() => {
      const startOpacity = Number(window.getComputedStyle(element).opacity) || 0;
      const distance = targetOpacity - startOpacity;
      const duration = 1000;
      const startedAt = performance.now();

      element.classList.add("is-animating-opacity");

      function tick(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        element.style.opacity = startOpacity + distance * easeInOutExpo(progress);

        if (progress < 1) {
          requestAnimationFrame(tick);
          return;
        }

        element.style.opacity = String(targetOpacity);
        element.classList.remove("is-animating-opacity");
      }

      requestAnimationFrame(tick);
    }, delay);
  }

  function playMomentsAnimation() {
    if (state.momentsAnimationPlayed) return;
    state.momentsAnimationPlayed = true;

    animateOpacity($(".moments-title"), 1, 300);
    animateOpacity($(".moment-card-one"), .6, 100);
    animateOpacity($(".moment-card-two"), .6, 300);
    animateOpacity($(".moment-card-three"), .6, 500);
    animateOpacity($(".moment-card-four"), .6, 700);
  }

  function playDefinitionAnimation() {
    if (state.definitionAnimationPlayed) return;
    state.definitionAnimationPlayed = true;

    const first = $(".definition-word-one");
    const second = $(".definition-word-two");
    const runId = ++state.definitionAnimationRun;
    animateDefinitionWord(first, 180, runId);
    animateDefinitionWord(second, 1280, runId);
  }

  function resetDefinitionAnimation() {
    if (!state.definitionAnimationPlayed) return;
    state.definitionAnimationPlayed = false;
    state.definitionAnimationRun += 1;

    $$(".definition-word").forEach((word) => {
      word.style.opacity = "0";
      word.style.transform = "translate(-50%, calc(-50% + 16px))";
    });
  }

  function animateDefinitionWord(element, delay, runId) {
    if (!element) return;

    element.style.opacity = "0";
    element.style.transform = "translate(-50%, calc(-50% + 16px))";

    window.setTimeout(() => {
      if (runId !== state.definitionAnimationRun) return;

      const duration = 1000;
      const startedAt = performance.now();

      function tick(now) {
        if (runId !== state.definitionAnimationRun) return;

        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = easeInOutCubic(progress);
        const offset = 16 * (1 - eased);

        element.style.opacity = String(eased);
        element.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;

        if (progress < 1) {
          requestAnimationFrame(tick);
          return;
        }

        element.style.opacity = "1";
        element.style.transform = "translate(-50%, -50%)";
      }

      requestAnimationFrame(tick);
    }, delay);
  }

  function animatePageScroll(targetTop, index) {
    const root = $("#snapPage");
    const startTop = root.scrollTop;
    const distance = targetTop - startTop;
    const duration = 760;
    const startedAt = performance.now();

    state.isPageMoving = true;
    updatePageChrome(index, false);

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      root.scrollTop = startTop + distance * easeInOutCubic(progress);
      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }
      root.scrollTop = targetTop;
      state.isPageMoving = false;
      updatePageChrome(index, false);
      finishPageChange(index);
    }

    requestAnimationFrame(tick);
  }

  function finishPageChange(index) {
    updatePageChrome(index);
  }

  function scrollToPage(index, behavior = "smooth") {
    const root = $("#snapPage");
    const sections = pageSections();
    const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
    const target = sections[nextIndex];
    if (!root || !target) return;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const top = targetPageTop(target);
    if (behavior === "auto" || !fullPageEnabled()) {
      root.scrollTop = top;
      state.isPageMoving = false;
      finishPageChange(nextIndex);
      return;
    }

    if (state.isPageMoving || nextIndex === state.activePage) return;
    animatePageScroll(top, nextIndex);
  }

  function movePage(direction) {
    if (!fullPageEnabled() || $("#videoModal").hidden === false) return;
    if (state.isPageMoving) return;
    const current = nearestPageIndex();
    const next = current + direction;
    scrollToPage(next);
  }

  function scrollToSection(id, behavior = "smooth") {
    const target = document.getElementById(id);
    const root = $("#snapPage");
    if (!target || !root) return;
    const index = pageSections().indexOf(target);
    if (index >= 0) scrollToPage(index, behavior);
  }

  function renderNav() {
    const nav = $("#topnav");
    nav.innerHTML = data.nav.map((item) => (
      `<a href="#${item.id}" data-nav-link="${item.id}">${item.label}</a>`
    )).join("");

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-nav-link]");
      if (!link) return;
      event.preventDefault();
      scrollToSection(link.dataset.navLink);
      nav.classList.remove("is-open");
      $("#menuToggle").setAttribute("aria-expanded", "false");
    });
  }

  function renderShell() {
    $("#brandLogo").src = data.brand.logo;
    $("#brandLogo").alt = data.brand.name;
    $("#heroBg").src = data.brand.heroBackground;
    $("#heroSlogan").src = data.brand.slogan;
    $("#heroSlogan").alt = data.brand.name;
    $(".definition-section").style.backgroundImage = `url("${data.definition.background}")`;
    const definitionCopy = $("#definitionCopy");
    const definitionWords = data.definition.words || [];
    definitionCopy.hidden = !definitionWords.length;
    definitionCopy.innerHTML = definitionWords.map((item) => (
      `<img class="definition-word ${item.className}" src="${item.image}" alt="${item.alt || ""}">`
    )).join("");
  }

  function renderSocials() {
    $("#socialLinks").innerHTML = data.socials.map((item) => {
      const icon = item.icon ? `<img class="social-icon" src="${item.icon}" alt="">` : "";
      const qr = item.qr ? `<img class="social-qr" src="${item.qr}" alt="${item.label}二维码">` : "";
      return `<a class="social-link" href="javascript:;" aria-label="${item.label}">
        ${icon}
        ${qr}
      </a>`;
    }).join("");
  }

  function renderFeatured() {
    setBackgroundImage($("#featuredBg"), data.featured.background);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shuffleItems(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function featuredBarrageImages() {
    const config = data.featured.barrage;
    const images = Array.isArray(config?.images) ? config.images : [config?.image];
    return images.filter(Boolean);
  }

  function featuredBarrageItemRatio(image) {
    return image.naturalWidth && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : 1.45;
  }

  function pickFeaturedBarrageImage(layer) {
    const activeImages = new Set(
      $$(".featured-barrage-item", layer).map((item) => item.dataset.barrageSrc)
    );
    const availableImages = featuredBarrageImages().filter((src) => !activeImages.has(src));
    if (!availableImages.length) return "";
    return availableImages[Math.floor(Math.random() * availableImages.length)];
  }

  function updateFeaturedBarrageDuration(image, config) {
    const speed = Math.max(1, config.speed || 95);
    const styles = window.getComputedStyle(image);
    const entryGap = parseFloat(styles.getPropertyValue("--barrage-entry-gap")) || window.innerWidth * .1;
    const imageRect = image.getBoundingClientRect();
    const imageHeight = imageRect.height || image.clientHeight || window.innerHeight * .2;
    const naturalRatio = featuredBarrageItemRatio(image);
    const imageWidth = imageRect.width || image.clientWidth || imageHeight * naturalRatio;
    const travelDistance = window.innerWidth + imageWidth + entryGap;
    image.style.animationDuration = `${(travelDistance / speed) * 1000}ms`;
  }

  function startFeaturedBarrageItem(image, config) {
    if (!image.isConnected || !state.featuredBarrageActive) return;
    updateFeaturedBarrageDuration(image, config);
    const phase = Number(image.dataset.barragePhase || 0);
    const duration = parseFloat(image.style.animationDuration) || 0;
    if (phase > 0 && duration > 0) {
      image.style.animationDelay = `${-duration * phase}ms`;
    }
    image.style.animationPlayState = "";
  }

  function featuredBarrageLayout(section, config) {
    const sectionHeight = section.clientHeight || window.innerHeight;
    const itemHeight = window.innerHeight * .2;
    const maxTop = Math.max(0, sectionHeight - itemHeight);
    const topbarBottom = $("#topbar")?.getBoundingClientRect().bottom || 0;
    const minTop = Math.min(maxTop, Math.max(120, topbarBottom + 28));
    const range = Math.max(0, maxTop - minTop);
    const laneLimit = Math.max(1, config.lanes || 5);
    const verticalGap = Math.max(18, itemHeight * .1);
    const fitCount = Math.max(1, Math.floor(range / (itemHeight + verticalGap)) + 1);
    const laneCount = Math.min(laneLimit, fitCount);
    const laneSpacing = laneCount > 1 ? range / (laneCount - 1) : 0;
    const tops = Array.from({ length: laneCount }, (_, index) => (
      laneCount === 1 ? minTop + range * .5 : minTop + laneSpacing * index
    ));

    return { itemHeight, minTop, maxTop, range, laneCount, laneSpacing, tops, verticalGap };
  }

  function rememberFeaturedBarrageLane(index, laneCount) {
    state.featuredBarrageLaneCursor = Math.floor(Math.random() * laneCount);
    state.featuredBarrageLaneHistory.push(index);
    state.featuredBarrageLaneHistory = state.featuredBarrageLaneHistory.slice(-4);
  }

  function chooseFeaturedBarrageLane(layer, section, config, preferredLane, commit = true) {
    const layout = featuredBarrageLayout(section, config);
    const recentLanes = state.featuredBarrageLaneHistory.slice(-Math.min(3, Math.max(1, layout.laneCount - 1)));
    const enteringZone = window.innerWidth * .72;
    const activeItems = $$(".featured-barrage-item", layer).map((item) => ({
      lane: Number(item.dataset.barrageLane),
      rect: item.getBoundingClientRect()
    }));
    const scoredLanes = layout.tops.map((top, index) => {
      let score = randomBetween(0, 18);
      if (index === state.featuredBarrageLaneCursor) score += 4;

      activeItems.forEach(({ lane, rect }) => {
        if (!Number.isFinite(lane)) return;
        const distanceFromRight = Math.max(0, window.innerWidth - rect.left);
        const enteringWeight = Math.max(0, 1 - distanceFromRight / enteringZone);
        const laneDistance = Math.abs(index - lane);
        if (laneDistance === 0) score -= 120 * (1 + enteringWeight);
        if (laneDistance === 1) score -= 34 * enteringWeight;
        if (laneDistance > 1) score += laneDistance * 5;
      });

      recentLanes.forEach((lane, recentIndex) => {
        const recentWeight = recentLanes.length - recentIndex;
        const laneDistance = Math.abs(index - lane);
        if (laneDistance === 0) score -= 90 * recentWeight;
        if (laneDistance === 1) score -= 18 * recentWeight;
      });

      return { index, top, score };
    }).sort((a, b) => b.score - a.score);
    const preferredIndex = clamp(Math.round(Number(preferredLane)), 0, layout.laneCount - 1);
    const chosen = Number.isFinite(preferredLane)
      ? { index: preferredIndex, top: layout.tops[preferredIndex] }
      : shuffleItems(scoredLanes.filter((item) => item.score >= scoredLanes[0].score - 16))[0] || { index: 0, top: layout.minTop };
    const jitterMax = Math.min(18, Math.max(6, (layout.laneSpacing - layout.itemHeight - layout.verticalGap) * .24));
    const top = clamp(chosen.top + randomBetween(-jitterMax, jitterMax), layout.minTop, layout.maxTop);

    if (commit) rememberFeaturedBarrageLane(chosen.index, layout.laneCount);

    return { index: chosen.index, top, layout };
  }

  function featuredBarragePlacementRect(placement, ratio) {
    const entryGap = clamp(window.innerWidth * .1, 96, 180);
    const width = placement.layout.itemHeight * ratio;
    const height = placement.layout.itemHeight;
    const phase = clamp(Number(placement.phase) || 0, 0, .86);
    const travelDistance = window.innerWidth + width + entryGap;
    const left = window.innerWidth + entryGap - travelDistance * phase;

    return {
      left,
      right: left + width,
      top: placement.top,
      bottom: placement.top + height,
      width,
      height
    };
  }

  function featuredBarrageItemCollisionRect(item, config) {
    const rect = item.getBoundingClientRect();
    const isWaiting = item.style.animationPlayState === "paused" || rect.width <= 1 || rect.height <= 1;
    if (!isWaiting) return rect;

    const section = $("#featured");
    if (!section) return rect;

    const top = parseFloat(item.style.top) || 0;
    const layout = featuredBarrageLayout(section, config);
    return featuredBarragePlacementRect({
      top,
      phase: Number(item.dataset.barragePhase || 0),
      layout
    }, featuredBarrageItemRatio(item));
  }

  function featuredBarrageRectsOverlap(first, second, gapX, gapY) {
    return first.left < second.right + gapX
      && first.right + gapX > second.left
      && first.top < second.bottom + gapY
      && first.bottom + gapY > second.top;
  }

  function featuredBarragePlacementIsClear(layer, config, rect) {
    const gapX = Math.max(46, window.innerWidth * .035);
    const gapY = Math.max(18, window.innerHeight * .024);

    return $$(".featured-barrage-item", layer).every((item) => {
      if (item.classList.contains("is-viewing")) return true;
      const itemRect = featuredBarrageItemCollisionRect(item, config);
      if (itemRect.right < -gapX || itemRect.left > window.innerWidth + 220) return true;
      return !featuredBarrageRectsOverlap(rect, itemRect, gapX, gapY);
    });
  }

  function findFeaturedBarragePlacement(layer, section, config, image, options) {
    const preferredPhase = Number(options.phase);
    const phases = Number.isFinite(preferredPhase)
      ? [
        clamp(preferredPhase, .04, .82),
        clamp(preferredPhase + randomBetween(-.14, .14), .04, .82),
        clamp(preferredPhase + randomBetween(-.22, .22), .04, .82)
      ]
      : [0];
    const ratio = featuredBarrageItemRatio(image);
    const attempts = Number.isFinite(preferredPhase) ? 18 : 12;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const usePreferredLane = Number.isFinite(options.lane) && attempt < 2;
      const lane = chooseFeaturedBarrageLane(
        layer,
        section,
        config,
        usePreferredLane ? options.lane : undefined,
        false
      );
      const placement = {
        index: lane.index,
        top: lane.top,
        layout: lane.layout,
        phase: phases[attempt % phases.length]
      };
      const rect = featuredBarragePlacementRect(placement, ratio);

      if (featuredBarragePlacementIsClear(layer, config, rect)) {
        rememberFeaturedBarrageLane(placement.index, placement.layout.laneCount);
        return placement;
      }
    }

    return null;
  }

  function featuredBarrageInitialPhases(config) {
    const speed = Math.max(1, config.speed || 95);
    const interval = config.interval || 2600;
    const itemHeight = window.innerHeight * .2;
    const averageWidth = itemHeight * 1.45;
    const entryGap = clamp(window.innerWidth * .1, 96, 180);
    const averageDuration = ((window.innerWidth + averageWidth + entryGap) / speed) * 1000;
    const activeEstimate = averageDuration / interval;
    const count = clamp(Math.floor(activeEstimate * .65), 3, 6);
    const phaseStep = Math.min(.22, interval / averageDuration);
    const maxPhase = clamp(phaseStep * count, .42, .72);

    return shuffleItems(Array.from({ length: count }, (_, index) => {
      const bucketStart = index / count;
      const bucketSize = 1 / count;
      return clamp(maxPhase * (bucketStart + randomBetween(.18, .82) * bucketSize), .06, .78);
    }));
  }

  function featuredBarrageInitialPlacements(layer, section, config) {
    const layout = featuredBarrageLayout(section, config);
    const phases = featuredBarrageInitialPhases(config);
    const lanePool = [];

    while (lanePool.length < phases.length) {
      lanePool.push(...shuffleItems(Array.from({ length: layout.laneCount }, (_, index) => index)));
    }

    return phases.map((phase, index) => ({
      phase,
      lane: lanePool[index]
    }));
  }

  function spawnFeaturedBarrageItem(options = {}) {
    const layer = $("#featuredBarrage");
    const section = $("#featured");
    const config = data.featured.barrage;
    if (!layer || !section || !state.featuredBarrageActive) return;

    const imageSrc = pickFeaturedBarrageImage(layer);
    if (!imageSrc) return;

    const image = makeImage(imageSrc, "featured-barrage-item", "");
    image.dataset.barrageSrc = imageSrc;
    image.loading = "eager";
    image.decoding = "async";
    const placement = findFeaturedBarragePlacement(layer, section, config, image, options);
    if (!placement) return;

    image.dataset.barrageLane = String(placement.index);
    image.dataset.barragePhase = String(placement.phase || 0);
    image.style.top = `${placement.top}px`;
    image.style.animationPlayState = "paused";
    image.addEventListener("animationend", () => {
      if (!image.classList.contains("is-viewing")) image.remove();
    });
    image.addEventListener("click", () => openFeaturedPhotoViewer(image));
    layer.appendChild(image);
    updateFeaturedBarrageDuration(image, config);
    if (image.complete) {
      startFeaturedBarrageItem(image, config);
    } else {
      image.addEventListener("load", () => startFeaturedBarrageItem(image, config), { once: true });
      image.addEventListener("error", () => startFeaturedBarrageItem(image, config), { once: true });
    }
  }

  function spawnInitialFeaturedBarrageItems(config) {
    const layer = $("#featuredBarrage");
    const section = $("#featured");
    if (!layer || !section) return;

    featuredBarrageInitialPlacements(layer, section, config).forEach((placement) => {
      spawnFeaturedBarrageItem(placement);
    });
  }

  function spawnFeaturedBarrageWave() {
    const config = data.featured.barrage;
    const maxBatch = Math.max(1, config.batchMax || 1);
    const count = Math.min(maxBatch, Math.random() < .46 ? 2 : 1);

    for (let index = 0; index < count; index += 1) {
      spawnFeaturedBarrageItem();
    }
  }

  function featuredViewerTargetRect(sourceRect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const topbarBounds = $("#topbar")?.getBoundingClientRect();
    const safeTop = Math.max(112, (topbarBounds?.bottom || 0) + 56);
    const safeBottom = viewportHeight - 72;
    const maxWidth = viewportWidth * .72;
    const maxHeight = Math.min(viewportHeight * .72, Math.max(240, safeBottom - safeTop));
    const aspect = sourceRect.width / sourceRect.height;
    let width = maxWidth;
    let height = width / aspect;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspect;
    }

    return {
      left: (viewportWidth - width) * .5,
      top: Math.max(safeTop, (viewportHeight - height) * .5),
      width,
      height
    };
  }

  function applyFeaturedViewerRect(image, rect) {
    image.style.left = `${rect.left}px`;
    image.style.top = `${rect.top}px`;
    image.style.width = `${rect.width}px`;
    image.style.height = `${rect.height}px`;
  }

  function featuredViewerTransform(fromRect, toRect) {
    const translateX = fromRect.left - toRect.left;
    const translateY = fromRect.top - toRect.top;
    const scaleX = fromRect.width / toRect.width;
    const scaleY = fromRect.height / toRect.height;
    return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`;
  }

  function positionFeaturedViewerClose(button, imageRect) {
    const size = Math.min(Math.max(window.innerWidth * .05, 48), 76);
    const gap = Math.min(Math.max(window.innerWidth * .014, 22), 32);
    const top = imageRect.top + 6;
    const preferredLeft = imageRect.left + imageRect.width + gap;
    const left = Math.min(preferredLeft, window.innerWidth - size - 28);

    button.style.width = `${size}px`;
    button.style.height = `${size}px`;
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;
  }

  function openFeaturedPhotoViewer(sourceImage) {
    if (!sourceImage || state.featuredPhotoViewerAnimation) return;

    const viewer = $("#featuredPhotoViewer");
    const viewerImage = $("#featuredPhotoViewerImage");
    const closeButton = $("#featuredPhotoViewerClose");
    const sourceRect = sourceImage.getBoundingClientRect();
    const targetRect = featuredViewerTargetRect(sourceRect);
    if (!viewer || !viewerImage || !closeButton || sourceRect.width <= 0 || sourceRect.height <= 0) return;

    state.featuredPhotoViewerItem = sourceImage;
    sourceImage.classList.add("is-viewing");
    viewer.hidden = false;
    viewerImage.src = sourceImage.currentSrc || sourceImage.src;
    viewerImage.alt = sourceImage.alt || "";
    applyFeaturedViewerRect(viewerImage, targetRect);
    viewerImage.style.transform = featuredViewerTransform(sourceRect, targetRect);
    positionFeaturedViewerClose(closeButton, targetRect);
    closeButton.classList.remove("is-visible");
    requestAnimationFrame(() => closeButton.classList.add("is-visible"));

    state.featuredPhotoViewerAnimation = viewerImage.animate([
      {
        transform: featuredViewerTransform(sourceRect, targetRect)
      },
      {
        transform: "translate3d(0, 0, 0) scale(1)"
      }
    ], {
      duration: 520,
      easing: "cubic-bezier(.2, .8, .2, 1)",
      fill: "forwards"
    });

    state.featuredPhotoViewerAnimation.onfinish = () => {
      applyFeaturedViewerRect(viewerImage, targetRect);
      viewerImage.style.transform = "translate3d(0, 0, 0) scale(1)";
      state.featuredPhotoViewerAnimation = null;
    };
  }

  function closeFeaturedPhotoViewer() {
    const viewer = $("#featuredPhotoViewer");
    const viewerImage = $("#featuredPhotoViewerImage");
    const closeButton = $("#featuredPhotoViewerClose");
    const sourceImage = state.featuredPhotoViewerItem;
    if (!viewer || !viewerImage || !sourceImage) return;

    const startRect = viewerImage.getBoundingClientRect();

    if (state.featuredPhotoViewerAnimation) {
      state.featuredPhotoViewerAnimation.cancel();
      state.featuredPhotoViewerAnimation = null;
    }

    closeButton.classList.remove("is-visible");
    const targetRect = sourceImage.getBoundingClientRect();
    applyFeaturedViewerRect(viewerImage, startRect);
    viewerImage.style.transform = "translate3d(0, 0, 0) scale(1)";

    state.featuredPhotoViewerAnimation = viewerImage.animate([
      {
        transform: "translate3d(0, 0, 0) scale(1)"
      },
      {
        transform: featuredViewerTransform(targetRect, startRect)
      }
    ], {
      duration: 460,
      easing: "cubic-bezier(.4, 0, .2, 1)",
      fill: "forwards"
    });

    state.featuredPhotoViewerAnimation.onfinish = () => {
      sourceImage.classList.remove("is-viewing");
      viewer.hidden = true;
      viewerImage.removeAttribute("src");
      viewerImage.removeAttribute("style");
      state.featuredPhotoViewerItem = null;
      state.featuredPhotoViewerAnimation = null;
    };
  }

  function resetFeaturedPhotoViewer() {
    const viewer = $("#featuredPhotoViewer");
    const viewerImage = $("#featuredPhotoViewerImage");
    const closeButton = $("#featuredPhotoViewerClose");

    if (state.featuredPhotoViewerAnimation) {
      state.featuredPhotoViewerAnimation.cancel();
      state.featuredPhotoViewerAnimation = null;
    }

    state.featuredPhotoViewerItem?.classList.remove("is-viewing");
    state.featuredPhotoViewerItem = null;

    if (viewer) viewer.hidden = true;
    if (viewerImage) {
      viewerImage.removeAttribute("src");
      viewerImage.removeAttribute("style");
    }
    closeButton?.classList.remove("is-visible");
  }

  function initFeaturedBarrage() {
    const layer = $("#featuredBarrage");
    const config = data.featured.barrage;
    if (!layer || !featuredBarrageImages().length || state.featuredBarrageTimer) return;

    layer.innerHTML = "";
    layer.classList.remove("is-active");
    state.featuredBarrageLaneHistory = [];
    state.featuredBarrageLaneCursor = Math.floor(Math.random() * Math.max(1, config.lanes || 5));
    state.featuredBarrageActive = true;
    spawnInitialFeaturedBarrageItems(config);
    requestAnimationFrame(() => layer.classList.add("is-active"));
    state.featuredBarrageTimer = window.setInterval(spawnFeaturedBarrageWave, config.interval || 2600);
  }

  function scheduleFeaturedBarrage() {
    if (state.featuredBarrageTimer || state.featuredBarrageStartTimer) return;

    state.featuredBarrageActive = true;
    state.featuredBarrageStartTimer = window.setTimeout(() => {
      state.featuredBarrageStartTimer = null;
      initFeaturedBarrage();
    }, data.featured.barrage.startDelay || 260);
  }

  function stopFeaturedBarrage() {
    const layer = $("#featuredBarrage");
    state.featuredBarrageActive = false;
    resetFeaturedPhotoViewer();

    if (state.featuredBarrageStartTimer) {
      window.clearTimeout(state.featuredBarrageStartTimer);
      state.featuredBarrageStartTimer = null;
    }

    if (state.featuredBarrageTimer) {
      window.clearInterval(state.featuredBarrageTimer);
      state.featuredBarrageTimer = null;
    }

    if (layer) layer.innerHTML = "";
    layer?.classList.remove("is-active");
  }

  function renderMoments() {
    setBackgroundImage($("#momentsBg"), data.moments.background);
    const decoLeft = makeImage(data.moments.decoLeft, "", "");
    const decoRight = makeImage(data.moments.decoRight, "", "");
    $("#momentDecoLeft").dataset.depth = "0.10";
    $("#momentDecoRight").dataset.depth = "0.10";
    $("#momentDecoLeft").innerHTML = "";
    $("#momentDecoRight").innerHTML = "";
    $("#momentDecoLeft").appendChild(decoLeft);
    $("#momentDecoRight").appendChild(decoRight);
    $("#momentCards").innerHTML = data.moments.items.map((item) => {
      const tagName = item.href ? "a" : "div";
      const hrefAttrs = item.href ? ` href="${item.href}" target="_blank" rel="noreferrer"` : "";
      return `<${tagName} class="moment-card ${item.className}"${hrefAttrs} data-depth="${item.depth}">
        <div class="moment-card-layer">
          <img src="${item.image}" alt="${item.title}">
          <span>${item.title}</span>
        </div>
      </${tagName}>`;
    }).join("");
  }

  function initMomentsParallax() {
    const scene = $("#moments");
    if (!scene) return;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowCenterX = windowWidth * .5;
    let windowCenterY = windowHeight * .5;
    let windowRangeX = Math.max(windowCenterX, windowWidth - windowCenterX);
    let windowRangeY = Math.max(windowCenterY, windowHeight - windowCenterY);
    let inputX = 0;
    let inputY = 0;
    let velocityX = 0;
    let velocityY = 0;

    function updateDimensions() {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      windowCenterX = windowWidth * .5;
      windowCenterY = windowHeight * .5;
      windowRangeX = Math.max(windowCenterX, windowWidth - windowCenterX);
      windowRangeY = Math.max(windowCenterY, windowHeight - windowCenterY);
    }

    function handleMouseMove(event) {
      inputX = (event.clientX - windowCenterX) / windowRangeX;
      inputY = (event.clientY - windowCenterY) / windowRangeY;
    }

    function tick() {
      const bounds = scene.getBoundingClientRect();
      const targetX = inputX * bounds.width * .1;
      const targetY = inputY * bounds.height * .1;

      velocityX += (targetX - velocityX) * .1;
      velocityY += (targetY - velocityY) * .1;

      $$(".moment-deco, .moment-card", scene).forEach((item) => {
        const depth = Number(item.dataset.depth || 0);
        item.style.setProperty("--parallax-x", `${-velocityX * depth}px`);
        item.style.setProperty("--parallax-y", `${-velocityY * depth}px`);
      });

      requestAnimationFrame(tick);
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(tick);
  }

  function renderJoin() {
    $("#joinPerson").src = data.join.person;
    $("#joinPerson").alt = "";
    $("#joinCards").innerHTML = data.join.cards.map((card, index) => {
      const qrPath = card.qr?.startsWith("assets/") ? `../${card.qr}` : card.qr;
      const qrStyle = qrPath ? ` style="--join-card-qr: url('${qrPath}')"` : "";
      return `<button class="join-card" type="button" data-join="${index}"${qrStyle}>
        <span>${card.title}</span>
        <strong>${card.index}</strong>
      </button>`;
    }).join("");
  }

  function renderFooter() {
    $("#footerInner").innerHTML = `
      <p class="footer-links">
        <a href="https://timi.qq.com/" target="_blank" rel="noreferrer">天美工作室群官网</a>
      </p>
      <p>COPYRIGHT © 2024 - 2026 TiMi FANS CLUB-CD. ALL RIGHTS RESERVED.</p>
      <p>米饭联盟成都分部 版权所有</p>
    `;
  }

  function bindEvents() {
    const root = $("#snapPage");

    $("#menuToggle").addEventListener("click", () => {
      const nav = $("#topnav");
      const opened = nav.classList.toggle("is-open");
      $("#menuToggle").setAttribute("aria-expanded", String(opened));
    });

    $("#railToggle").addEventListener("click", () => {
      $("#socialRail").classList.toggle("is-collapsed");
    });

    $("#featuredPhotoViewerClose").addEventListener("click", closeFeaturedPhotoViewer);

    root.addEventListener("wheel", (event) => {
      if (!fullPageEnabled()) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 8) return;
      movePage(delta > 0 ? 1 : -1);
    }, { passive: false });

    root.addEventListener("touchstart", (event) => {
      if (!fullPageEnabled() || !event.touches.length) return;
      state.touchStartY = event.touches[0].clientY;
    }, { passive: true });

    root.addEventListener("touchmove", (event) => {
      if (!fullPageEnabled() || !event.touches.length) return;
      const delta = state.touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) < 45) return;
      event.preventDefault();
      movePage(delta > 0 ? 1 : -1);
      state.touchStartY = event.touches[0].clientY;
    }, { passive: false });

    $("#panelBack").addEventListener("click", () => {
      $("#joinPanel").hidden = true;
    });

    document.addEventListener("click", (event) => {
      const play = event.target.closest("[data-video-key]");
      if (play) openVideo(play.dataset.videoKey);
      if (event.target.id === "videoModal") closeVideo();
      const target = event.target.closest("[data-target]");
      if (target) {
        scrollToSection(target.dataset.target);
      }
    });

    $("#modalClose").addEventListener("click", closeVideo);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeVideo();
        return;
      }

      if (!fullPageEnabled() || $("#videoModal").hidden === false) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;

      const keyMap = {
        ArrowDown: 1,
        PageDown: 1,
        " ": event.shiftKey ? -1 : 1,
        ArrowUp: -1,
        PageUp: -1,
        Home: "home",
        End: "end"
      };
      const action = keyMap[event.key];
      if (action === undefined) return;
      event.preventDefault();
      if (action === "home") {
        scrollToPage(0);
      } else if (action === "end") {
        scrollToPage(pageSections().length - 1);
      } else {
        movePage(action);
      }
    });

  }

  function openVideo(key) {
    const video = data.videos[key];
    if (!video) return;
    const titleLines = video.titleLines || [video.title].filter(Boolean);
    $("#modalPoster").style.backgroundImage = "";
    $("#modalPoster").innerHTML = video.iframeSrc ? `
      <iframe
        src="${video.iframeSrc}"
        scrolling="no"
        border="0"
        frameborder="no"
        framespacing="0"
        allowfullscreen="true"
      ></iframe>
    ` : "";
    $("#modalCopy").innerHTML = `
      <h3>${titleLines.map((line) => `<span>${line}</span>`).join("")}</h3>
      <p>${video.body}</p>
    `;
    $("#videoModal").hidden = false;
  }

  function closeVideo() {
    $("#videoModal").hidden = true;
    $("#modalPoster").innerHTML = "";
  }

  function setupObserver() {
    const topbar = $("#topbar");
    const rail = $("#socialRail");
    const sections = $$("[data-theme]");
    const observer = new IntersectionObserver((entries) => {
      if (state.isPageMoving && fullPageEnabled()) return;
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      const section = visible.target;
      const index = sections.indexOf(section);
      updatePageChrome(index);
    }, {
      root: $("#snapPage"),
      threshold: [.35, .55, .75]
    });
    sections.forEach((section) => observer.observe(section));
  }

  function scrollInitialHash() {
    const id = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const align = () => scrollToSection(id, "auto");
    window.setTimeout(align, 120);
    window.setTimeout(align, 520);
  }

  function renderAll() {
    renderShell();
    renderNav();
    renderSocials();
    renderFeatured();
    renderMoments();
    renderJoin();
    renderFooter();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    initMomentsParallax();
    bindEvents();
    setupObserver();
    updatePageChrome(nearestPageIndex());
    scrollInitialHash();
    window.addEventListener("hashchange", scrollInitialHash);
    window.addEventListener("resize", () => {
      scrollToPage(nearestPageIndex(), "auto");
    });
    window.setTimeout(() => document.body.classList.add("is-ready"), 120);
  });
})();
