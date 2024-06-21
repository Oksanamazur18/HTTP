// Getting age for the user
function getAge(birthday) {
    // Converts a date of birth from a string in the format "YYYY-MM-DD" or similar to a Date object
    const birthDate = new Date(birthday);

    // Calculates the difference in milliseconds between the current time and the date of birth
    const ageDiffMs = Date.now() - birthDate.getTime();

    // Create a new Date object with this difference
    const ageDate = new Date(ageDiffMs);

// Calculation of the number of full years. We use the year 1970, because the Date object uses the Unix Epoch (January 1, 1970)
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Getting of color of a product
function getColorLabel(colorCode) {
    return `<div style="width: 20px; height: 20px; background-color: ${colorCode};" title="${colorCode}"></div>`;
}

// Getting the data from url and drawing table
function DataTable(config) {
    fetch(config.apiUrl)
        .then(response => {
            // We check the status of the response
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // We return the object from JSON
            return response.json();
        })
        .then(data => {
            drawTable(config, data);
        })
        .catch(error => {
            // We process errors
            console.error('There was a problem with the fetch operation:', error);
        });

}

// Delete an item we choose
function deleteItem(event, config) {
    //receives the button from the event and among its id attributes, then sends the request
    const button = event.target;
    const id = button.getAttribute('data-id');
    const url = `${config.apiUrl}/${id}`;
    console.log(`deleting item ${url}`);
    fetch(url, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Product deleted:', data);
            // After deleting the product, we  reload the table
            DataTable(config);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}



// Drawing table.
function drawTable(config, data) {
    const keysArr = Object.keys(data.data);
    let key = "5";
    // creation and adding of table
    document.querySelector(config.parent).innerHTML = "";
    const buttonAdd = document.createElement("button");
    buttonAdd.className = "btn-add"
    buttonAdd.innerText = "Додати";
    buttonAdd.onclick = function () {
        showModal(config)
    }
    document.querySelector(config.parent).appendChild(buttonAdd);
    let table = document.createElement("table");
    document.querySelector(config.parent).appendChild(table);

    // creation and adding of the first line of table
    let firstLine = document.createElement("tr");
    table.appendChild(firstLine);

    //creation and adding of the column for number
    let th = document.createElement("th");
    th.innerHTML = "№";
    firstLine.appendChild(th);

    //creation and adding of the other columns
    for (const column of config.columns) {
        let thHead = document.createElement("th");
        thHead.innerHTML = column.title;
        firstLine.appendChild(thHead);
    }
    let thAction = document.createElement("th");
    thAction.innerHTML = "Дії";
    firstLine.appendChild(thAction);
    if (config.apiUrl) {
        //creation and adding of the table content
        for (let i = 0; i < keysArr.length; i++) {
            let tr = document.createElement("tr");
            table.appendChild(tr);
            let number = document.createElement("td");
            number.innerHTML = i + 1;
            tr.appendChild(number);
            for (const column of config.columns) {
                let td = document.createElement("td");
                let value = typeof column.value === "function" ? column.value(data.data[keysArr[i]]) : data.data[keysArr[i]][column.value];
                td.innerHTML = value;
                tr.appendChild(td);
            }
// adding a button for deleting
            const deleteCol = document.createElement("td");
            let button = document.createElement("button");
            button.textContent = 'Видалити';
            button.className = "del-btn";
            button.setAttribute('data-id', keysArr[i]);
            deleteCol.appendChild(button);
            tr.appendChild(deleteCol);
            button.onclick = function (event) {
                deleteItem(event, config);
            };
// adding a button for edition
            const editCol = document.createElement("td");
            const buttonEdit = document.createElement("button");
            buttonEdit.textContent = "Pедгувати";
            buttonEdit.className = "btn-edit";
            buttonEdit.setAttribute('data-id', keysArr[i]);
            editCol.appendChild(buttonEdit);
            tr.appendChild(editCol);
            buttonEdit.onclick = function (event) {
                editItem(event, config);
            }
        }
    }
}

// Showing modal window for adding new notation.
function showModal(config) {
    const modal = document.getElementById("modal");
    modal.style.display = "block";
    modal.innerHTML = ""; // Clearing previous content
    for (const column of config.columns) {
        const div = document.createElement("div");

        if (Array.isArray(column.input)) {
            for (let i = 0; i < column.input.length; i++) {
                const inputConfig = column.input[i];
                let input;
                if (inputConfig.type == 'select') {
                    input = document.createElement("select");
                    input.name = inputConfig.name || column.value;
                    input.required = inputConfig.required !== false;
                    for (const option of inputConfig.options) {
                        const selectOption = document.createElement("option");
                        selectOption.value = option;
                        selectOption.textContent = option;
                        input.appendChild(selectOption);
                    }
                    if (inputConfig.label) {
                        const label = document.createElement("label");
                        label.textContent = inputConfig.label;
                        label.htmlFor = input.name;
                        div.appendChild(label);
                    }

                } else {
                    input = document.createElement("input");
                    input.type = inputConfig.type || "text";
                    input.name = inputConfig.name || column.value;
                    input.required = inputConfig.required !== false; // All fields are required unless otherwise specified
                    if (inputConfig.label) {
                        const label = document.createElement("label");
                        label.textContent = inputConfig.label;
                        label.htmlFor = input.name;
                        div.appendChild(label);
                    }
                }

                div.appendChild(input);
            }
        } else if (typeof column.input === "object") {
            const input = document.createElement("input");
            input.type = column.input.type || "text";
            input.name = column.input.name || column.value;
            input.required = column.input.required !== false; // All fields are required unless otherwise specified
            const label = document.createElement("label");
            label.textContent = column.input.label || column.title;
            label.htmlFor = input.name;
            div.appendChild(label);
            div.appendChild(input);
        }
        modal.appendChild(div);
    }
    // Adding a button to close the modal window
    const closeButton = document.createElement("button");
    closeButton.textContent = "Закрити";
    closeButton.onclick = () => {
        modal.style.display = "none";
    };
    modal.appendChild(closeButton);
    const inputs = modal.querySelectorAll("input, select");
    inputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                    saveData();
            }
        });
    })


