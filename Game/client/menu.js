function newGame() {
    window.location.href = './game.html';
}

function toggle(nameOn, nameTo) {
    document.getElementById(nameOn).style.display = "none";
    document.getElementById(nameTo).style.display = "flex";
}

// Function to handle key press event
function handleKeyPress(event) {
    event.preventDefault(); // Prevent default behavior of the pressed key
    const key = event.key; // Get the pressed key

    // Set the value of the input field with the pressed key
    document.activeElement.value = key;
    document.activeElement.blur(); // Remove focus from the input field
}

// Add event listeners to the change control buttons
document.getElementById('changeLeftControl').addEventListener('click', function() {
    document.getElementById('leftControl').focus(); // Focus on the left control input field
});

document.getElementById('changeRightControl').addEventListener('click', function() {
    document.getElementById('rightControl').focus(); // Focus on the right control input field
});

// Add event listener for key press to capture new control
document.querySelectorAll('.controlInput').forEach(function(input) {
    input.addEventListener('keydown', handleKeyPress);
});

document.getElementById('saveButton').addEventListener('click', function() {
    // Get selected controls
    var leftControl = document.getElementById('leftControl').value;
    var rightControl = document.getElementById('rightControl').value;

    // Store controls in local storage
    localStorage.setItem('leftControl', leftControl);
    localStorage.setItem('rightControl', rightControl);

    toggle('controls', 'menu')
});
