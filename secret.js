function checkPassword() {
  var pass = document.getElementById("password").value;
  var message = document.getElementById("message");
  // Array of funny messages for wrong password attempts
  var wrongMessages = [
      "That's not it! Try harder, Jedi.",
      "Nope, the dark side laughs at your effort.",
      "Incorrect – your journey has just begun.",
      "Wrong! Perhaps Yoda can help you?"
  ];
  
  if(pass.toLowerCase() === "theforce") {
      message.textContent = "Access granted! May the Force be with you.";
      // Redirect after a short delay
      setTimeout(function(){
        window.location.href = "exclusive.html";
      }, 2000);
  } else {
      var randomIndex = Math.floor(Math.random() * wrongMessages.length);
      message.textContent = wrongMessages[randomIndex];
  }
}