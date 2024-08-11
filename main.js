// Get references to the elements
const calcAnswer = document.querySelector('.calc_answer');
const buttons = document.querySelectorAll('.calc_buttons .button');
const operationsContainer = document.querySelector('.operations_container');
const submitButton = document.getElementById('submit');
const darkModeButton = document.getElementById('dark_mode');
const randomizeButton = document.getElementById('randomize_input');
const memLookupButton = document.getElementById("mem_lookup");

// Enable drag-and-drop for the .calc_screen div
const calcScreen = document.querySelector('.calc_screen');

calcScreen.setAttribute('draggable', true);

calcScreen.addEventListener('dragstart', function(event) {
    const memoryAddress = event.target.textContent.trim(); // Ensure no extra spaces
    event.dataTransfer.setData('text/plain', memoryAddress);
});

// Initialize variables to keep track of the current input, last operation, and last result
let currentInput = "";
let lastOperation = "";
let lastOperand = null;
let lastResult = null;
let operationPerformed = false;
let titleUpdated = false; // Track if the title has been updated

// Function to rotate the calculator when "5318008" is detected
function checkForEasterEgg() {
    const calcBody = document.querySelector('.calc_body');
    const easterEggNumber = "5318008";
    
    if (calcAnswer.textContent.includes(easterEggNumber)) {
        calcBody.style.transform = "rotate(180deg)";
    } else {
        calcBody.style.transform = "rotate(0deg)";
    }
}

// Function to update the display
function updateDisplay(value) {
    if (operationPerformed) {
        currentInput = ""; // Clear input if an operation was just performed
        operationPerformed = false; // Reset operationPerformed flag
    }
    currentInput += value;
    calcAnswer.textContent = currentInput;
    
    // Check for the easter egg
    checkForEasterEgg();
}

// Function to perform the calculation
function calculate(repeat = false) {
    try {
        if (repeat && lastOperation && lastOperand !== null) {
            // If repeating the last operation, use lastResult as operand1 and lastOperand as operand2
            currentInput = `${lastResult}${lastOperation}${lastOperand}`;
        }

        // Evaluate the current input string
        const result = eval(currentInput.replace(/×/g, '*').replace(/÷/g, '/'));
        calcAnswer.textContent = result;

        // Save the current state for future repeats
        lastResult = result; 
        if (!repeat) {
            lastOperand = parseFloat(currentInput.split(/[\+\-\×\÷]/).pop()); // Save the last number entered
        }
        currentInput = String(result); // Set current input to the result
        operationPerformed = true; // Mark that an operation was performed

        // Check for the easter egg after calculation
        checkForEasterEgg();

    } catch (error) {
        calcAnswer.textContent = "Error";
        currentInput = "";
        lastOperation = "";
        lastOperand = null;
        lastResult = null;
    }
}

// Function to shuffle only numerical buttons
function shuffleButtons() {
    const buttonsContainer = document.querySelector('.calc_buttons');
    const buttons = Array.from(buttonsContainer.children);

    // Filter out the operator buttons
    const numericalButtons = buttons.filter(button => !['add', 'sub', 'mult', 'divi'].includes(button.id));

    // Shuffle the numerical buttons array
    for (let i = numericalButtons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numericalButtons[i], numericalButtons[j]] = [numericalButtons[j], numericalButtons[i]];
    }

    // Re-append the shuffled numerical buttons back to the container
    numericalButtons.forEach(button => buttonsContainer.appendChild(button));

    // Re-attach event listeners after shuffling
    attachButtonListeners();
}

// Function to attach event listeners to buttons
function attachButtonListeners() {
    // Re-attach event listeners to number buttons
    buttons.forEach(button => {
        button.removeEventListener('click', handleButtonClick);
        button.addEventListener('click', handleButtonClick);
    });

    // Re-attach event listeners to operation buttons
    operationsContainer.querySelectorAll('.button_small').forEach(button => {
        button.removeEventListener('click', handleOperationClick);
        button.addEventListener('click', handleOperationClick);
    });
}

// Handler for number button clicks
function handleButtonClick(event) {
    const value = event.target.textContent;
    updateDisplay(value);
}

// Handler for operation button clicks
function handleOperationClick(event) {
    const operation = event.target.textContent;

    // Handle if an operation was just performed
    if (operationPerformed) {
        lastOperation = operation; // Update the last operation to the new one
        lastOperand = parseFloat(currentInput); // Use the current input as the operand
        operationPerformed = false; // Reset the flag to allow continued input
        updateDisplay(operation); // Display the operation after result

    } else if (currentInput && !['+', '-', '*', '/'].includes(currentInput.slice(-1))) {
        lastOperand = parseFloat(currentInput.split(/[\+\-\×\÷]/).pop()); // Save the last number entered
        updateDisplay(operation);
        lastOperation = operation; // Save the operation
    }
}

