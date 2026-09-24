(() => {
  "use strict";

  const icons = () => window.lucide?.createIcons();
  const experimentPanels = new Map();
  const summaryTable = document.querySelector("#experiment-table");
  const summaryLabels = [...summaryTable.querySelectorAll("thead th")].map((cell) => cell.textContent);
  const setExperimentOpen = (entry, open) => {
    entry.button.setAttribute("aria-expanded", String(open));
    entry.row.hidden = !open;
    entry.summary.classList.toggle("is-expanded", open);
    if (!open) entry.row.querySelectorAll("video").forEach((video) => video.pause());
  };
  // Move existing articles, preserving media, nested tabs, and stable deep-link IDs.
  summaryTable.querySelectorAll("tbody > tr").forEach((summary) => {
    const link = summary.querySelector("th a");
    const article = document.getElementById(link.hash.slice(1));
    if (!article) return;
    summary.classList.add("experiment-summary-row");
    [...summary.children].forEach((cell, index) => { cell.dataset.label = summaryLabels[index]; });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "experiment-toggle";
    button.id = `toggle-${article.id}`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", `panel-experiment-${article.id}`);
    const name = document.createElement("span");
    name.textContent = link.textContent;
    button.append(name);
    button.insertAdjacentHTML("beforeend", '<i data-lucide="chevron-down"></i>');
    link.replaceWith(button);
    const row = document.createElement("tr");
    row.className = "experiment-detail-row";
    row.hidden = true;
    const cell = document.createElement("td");
    cell.colSpan = 4;
    const panel = document.createElement("div");
    panel.id = `panel-experiment-${article.id}`;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", button.id);
    panel.append(article);
    cell.append(panel);
    row.append(cell);
    summary.after(row);
    const entry = { button, row, summary };
    experimentPanels.set(article.id, entry);
    button.addEventListener("click", () => {
      setExperimentOpen(entry, button.getAttribute("aria-expanded") !== "true");
    });
  });
  const revealExperiment = (hash) => {
    const target = document.getElementById(hash.slice(1));
    const article = target?.closest(".experiment");
    const entry = article && experimentPanels.get(article.id);
    if (entry) setExperimentOpen(entry, true);
    return entry ? target : null;
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) revealExperiment(link.hash);
  });
  const revealHash = () => {
    const target = revealExperiment(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  };
  addEventListener("hashchange", revealHash);
  revealHash();
  const nav = document.querySelector(".top-nav");
  const menu = document.querySelector(".menu-toggle");
  const closeMenu = () => {
    nav.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
  };

  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".navbar")) closeMenu();
  });
  matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

  const sections = [...document.querySelectorAll("main > section[id]")];
  const sectionLinks = [...document.querySelectorAll(".top-nav a, .side-nav a")];
  let scrollPending = false;
  const updateNavigation = () => {
    const active = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 170);
    sectionLinks.forEach((link) => {
      const current = link.hash === `#${active?.id}`;
      link.classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollPending = false;
  };
  addEventListener("scroll", () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateNavigation);
    }
  }, { passive: true });
  addEventListener("resize", updateNavigation);
  updateNavigation();

  const makeIconButton = (name, label, className = "") => {
    const button = document.createElement("button");
    button.className = `icon-button ${className}`.trim();
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.innerHTML = `<i data-lucide="${name}"></i>`;
    return button;
  };

  const dialog = document.querySelector(".image-dialog");
  const dialogImage = dialog.querySelector(".dialog-image-area img");
  const imageArea = dialog.querySelector(".dialog-image-area");
  const zoomToggle = dialog.querySelector(".zoom-toggle");
  let lastFigureButton = null;

  document.querySelectorAll("[data-zoom]").forEach((image) => {
    const button = makeIconButton("maximize-2", `Enlarge: ${image.alt}`, "figure-zoom");
    image.parentElement.append(button);
    button.addEventListener("click", () => {
      lastFigureButton = button;
      imageArea.classList.remove("full-size");
      zoomToggle.setAttribute("aria-label", "View image at full size");
      zoomToggle.title = "View image at full size";
      zoomToggle.innerHTML = '<i data-lucide="zoom-in"></i>';
      icons();
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt;
      document.querySelector("#image-dialog-caption").textContent =
        image.closest("figure").querySelector("figcaption")?.textContent || image.alt;
      dialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    lastFigureButton?.focus({ preventScroll: true });
  });
  zoomToggle.addEventListener("click", () => {
    const full = imageArea.classList.toggle("full-size");
    const label = full ? "Fit image to screen" : "View image at full size";
    zoomToggle.setAttribute("aria-label", label);
    zoomToggle.title = label;
    zoomToggle.innerHTML = `<i data-lucide="${full ? "minimize-2" : "zoom-in"}"></i>`;
    icons();
  });

  const videos = [...document.querySelectorAll("video")];
  const pauseOutside = (group) => videos.forEach((video) => {
    if (!group?.contains(video)) video.pause();
  });

  document.querySelectorAll("[data-demo-tabs]").forEach((container) => {
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const activate = (selected, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab === selected;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        panel.hidden = !active;
        if (!active) panel.querySelectorAll("video").forEach((video) => video.pause());
      });
      if (focus) selected.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        const destination = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        }[event.key];
        if (destination !== undefined) {
          event.preventDefault();
          activate(tabs[destination], true);
        }
      });
    });
    activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
  });

  document.querySelectorAll("[data-demo-group]").forEach((group) => {
    const pair = [...group.querySelectorAll("video")];
    const controls = group.querySelector(".demo-controls");
    const target = pair.length === 1 ? "recording" : "both recordings";
    const play = makeIconButton("play", `Play ${target}`);
    const replay = makeIconButton("rotate-ccw", `Replay ${target}`);
    const speed = document.createElement("select");
    speed.setAttribute("aria-label", "Playback speed relative to the edited clip");
    speed.title = "Playback speed relative to the edited clip";
    [0.5, 1, 1.5, 2].forEach((rate) => {
      const option = document.createElement("option");
      option.value = rate;
      option.textContent = `${rate}×`;
      option.selected = rate === 1;
      speed.append(option);
    });
    const status = document.createElement("p");
    status.className = "media-error";
    status.setAttribute("role", "status");
    status.hidden = true;
    controls.append(play, replay, speed);
    group.append(status);

    const updatePlayState = () => {
      const playing = pair.some((video) => !video.paused && !video.ended);
      const label = `${playing ? "Pause" : "Play"} ${target}`;
      play.setAttribute("aria-label", label);
      play.title = label;
      play.innerHTML = `<i data-lucide="${playing ? "pause" : "play"}"></i>`;
      icons();
    };
    const startPair = async (restart = false) => {
      status.hidden = true;
      pauseOutside(group);
      if (restart) pair.forEach((video) => { video.currentTime = 0; });
      const outcomes = await Promise.allSettled(pair.map((video) => {
        if (video.ended) video.currentTime = 0;
        return video.play();
      }));
      if (outcomes.some((result) => result.status === "rejected")) {
        pair.forEach((video) => video.pause());
        status.textContent = "Playback could not start. Try the video player's controls.";
        status.hidden = false;
      }
      updatePlayState();
    };
    play.addEventListener("click", () => {
      if (pair.some((video) => !video.paused && !video.ended)) pair.forEach((video) => video.pause());
      else startPair();
    });
    replay.addEventListener("click", () => startPair(true));
    speed.addEventListener("change", () => pair.forEach((video) => { video.playbackRate = Number(speed.value); }));
    pair.forEach((video) => {
      ["play", "pause", "ended"].forEach((event) => video.addEventListener(event, updatePlayState));
    });
  });

  videos.forEach((video) => {
    video.addEventListener("play", () => pauseOutside(video.closest("[data-demo-group]") || video.parentElement));
    video.addEventListener("error", () => {
      if (video.parentElement.querySelector(".video-load-error")) return;
      const error = document.createElement("p");
      error.className = "media-error video-load-error";
      error.setAttribute("role", "status");
      error.textContent = "This recording could not be loaded.";
      video.after(error);
    });
  });
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting && !target.paused) target.pause();
    });
  }, { rootMargin: "180px" });
  videos.forEach((video) => videoObserver.observe(video));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach((video) => video.pause());
  });
  document.querySelectorAll("details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) detail.querySelectorAll("video").forEach((video) => video.pause());
    });
  });
  icons();
})();
