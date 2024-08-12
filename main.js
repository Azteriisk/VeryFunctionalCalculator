//-------REFERENCE ELEMENTS-------//
const calcAnswer = document.querySelector('.calc_answer');
const submitButton = document.getElementById('submit');
const darkModeButton = document.getElementById('dark_mode');
const randomizeButton = document.getElementById('randomize_input');
const memLookupButton = document.getElementById('mem_lookup');
const calcScreen = document.querySelector('.calc_screen');
const buttonsContainer = document.querySelector('.calc_buttons');
const buttons = Array.from(buttonsContainer.children);
const numberButtons = document.querySelectorAll('.button_number');
const operationButtons = document.querySelectorAll('.button_operation');
const operationsContainer = document.querySelector('.operations_container');
//const clearButton = document.getElementById('clear_button'); //TODO: make a button with id=clear_button to implement function

//-------INITIALIZE DEFAULT VARIABLES-------//
let currentInput = "";
let lastOperand = null;
let lastOperation = "";
let lastResult = null;
let operationPerformed = false; // Track if an operation has already been performed
let titleUpdated = false; // Track if the title has been updated

//-------START FUNCTION DEFINITONS-------//

// Function to attach event listeners to buttons
function attachButtonListeners() {
    // Re-attach event listeners to number buttons
    numberButtons.forEach(button => {
        button.removeEventListener('click', handleButtonClick); // Ensures no duplicate listeners
        button.addEventListener('click', handleButtonClick);
    });

    // Re-attach event listeners to operation buttons
    operationButtons.forEach(button => {
        button.removeEventListener('click', handleOperationClick); // Ensures no duplicate listeners
        button.addEventListener('click', handleOperationClick);
    });
    
    // Track clicks on equals button / submit / button_large
    submitButton.removeEventListener('click', equalsButton); // Ensures no duplicate listeners
    submitButton.addEventListener('click', equalsButton);

    // Toggle darker mode / dark mode / dark_mode / darkMode on button click
    darkModeButton.removeEventListener('click', darkerModeToggle);
    darkModeButton.addEventListener('click', darkerModeToggle);

    // Track clicks on randomize button / randomize_input
    randomizeButton.addEventListener('click', shuffleButtons);

    // Memory Lookup button prompt
    memLookupButton.addEventListener("click", clickMemoryLookup);

};

// Drag & Drop Memory Lookup Functionality
function enableDragAndDrop() {
    calcScreen.addEventListener('dragstart', (event) => {
    const memoryAddress = event.target.textContent.trim(); // Ensure no extra spaces
    event.dataTransfer.setData('text/plain', memoryAddress);
    });

    memLookupButton.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    memLookupButton.addEventListener('drop', (event) => {
        event.preventDefault();
        const memoryAddress = event.dataTransfer.getData('text/plain');
        performMemoryLookup(memoryAddress);
    });
};

// Track mouse movement for flashlight in darkmode //
function trackMouseMovement() {
    document.body.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('dark-mode-active')) {
            const pointerX = e.clientX + 'px';
            const pointerY = e.clientY + 'px';
    
            document.documentElement.style.setProperty('--pointerX', pointerX);
            document.documentElement.style.setProperty('--pointerY', pointerY);
        }
    });
}

// Handler for number button clicks
function handleButtonClick(event) {
    const value = event.target.textContent;
    updateDisplay(value);
};

// Handler for operation button clicks
function handleOperationClick(event) {
    const operation = event.target.textContent;

    if (operationPerformed) {
        lastOperation = operation;
        lastOperand = parseFloat(currentInput);
        operationPerformed = false;
    } else if (currentInput) {
        if (['+', '-', '*', '/'].includes(currentInput.slice(-1))) {
            // If the last character is an operator, replace it with the new one
            currentInput = currentInput.slice(0, -1);
        } else {
            lastOperand = parseFloat(currentInput.split(/[\+\-\×\÷]/).pop());
        }
    }

    // Now, finally update the display with the operation
    updateDisplay(operation);
    lastOperation = operation;
};

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
};

//Checks and calculations performed on clicking '=' button
function equalsButton() {
    let calcExpression = calcAnswer.textContent;

    try {
        let calcAnswer = eval(calcExpression.replace('×', '*').replace('÷', '/'));
        let pseudoMemoryAddress = generateMemoryAddress(calcAnswer);

        calcScreen.textContent = pseudoMemoryAddress;
        calcScreen.classList.add('memory-address');

        // Change #mem_lookup styling after generating memory address calculation
        const memLookupButton = document.getElementById("mem_lookup");
        memLookupButton.style.borderColor = '#fff';
        memLookupButton.querySelector('img').style.filter = 'invert(100%)';

        // Starts the .title animation on first calculation.
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
};

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
};

// Function to rotate the calculator when "5318008" is detected / boobies func
function checkForEasterEgg() {
    const calcBody = document.querySelector('.calc_body');
    const easterEggNumber = "5318008";
    
    if (calcAnswer.textContent.includes(easterEggNumber)) {
        calcBody.style.transform = "rotate(180deg)";
    } else {
        calcBody.style.transform = "rotate(0deg)";
    }
};

// Toggle for dark mode
function darkerModeToggle() {
    document.body.classList.toggle('dark-mode-active');
}

// Function to shuffle only number buttons
function shuffleButtons() {
    // Shuffle the number buttons array
    for (let i = numberButtons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numberButtons[i], numberButtons[j]] = [numberButtons[j], numberButtons[i]];
    }

    // Re-append the shuffled number buttons back to the container
    numberButtons.forEach(button => buttonsContainer.appendChild(button));

    // Re-attach event listeners after shuffling
    attachButtonListeners();
};

// Generate a fake memory address with given value
function generateMemoryAddress() {
    return "0x" + (Math.random() * 0xFFFFFF | 0).toString(16).padStart(6, '0');
};

function clickMemoryLookup() {
    let address = prompt("Enter the memory address to lookup:");
    if (address) {
    performMemoryLookup(address)
    }
}

// Format memory address input string and check against stored and handle calls to "throbber"
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

function showLoadingThrobber() {
    const throbber = document.getElementById("loading-throbber");
    throbber.classList.remove("hidden"); // Remove the hidden class
    throbber.style.display = 'flex';  // Ensure the throbber is shown
};

function hideLoadingThrobber() {
    const throbber = document.getElementById("loading-throbber");
    throbber.style.display = 'none';  // Hide the throbber
    throbber.classList.add("hidden"); // Reapply the hidden class
};

// Clears calculator text and resets calculation-impacting variables.
function clearFunc() {
    currentInput = "";
    calcScreen.textContent = "";
    operationPerformed = false;
    lastOperand = null;
    lastOperation = "";
    lastResult = null;
};

// Clears generated memory address storage (Not implemented)
//function clearMemory() {
//    if (window.calculatorMemory) {
//        window.calculatorMemory = {};  // Reset the memory storage
//    }
//}

//-------END FUNCTION DEFINITONS-------//

//-------START SEQUENTIAL EXECUTION STEPS-------//

attachButtonListeners();
enableDragAndDrop();
trackMouseMovement();