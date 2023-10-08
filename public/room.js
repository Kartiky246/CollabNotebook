const generateRandomRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    return randomId;
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    const roomIdInput = document.getElementById("roomId");
    const createNewRoomText = document.getElementById("createNewRoom");
    createNewRoomText.addEventListener("click", () => {
      const randomRoomId = generateRandomRoomId();
  
      roomIdInput.value = randomRoomId;
    });
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    const joinRoomButton = document.getElementById("joinRoom");
  
    joinRoomButton.addEventListener("click", () => {
      const roomId = document.getElementById("roomId").value;
      const userNameBox = document.getElementById('userName');  
      const userName = userNameBox?.value;
      sessionStorage.setItem('user', userName)
      window.location.href = `/?roomId=${roomId}`;
    });
  });

