//-------REFERENCE ELEMENTS-------//
const calcBody = document.querySelector('.calc_body');
const calcAnswer = document.querySelector('.calc_answer');
const submitButton = document.getElementById('submit');
const darkModeButton = document.getElementById('dark_mode');
const randomizeButton = document.getElementById('randomize_input');
const memLookupButton = document.getElementById('mem_lookup');
const buttonsContainer = document.querySelector('.calc_buttons');
const buttons = Array.from(buttonsContainer.children);
const numberButtons = document.querySelectorAll('.button_number');
const operationButtons = document.querySelectorAll('.button_operation');
const operationsContainer = document.querySelector('.operations_container');
const dragHandle = document.querySelector('.drag_handle');
//const clearButton = document.getElementById('clear_button'); // Did shake to clear instead of a button

//-------INITIALIZE DEFAULT VARIABLES-------//
let currentInput = "";
let lastOperand = null;
let lastOperation = "";
let lastResult = null;
let operationPerformed = false; // Track if an operation has already been performed
let titleUpdated = false; // Track if the title has been updated
let isDragging = false;
let startX, startY, startTime, shakeTimeout;
let moveDistance = 0;
let isShaking = false;
let shakeThresh = 300;

//-------START FUNCTION DEFINITONS-------//

// Function to attach event listeners to buttons
function attachButtonListeners() {
    // Re-attach event listeners to number buttons
    const numberButtons = document.querySelectorAll('.button_number');
    numberButtons.forEach(button => {
        button.removeEventListener('click', handleButtonClick); // Ensures no duplicate listeners
        button.addEventListener('click', handleButtonClick);
    });

    // Re-attach event listeners to operation buttons
    const operationButtons = document.querySelectorAll('.button_operation');
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
    randomizeButton.removeEventListener('click', shuffleButtons);
    randomizeButton.addEventListener('click', shuffleButtons);

    // Memory Lookup button prompt
    memLookupButton.removeEventListener("click", clickMemoryLookup);
    memLookupButton.addEventListener("click", clickMemoryLookup);

};

