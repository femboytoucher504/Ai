export default {
  onLoad() {
    try {
      window.vendetta?.ui?.toasts?.showToast?.("MINIMAL TEST OK", "success");
    } catch (e) {}
  },
  onUnload() {}
};
