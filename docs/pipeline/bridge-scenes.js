/* Bridge: the pipeline playground reuses the prompt lab's scene modules for the families
   状态与回应 (../playground/states.js), 新拟态组件 (neu.js) and 看板菜单 (menu.js),
   so both labs run the same implementation. The modules take the pipeline ctx as their
   third argument: ctx.reduced() follows the page's reduce switch, ctx.d(ms) applies the
   subtle / standard / lively feel, and every status line is mirrored into the event log. */
(() => {
  'use strict';
  const S = window.PIPE_SCENES;
  const L = window.LAB_SCENES || {};
  const MAP = {
    stPlane: ['stateLab', 'plane'], stPress: ['stateLab', 'press'], stAccordion: ['stateLab', 'accordion'],
    stMulti: ['stateLab', 'multi'], stStepper: ['stateLab', 'stepper'], stFlip: ['stateLab', 'flip'],
    stChips: ['stateLab', 'chips'], stSteps: ['stateLab', 'steps'],
    nuLight: ['neuLab', 'light'], nuThermo: ['neuLab', 'thermo'], nuPlayer: ['neuLab', 'player'],
    nuUpload: ['neuLab', 'upload'], nuBooking: ['neuLab', 'booking'], nuQty: ['neuLab', 'quantity'],
    mnSidebar: ['menuLab', 'sidebar'], mnGroups: ['menuLab', 'groups'], mnCapsule: ['menuLab', 'capsule'],
    mnRail: ['menuLab', 'rail'], mnBrand: ['menuLab', 'brand'], mnTabs: ['menuLab', 'tabs']
  };
  Object.keys(MAP).forEach((name) => {
    const [mod, variant] = MAP[name];
    S[name] = (root, ctx) => {
      if (typeof L[mod] !== 'function') throw new Error(mod + ' is not loaded');
      root.classList.add('pl-bridge');
      return L[mod](root, variant, ctx);
    };
  });
})();