// Making data from inputs and sending the request for adding it's to table
    function saveData() {
        let valid = true;
        const data = {};
        inputs.forEach(input => {
            if (input.required && !input.value) {
                input.style.border = "2px solid red";
                valid = false;
            } else {
                input.style.border = "";
                if (input.type === "number") {
                    data[input.name] = +input.value;
                } else {
                    data[input.name] = input.value;
                }
            }
        });
        console.log('Дані для відправки:', data);
        if (valid) {
            fetch(config.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Відповідь сервера не є валідною');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Успішно:', data);
                    modal.style.display = "none";
                    DataTable(config); // Updating the table after adding a new record
                })
                .catch(error => {
                    console.error('Виникла проблема з операцією fetch:', error);
                });
        }
    }
}

// All functions for edition of the element of table.
function editItem(event, config ){
    const button = event.target;
    const id = button.getAttribute('data-id');
    const url = `${config.apiUrl}/${id}`;
    const data = {};
    const modal = document.getElementById("modalEdit");
    modal.style.display = "block";

    fetch(config.apiUrl)
        .then(response => {
            // We check the status of the response
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // We return the object from JSON
            return response.json();
        })
        .then(line => {
        modal.innerHTML = ""; // Clearing previous content
        for (const column of config.columns) {
            const div = document.createElement("div");
            if (Array.isArray(column.input)) {
                for (let i = 0; i < column.input.length; i++) {
                    const inputConfig = column.input[i];
                    let input;
                    if (inputConfig.type == 'select') {
                        input = document.createElement("select");
                        input.name = inputConfig.name || column.value;
                        input.value = line.data[id][input.name];
                        input.required = inputConfig.required !== false;
                        for (const option of inputConfig.options) {
                            const selectOption = document.createElement("option");
                            selectOption.value = option;
                            selectOption.textContent = option;
                            input.appendChild(selectOption);
                        }
                        if (inputConfig.label) {
                            const label = document.createElement("label");
                            label.textContent = inputConfig.label;
                            label.htmlFor = input.name;
                            div.appendChild(label);
                        }
        
                    } else {
                        input = document.createElement("input");
                        input.type = inputConfig.type || "text";
                        input.name = inputConfig.name || column.value;
                        console.log(line.data[id][input.name]);
                        input.value = line.data[id][input.name];
                        input.required = inputConfig.required !== false;
                        if (inputConfig.label) {
                            const label = document.createElement("label");
                            label.textContent = inputConfig.label;
                            label.htmlFor = input.name;
                            div.appendChild(label);
                        }
                    }
        
                    div.appendChild(input);
                }
            } else if (typeof column.input === "object") {
                const input = document.createElement("input");
                input.type = column.input.type || "text";
                input.name = column.input.name || column.value;
                input.value = line.data[id][input.name];
                input.required = column.input.required !== false; 
        
                const label = document.createElement("label");
                label.textContent = column.input.label || column.title;
                label.htmlFor = input.name;
                div.appendChild(label);
                div.appendChild(input);
            }
            modal.appendChild(div);
        }
        // Adding a button to close the modal window
        const closeButton = document.createElement("button");
        closeButton.textContent = "Закрити";
        closeButton.onclick = () => {
            modal.style.display = "none";
        };
        modal.appendChild(closeButton);
        const inputs = modal.querySelectorAll("input, select");
        inputs.forEach(input => {
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                        editData(inputs);
                }
            });
        })
        })
        .catch(error => {
            // We process errors
            console.error('There was a problem with the fetch operation:', error);
        });
    
