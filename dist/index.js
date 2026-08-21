var plugin=(function(){'use strict';var index = {
  onLoad: () => {
    console.log("AI Plugin loaded successfully!");
  },
  onUnload: () => {
    console.log("AI Plugin unloaded!");
  }
};return index;})();
plugin;