// Drag & Drop Memory Lookup Functionality
function enableDragAndDrop() {
    calcAnswer.addEventListener('dragstart', (event) => {
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
};

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
function updateDisplay(value = "") {
    // Initialize currentInput if it's undefined or null
    if (currentInput === undefined || currentInput === null) {
        currentInput = "";
    }

    if (operationPerformed) {
        currentInput = ""; // Clear input if an operation was just performed
        operationPerformed = false; // Reset operationPerformed flag
    }

    // Append the new value to currentInput
    currentInput += value;

    // Update the display with the currentInput or default to "0" if it's empty
    calcAnswer.textContent = currentInput || "0";

    // Check for the easter egg
    checkForEasterEgg();
};

// Checks and calculations performed on clicking '=' button
function equalsButton() {
    let calcExpression = calcAnswer.textContent;

    try {
        // Evaluate the expression in calcAnswer
        let result = eval(calcExpression.replace('×', '*').replace('÷', '/'));
        let pseudoMemoryAddress = generateMemoryAddress(result);

        // Update calcAnswer with both the result and memory address
        // calcAnswer.textContent = result; // Shows the real result
        calcAnswer.classList.add('memory-address');
        calcAnswer.textContent = `${pseudoMemoryAddress}`; // Append the memory address

        // Change #mem_lookup styling after generating memory address calculation
        const memLookupButton = document.getElementById("mem_lookup");
        memLookupButton.style.borderColor = '#fff';
        memLookupButton.querySelector('img').style.filter = 'invert(100%)';

        // Start the .title animation on first calculation.
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
        window.calculatorMemory[pseudoMemoryAddress] = result;

    } catch (error) {
        // Handle errors during the calculation
        calcAnswer.textContent = "Error";
        calcAnswer.classList.remove('memory-address');
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
        calcAnswer.textContent = result;  // Update calcAnswer with the result

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
        calcAnswer.textContent = "Error"; // Show error in calcAnswer
        currentInput = "";
        lastOperation = "";
        lastOperand = null;
        lastResult = null;
    }
};

// Function to rotate the calculator when "5318008" is detected / boobies func
function checkForEasterEgg() {
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
};

// Function to shuffle only number buttons
function shuffleButtons() {
    // Shuffle the number buttons array
    for (let i = buttons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
    }

    // Re-append the shuffled number buttons back to the container
    buttons.forEach(button => buttonsContainer.appendChild(button));

    // Re-attach event listeners after shuffling
    attachButtonListeners();
};

// Generate a fake memory address
function generateMemoryAddress() {
    return "0x" + (Math.random() * 0xFFFFFF | 0).toString(16).padStart(6, '0');
};

function clickMemoryLookup() {
    let address = prompt("Enter the memory address to lookup:");
    if (address) {
    performMemoryLookup(address)
    }
};

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

// Hide all the cursors (only used for calc shake rn)
function hideCursors() {
    document.body.classList.add('hide-cursor');
    calcAnswer.classList.add('hide-cursor');
    submitButton.classList.add('hide-cursor');
    dragHandle.classList.add('hide-cursor');
    darkModeButton.classList.add('hide-cursor');
    randomizeButton.classList.add('hide-cursor');
    memLookupButton.classList.add('hide-cursor');
};

function restoreCursors() {
    document.body.classList.remove('hide-cursor');
    calcAnswer.classList.remove('hide-cursor');
    submitButton.classList.remove('hide-cursor');
    dragHandle.classList.remove('hide-cursor');
    darkModeButton.classList.remove('hide-cursor');
    randomizeButton.classList.remove('hide-cursor');
    memLookupButton.classList.remove('hide-cursor');
};

// Handles the calculator grab and shake functions
function calcBodyHandler() {
    function startDrag(e) {
        e.preventDefault();
        if (isShaking) return;  // Prevent dragging if currently shaking
        isDragging = true;
        const event = e.type === 'touchstart' ? e.touches[0] : e;
        startX = event.clientX;
        startY = event.clientY;
        startTime = Date.now();
        moveDistance = 0;
        calcBody.style.transition = 'none'; // Disable transition while dragging
        hideCursors();    
    };

    function onDrag(e) {
        if (!isDragging || isShaking) return;
        e.preventDefault();
        const event = e.type === 'touchmove' ? e.touches[0] : e;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        moveDistance = Math.sqrt(dx * dx + dy * dy); // Calculate the distance

        calcBody.style.transform = `translate(${dx}px, ${dy}px)`;

        if (moveDistance > shakeThresh && !shakeTimeout) {
            isShaking = true;
            shakeTimeout = setTimeout(() => {
                clearFunc(); // Call clearFunc once after shaking
                shakeTimeout = null;
            }, 1500);
        }
    };

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        calcBody.style.transition = 'transform 0.5s ease'; // Re-enable transition
        calcBody.style.transform = 'translate(0, 0)'; // Reset position
        restoreCursors();

        if (!isShaking) {
            clearTimeout(shakeTimeout); // Clear the shake timeout if not shaking
            shakeTimeout = null;
        }

        if (isShaking) {
            // Allow for grabbing and shaking again after the first shake
            setTimeout(() => {
                isShaking = false; // Reset shaking after the operation is complete
            }, 500);
        }
    };

    // Mouse events
    dragHandle.removeEventListener('mousedown', startDrag);
    dragHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    dragHandle.removeEventListener('touchstart', startDrag);
    dragHandle.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', endDrag);

    dragHandle.addEventListener('dragstart', (e) => e.preventDefault());
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
    console.log('clearFunc called');
    operationPerformed = false;
    lastOperand = null;
    lastOperation = "";
    lastResult = null;
    currentInput = "";
    calcAnswer.textContent = ""; // Clear the calculation display
    calcAnswer.classList.remove('memory-address'); // Remove memory address styling
    console.log('calcAnswer.textContent after clearing:', calcAnswer.textContent);
    restoreCursors(); // Restore the cursors in case they are hidden
};

function refreshUI() {
    attachButtonListeners();
    enableDragAndDrop();
    trackMouseMovement();
    calcBodyHandler();
};

// Clears generated memory address storage (Not implemented)
//function clearMemory() {
//    if (window.calculatorMemory) {
//        window.calculatorMemory = {};  // Reset the memory storage
//    }
//}

//-------END FUNCTION DEFINITONS-------//

//-------START SEQUENTIAL EXECUTION STEPS-------//
refreshUI();