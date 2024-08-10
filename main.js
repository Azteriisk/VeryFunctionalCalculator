// Get references to the elements
const calcAnswer = document.querySelector('.calc_answer');
const buttons = document.querySelectorAll('.calc_buttons .button'); // Ensure this targets all number buttons
const operationsContainer = document.querySelector('.operations_container');
const submitButton = document.getElementById('submit');

// Initialize variables to keep track of the current input, last operation, and last result
let currentInput = "";
let lastOperation = "";
let lastOperand = null;
let lastResult = null;
let operationPerformed = false;

// Function to update the display
function updateDisplay(value) {
    if (operationPerformed) {
        currentInput = ""; // Clear input if an operation was just performed
        operationPerformed = false; // Reset operationPerformed flag
    }
    currentInput += value;
    calcAnswer.textContent = currentInput;
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

    } catch (error) {
        calcAnswer.textContent = "Error";
        currentInput = "";
        lastOperation = "";
        lastOperand = null;
        lastResult = null;
    }
}

// Add event listeners to number buttons
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;
        if (!['+', '-', '×', '÷', '='].includes(value)) {
            updateDisplay(value);
        }
    });
});

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

// Add event listener to the submit button
submitButton.addEventListener('click', () => {
    if (currentInput && !operationPerformed) {
        calculate(); // Perform calculation with current input
    } else if (lastResult !== null && lastOperation) {
        calculate(true); // Repeats the last operation if no new input is given
    }
});

// Optional: Clear the display if you add a "C" or "Clear" button
// clearButton.addEventListener('click', () => {
//     currentInput = "";
//     calcAnswer.textContent = "";
// });