function performMemoryLookup(memoryAddress) {
    memoryAddress = memoryAddress.trim(); // Ensure no extra spaces
    showLoadingThrobber();

    setTimeout(() => {
        let resultMessage;

        if (window.calculatorMemory && window.calculatorMemory[memoryAddress]) {
            resultMessage = "Value at " + memoryAddress + " is: " + window.calculatorMemory[memoryAddress];
        } else {
            resultMessage = "Invalid memory address or no value stored.";
        }

        alert(resultMessage);
        hideLoadingThrobber();
    }, 800);
};

// Attach initial event listeners
attachButtonListeners();

document.getElementById("mem_lookup").addEventListener("click", function() {
    let address = prompt("Enter the memory address to lookup:");
    if (address) {
        performMemoryLookup(address);
    }
});

memLookupButton.addEventListener('dragover', function(event) {
    event.preventDefault();
});

memLookupButton.addEventListener('drop', function(event) {
    event.preventDefault();
    const memoryAddress = event.dataTransfer.getData('text/plain');
    performMemoryLookup(memoryAddress);
});

// Add event listener to the randomize button
randomizeButton.addEventListener('click', shuffleButtons);

// Add event listeners to operation buttons
operationsContainer.querySelectorAll('.button_small').forEach(button => {
    button.addEventListener('click', () => {
        const operation = button.textContent;

        // Handle if an operation was just performed
        if (operationPerformed) {
            lastOperation = operation; // Update the last operation to the new one
            lastOperand = parseFloat(currentInput); // Use the current input as the operand
            operationPerformed = false; // Reset the flag to allow continued input
            updateDisplay(operation); // Display the operation after result

        } else if (currentInput && !['+', '-', '*', '/'].includes(currentInput.slice(-1))) {
            lastOperand = parseFloat(currentInput.split(/[\+\-\×\÷]/).pop()); // Save the last number entered
            updateDisplay(operation);
            lastOperation = operation; // Save the operation
        }
    });
});

document.getElementById("submit").addEventListener("click", function() {
    const calcScreen = document.querySelector('.calc_answer');
    let calcExpression = calcScreen.textContent;

    try {
        let calcAnswer = eval(calcExpression.replace('×', '*').replace('÷', '/'));
        let pseudoMemoryAddress = generateMemoryAddress(calcAnswer);

        calcScreen.textContent = pseudoMemoryAddress;
        calcScreen.classList.add('memory-address');

        // Change #mem_lookup border and SVG color to white
        const memLookupButton = document.getElementById("mem_lookup");
        memLookupButton.style.borderColor = '#fff';
        memLookupButton.querySelector('img').style.filter = 'invert(100%)';

        // Update the title if it hasn't been updated yet
        if (!titleUpdated) {
            const functionalSpan = document.querySelector('.functional');

            // Add "Dys" element dynamically
            const dysSpan = document.createElement('span');
            dysSpan.classList.add('dys');
            dysSpan.textContent = 'Dys';
            document.querySelector('.title').insertBefore(dysSpan, functionalSpan);

            // Trigger the spreading and descent simultaneously
            functionalSpan.classList.add('spread');
            setTimeout(() => {
                dysSpan.classList.add('reveal-dys');
            }, 10); // Small delay to ensure the transition occurs

            titleUpdated = true; // Prevent further updates
        }

        // Store the answer in memory for lookup
        window.calculatorMemory = window.calculatorMemory || {};
        window.calculatorMemory[pseudoMemoryAddress] = calcAnswer;

    } catch (error) {
        calcScreen.textContent = "Error";
        calcScreen.classList.remove('memory-address');
    }
});

function generateMemoryAddress(value) {
    return "0x" + (Math.random() * 0xFFFFFF | 0).toString(16).padStart(6, '0');
}


// Toggle dark mode on button click
darkModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-active');
});

// Update spotlight position only if dark mode is active
document.body.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('dark-mode-active')) {
        const pointerX = e.clientX + 'px';
        const pointerY = e.clientY + 'px';

        document.documentElement.style.setProperty('--pointerX', pointerX);
        document.documentElement.style.setProperty('--pointerY', pointerY);
    }
});

function showLoadingThrobber() {
    const throbber = document.getElementById("loading-throbber");
    throbber.classList.remove("hidden"); // Remove the hidden class
    throbber.style.display = 'flex';  // Ensure the throbber is shown
}

function hideLoadingThrobber() {
    const throbber = document.getElementById("loading-throbber");
    throbber.style.display = 'none';  // Hide the throbber
    throbber.classList.add("hidden"); // Reapply the hidden class
}


// Optional: Clear the display if we add a "Clear" button
// clearButton.addEventListener('click', () => {
//     currentInput = "";
//     calcAnswer.textContent = "";
// });
