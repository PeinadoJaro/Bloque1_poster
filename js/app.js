'use strict';
(() => {
  document.documentElement.classList.add('enhanced');
  let active = null;
  let hideTimer;
  function hideDefinition() {
    clearTimeout(hideTimer);
    if (!active) return;
    active.tip.classList.remove('is-visible');
    active = null;
  }
  function positionDefinition() {
    if (!active) return;
    const rect = active.button.getBoundingClientRect();
    const tip = active.tip;
    const width = tip.offsetWidth;
    tip.style.left = Math.max(12, Math.min(innerWidth - width - 12, rect.left + rect.width / 2 - width / 2)) + 'px';
    const below = rect.top - tip.offsetHeight - 10;
    tip.style.top = Math.max(12, below) + 'px';
  }
  function showDefinition(button) {
    clearTimeout(hideTimer);
    if (active && active.button !== button) hideDefinition();
    const tip = document.getElementById(button.getAttribute('aria-describedby'));
    active = {button, tip};
    tip.classList.add('is-visible');
    positionDefinition();
  }
  const postponeHide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(hideDefinition, 180); };
  document.querySelectorAll('.definition-trigger').forEach(button => {
    const tip = document.getElementById(button.getAttribute('aria-describedby'));
    button.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') showDefinition(button); });
    button.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') hideDefinition(); });
    button.addEventListener('focus', () => showDefinition(button));
    button.addEventListener('blur', postponeHide);
  });
  document.addEventListener('pointerdown', e => { if (active && !active.button.contains(e.target) && !active.tip.contains(e.target)) hideDefinition(); });
  window.addEventListener('resize', positionDefinition);
  window.addEventListener('scroll', positionDefinition, {passive: true});

  const groups = [];
  document.querySelectorAll('.concept-group').forEach(group => {
    const panel = group.querySelector('.explore-panel');
    const content = panel.querySelector('.panel-content');
    let selected = null;
    function close(restoreFocus = true) {
      if (!selected) return;
      const former = selected;
      selected.setAttribute('aria-expanded', 'false');
      selected = null;
      panel.hidden = true;
      content.replaceChildren();
      if (restoreFocus) { former.focus({preventScroll: true}); hideDefinition(); }
    }
    group.querySelectorAll('.definition-trigger').forEach(summary => {
      summary.setAttribute('aria-controls', panel.id);
      summary.setAttribute('aria-expanded', 'false');
      summary.addEventListener('click', e => {
        e.preventDefault();
        hideDefinition();
        if (selected === summary) { close(); return; }
        close(false);
        selected = summary;
        summary.setAttribute('aria-expanded', 'true');
        const original = summary.closest('.concept').querySelector('.extended-content');
        content.replaceChildren(...Array.from(original.childNodes, node => node.cloneNode(true)));
        panel.hidden = false;
        const title = content.querySelector('h3');
        title.tabIndex = -1;
        title.focus({preventScroll: true});
        panel.scrollIntoView({block: 'nearest', behavior: 'auto'});
      });
    });
    panel.querySelector('.close-panel').addEventListener('click', () => close());
    groups.push({panel, close});
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (active) { hideDefinition(); return; }
    const group = groups.find(item => !item.panel.hidden && item.panel.contains(document.activeElement));
    if (group) group.close();
  });
  document.querySelectorAll('a[href="#fuentes"],a[href="#ampliacion"]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector(link.getAttribute('href') + ' > details').open = true;
    });
  });
  document.querySelector('.print-button').addEventListener('click', () => window.print());
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = Array.from(document.querySelectorAll('details'), element => ({element, open: element.open}));
    printState.forEach(({element}) => { element.open = true; });
  });
  window.addEventListener('afterprint', () => { printState.forEach(({element, open}) => { element.open = open; }); printState = []; });
})();
