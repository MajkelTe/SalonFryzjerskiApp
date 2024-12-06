// Formularz dodawania klientki
document.getElementById("addClientForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("clientName").value;
    const phone = document.getElementById("clientPhone").value;
    const lastVisit = document.getElementById("clientLastVisit").value;
    const comment = document.getElementById("clientComment").value;
    const nextVisit = document.getElementById("clientNextVisit").value;
    const nextComment = document.getElementById("clientNextComment").value;

    addClientToGoogleSheets(name, phone, lastVisit, comment, nextVisit, nextComment);
});

// Funkcja dodająca dane klientki do Google Sheets
function addClientToGoogleSheets(name, phone, lastVisit, comment, nextVisit, nextComment) {
    const sheetId = "18TxZdgLjHohItvOZZhEBtTt4VJG7yTHUiu6ruudDeH4";  // Twój identyfikator arkusza Google Sheets
    const range = "Sheet1!A:F";  // Zakres, w którym zapisujesz dane

    const clientData = [
        [name, phone, lastVisit, comment, nextVisit, nextComment]
    ];

    const params = {
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: "RAW",
        resource: {
            values: clientData
        }
    };

    const request = gapi.client.sheets.spreadsheets.values.append(params);
    request.then((response) => {
        console.log("Klientka dodana:", response);
        alert("Klientka została dodana!");
    }, (error) => {
        console.error("Błąd dodawania klientki:", error);
    });
}

// Wyszukiwanie klientek
document.getElementById("searchButton").addEventListener("click", function () {
    const searchQuery = document.getElementById("searchClient").value.trim();

    if (searchQuery) {
        searchClients(searchQuery);
    }
});

// Funkcja wyszukująca klientki
function searchClients(query) {
    const sheetId = "18TxZdgLjHohItvOZZhEBtTt4VJG7yTHUiu6ruudDeH4";  // Twój identyfikator arkusza Google Sheets
    const range = "Sheet1!A:F";  // Zakres, w którym przeszukujesz dane

    const params = {
        spreadsheetId: sheetId,
        range: range
    };

    const request = gapi.client.sheets.spreadsheets.values.get(params);
    request.then((response) => {
        const clients = response.result.values || [];
        const filteredClients = clients.filter(client => client[0].toLowerCase().includes(query.toLowerCase()) || client[1].includes(query));
        displaySearchResults(filteredClients);
    }, (error) => {
        console.error("Błąd wyszukiwania klientek:", error);
    });
}

// Wyświetlanie wyników wyszukiwania
function displaySearchResults(clients) {
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = ""; // Czyszczenie wyników wyszukiwania

    if (clients.length > 0) {
        clients.forEach(client => {
            const clientDiv = document.createElement("div");
            clientDiv.classList.add("client-item");
            clientDiv.innerHTML = `
                <span>${client[0]} - ${client[1]}</span>
                <button onclick="selectClient('${client[0]}')">Wybierz</button>
            `;
            searchResults.appendChild(clientDiv);
        });
    } else {
        searchResults.innerHTML = "<p>Brak wyników.</p>";
    }
}

// Wybór klientki
function selectClient(clientName) {
    console.log("Wybrano klientkę:", clientName);

    // Przykładowe dane klientki - w rzeczywistości pobierane z Google Sheets
    const client = {
        name: "Anna Kowalska",
        phone: "123456789",
        lastVisit: "2023-12-01",
        nextVisit: "2024-01-15",
        comment: "Wszystko ok",
        nextComment: "Nowa fryzura"
    };

    // Wyświetlenie szczegółów klientki
    displayClientDetails(client);
}

// Wyświetlanie szczegółów klientki
function displayClientDetails(client) {
    const clientDetails = document.getElementById("clientDetails");
    clientDetails.style.display = "block";
    clientDetails.innerHTML = `
        <h3>${client.name} - ${client.phone}</h3>
        <p><strong>Ostatnia wizyta:</strong> ${client.lastVisit}</p>
        <p><strong>Komantarz:</strong> ${client.comment}</p>
        <p><strong>Następna wizyta:</strong> ${client.nextVisit}</p>
        <p><strong>Komantarz:</strong> ${client.nextComment}</p>
        <label for="nextVisitDate">Podaj datę następnej wizyty</label>
        <input type="date" id="nextVisitDate">
        <label for="nextVisitComment">Komentarz</label>
        <textarea id="nextVisitComment"></textarea>
        <button onclick="scheduleNextVisit('${client.name}')">Umów wizytę</button>
    `;
}

// Umówienie wizyty
function scheduleNextVisit(clientName) {
    const nextVisitDate = document.getElementById("nextVisitDate").value;
    const nextVisitComment = document.getElementById("nextVisitComment").value;

    console.log(`Umówiłem wizytę dla ${clientName}: ${nextVisitDate} - ${nextVisitComment}`);

    // Tutaj można zaktualizować dane w Google Sheets
}
