const startGameButton = document.querySelector("#start-game-button");
const initialModal = document.querySelector("#initial-modal");

startGameButton.onclick = () => {
  initialModal.style.display = "none";
  requestAnimationFrame(gameLoop);
};
