let storedController;

function storeController(controller) {
  storedController = controller;
}

function abortStoredController() {
  if (storedController) {
    storedController.abort();
    storedController = null;
  }
}

export {storeController, abortStoredController};