// Getting new information from inputs and change the table.
  function editData(inputs){
    inputs.forEach(input => {
            if (input.type === "number") {
                data[input.name] = +input.value;
            } else {
                data[input.name] = input.value;
            }
    });
    fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Відповідь сервера не є валідною');
            }
            return response.json();
        })
        .then(data => {
            console.log('Успішно:', data);
            modal.style.display = "none";
            DataTable(config); // Updating the table after adding a new record
        })
        .catch(error => {
            console.error('Виникла проблема з операцією fetch:', error);
        });
    }
}


const config1 = {
    parent: '#usersTable',
    columns: [
        { title: 'Ім’я', value: 'name' },
        { title: 'Прізвище', value: 'surname' },
        { title: 'Вік', value: (user) => getAge(user.birthday) },
        { title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>` }
    ],
    apiUrl: "https://mock-api.shpp.me/<omazur>/users"
};

const users = [
    { id: 30050, name: 'Вася', surname: 'Петров', age: 12 },
    { id: 30051, name: 'Вася', surname: 'Васечкін', age: 15 },
];



DataTable(config1);

const config2 = {
    parent: '#productsTable',
    columns: [
        {
            title: 'Назва',
            value: 'title',
            input: { type: 'text' }
        },
        {
            title: 'Ціна',
            value: (product) => `${product.price} ${product.currency}`,
            input: [
                { type: 'number', name: 'price', label: 'Ціна' },
                { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
            ]
        },
        {
            title: 'Колір',
            value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
            input: { type: 'color', name: 'color' }
        },
    ],
    apiUrl: "https://mock-api.shpp.me/<omazur>/products"
};

// const config2 = {
//     parent: '#productsTable',
//     columns: [
//         { title: 'Назва', value: 'title' },
//         { title: 'Ціна', value: (product) => `${product.price} ${product.currency}` },
//         { title: 'Колір', value: (product) => getColorLabel(product.color) }, 
//     ],
//     apiUrl: "https://mock-api.shpp.me/<omazur>/products"
// };

DataTable(config2);

