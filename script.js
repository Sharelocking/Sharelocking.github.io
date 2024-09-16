// Variables
let currentFields = [];
let currentPage = 1; // Pagination tracking
const pageSize = 100;  // Default page size

// Password protection
document.getElementById('submitPassword').addEventListener('click', function() {
    const inputPassword = document.getElementById('passwordInput').value;
    const correctPassword = "Amsf@226"; // Set the password
    const passwordError = document.getElementById('passwordError');

    // Check if the password matches
    if (inputPassword === correctPassword) {
        document.getElementById('passwordContainer').classList.add('hidden');
        document.getElementById('searchContainer').classList.remove('hidden');
        passwordError.classList.add('hidden');
    } else {
        passwordError.classList.remove('hidden');  // Show error if password is incorrect
    }
});

// Load the database manifest and populate the dropdown
async function loadDatabases() {
    const response = await fetch('manifest.json');  // Load the manifest file
    const manifest = await response.json();

    const databaseSelect = document.getElementById('databaseSelect');

    // Populate the dropdown with database names
    Object.keys(manifest).forEach(database => {
        const option = document.createElement('option');
        option.value = database;
        option.textContent = database;
        databaseSelect.appendChild(option);
    });

    // Store the manifest for later use
    window.databaseManifest = manifest;
}

// Show "Show All" button when a database is selected and load the field names
document.getElementById('databaseSelect').addEventListener('change', async function() {
    const database = document.getElementById('databaseSelect').value;
    currentPage = 1;  // Reset to page 1 when the database changes

    // Fetch the first file from the selected database to get its fields
    const files = window.databaseManifest[database];
    if (files && files.length > 0) {
        const firstFileResponse = await fetch(files[0]);
        const firstFileData = await firstFileResponse.json();

        // Get field names from the first record in the file
        if (firstFileData.length > 0) {
            const firstRecord = firstFileData[0];
            currentFields = Object.keys(firstRecord);

            // Populate the field dropdown dynamically
            populateFieldsDropdown(currentFields);
        }
    }
});

// Function to populate the fields dropdown
function populateFieldsDropdown(fields) {
    const fieldSelect = document.getElementById('fieldSelect');

    // Clear existing options
    fieldSelect.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a field';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    fieldSelect.appendChild(defaultOption);

    // Populate options with field names
    fields.forEach(field => {
        const option = document.createElement('option');
        option.value = field;
        option.textContent = field;
        fieldSelect.appendChild(option);
    });

    // Show the field dropdown after it's populated
    fieldSelect.classList.remove('hidden');
}

// Function to show the loading spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Function to display the search results dynamically
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';  // Clear previous results

    results.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-item');  // Add a class for styling each result item

        // Dynamically display each key-value pair
        for (const [key, value] of Object.entries(result)) {
            const resultField = document.createElement('p');
            resultField.innerHTML = `<strong>${key}:</strong> ${value}`;
            resultDiv.appendChild(resultField);
        }

        resultsContainer.appendChild(resultDiv);
    });
}

// Function to clear search results and reset the input fields
function clearResults() {
    const resultsContainer = document.getElementById('results');
    const searchInput = document.getElementById('searchInput');
    const exactMatchCheckbox = document.getElementById('exactMatchCheckbox');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Clear the search input field
    searchInput.value = '';

    // Clear the results container
    resultsContainer.innerHTML = '';

    // Hide the "No results found" message
    noResultsMessage.classList.add('hidden');

    // Reset the exact match checkbox
    exactMatchCheckbox.checked = false;

    // Hide the Clear button itself
    document.getElementById('clearButton').classList.add('hidden');
}

// Function to search across multiple JSON files in the selected database
async function searchDatabase() {
    const database = document.getElementById('databaseSelect').value;
    const field = document.getElementById('fieldSelect').value;  // Get the selected field
    const query = document.getElementById('searchInput').value;
    const exactMatch = document.getElementById('exactMatchCheckbox').checked;
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    showLoadingSpinner(); // Show the spinner while searching

    // Get the list of JSON files for the selected database
    const files = window.databaseManifest[database];
    let foundResults = [];

    for (const file of files) {
        const response = await fetch(file);
        const records = await response.json();

        // Search through each record in the file
        records.forEach(record => {
            const recordField = record[field]?.toString().toLowerCase();  // Get the value of the selected field
            const queryStr = query.toLowerCase();

            if (exactMatch) {
                // Exact match search
                if (recordField === queryStr) {
                    foundResults.push(record);
                }
            } else {
                // Partial match search
                if (recordField && recordField.includes(queryStr)) {
                    foundResults.push(record);
                }
            }
        });
    }

    hideLoadingSpinner(); // Hide the spinner after search is complete

    // Display the results
    if (foundResults.length === 0) {
        document.getElementById('noResultsMessage').classList.remove('hidden');
    } else {
        document.getElementById('noResultsMessage').classList.add('hidden');
        displayResults(foundResults);

        // Show the clear button after a search is performed
        document.getElementById('clearButton').classList.remove('hidden');
    }
}

// Attach event listener for the Clear button
document.getElementById('clearButton').addEventListener('click', clearResults);

// Load databases on page load
window.onload = loadDatabases;

// Event listener for search button
document.getElementById('searchButton').addEventListener('click', searchDatabase);

// Trigger search when "Enter" key is pressed
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchDatabase();  // Trigger search when "Enter" key is pressed
    }
});
