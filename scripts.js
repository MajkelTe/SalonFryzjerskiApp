// Tablica przechowująca dane klientek
const clients = [];

// Funkcja do dodawania nowej klientki
document.getElementById('addClientForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Pobranie wartości z formularza
    const clientName = document.getElementById('clientName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const visitDate = document.getElementById('visitDate').value.trim();
    const visitTime = document.getElementById('visitTime').value.trim();
    const comment = document.getElementById('comment').value.trim();

    // Sprawdzanie, czy numer telefonu już istnieje
    if (clients.some(client => client.phoneNumber === phoneNumber)) {
        alert('Ten numer telefonu już istnieje w bazie!');
        return;
    }

    // Tworzenie nowej klientki
    const newClient = {
        name: clientName,
        phoneNumber: phoneNumber,
        visits: [{ date: visitDate, time: visitTime, comment: comment }],
    };

    // Dodanie klientki do bazy
    clients.push(newClient);
    alert('Klientka została dodana do bazy!');
    document.getElementById('addClientForm').reset();
    
    // Po dodaniu nowej klientki, odświeżamy tabelę zaplanowanych wizyt
    displayUpcomingAppointments();
});

// Funkcja do wyszukiwania klientek
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    const results = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery) ||
        client.phoneNumber.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
    );

    const searchResultsTable = document.getElementById('searchResults');
    const tbody = searchResultsTable.querySelector('tbody');
    tbody.innerHTML = ''; // Czyszczenie tabeli wyników

    if (results.length === 0) {
        alert('Brak wyników');
        return;
    }

    // Wyświetlanie wyników wyszukiwania
    results.forEach((client, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.phoneNumber}</td>
            <td><button onclick="selectClient(${index})">Wybierz</button></td>
        `;
        tbody.appendChild(row);
    });

    // Pokazanie tabeli wyników wyszukiwania
    searchResultsTable.classList.remove('hidden');
});

// Funkcja do wybierania klientki
function selectClient(index) {
    const client = clients[index];

    // Wyświetlanie danych klientki
    document.getElementById('clientInfo').innerHTML = `
        <strong>Imię i Nazwisko:</strong> ${client.name} <br>
        <strong>Numer telefonu:</strong> ${client.phoneNumber} <br>
    `;

    // Wyświetlanie historii wizyt
    const visitHistoryTable = document.getElementById('visitHistory');
    const tbody = visitHistoryTable.querySelector('tbody');
    tbody.innerHTML = ''; // Czyszczenie historii wizyt

    client.visits.forEach(visit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${visit.date}</td>
            <td>${visit.comment}</td>
        `;
        tbody.appendChild(row);
    });

    // Pokazanie szczegółów klientki
    document.getElementById('clientDetails').classList.remove('hidden');
    
    // Przypisanie funkcji do przycisku "Umów wizytę"
    document.getElementById('scheduleBtn').onclick = function() {
        scheduleVisit(index);
    };
}

// Funkcja do umawiania wizyty
function scheduleVisit(clientIndex) {
    const client = clients[clientIndex];
    const nextVisitDate = prompt('Podaj datę następnej wizyty (format: YYYY-MM-DD):');
    const nextVisitComment = prompt('Podaj komentarz do wizyty:');

    if (nextVisitDate && nextVisitComment) {
        // Dodanie nowej wizyty do historii klientki
        client.visits.push({ date: nextVisitDate, comment: nextVisitComment });
        alert('Wizyta została zaplanowana!');

        // Po zapisaniu wizyty, aktualizujemy tabelę wizyt zaplanowanych na najbliższe 7 dni
        displayUpcomingAppointments();

        // Aktualizacja historii wizyt
        const visitHistoryTable = document.getElementById('visitHistory');
        const tbody = visitHistoryTable.querySelector('tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nextVisitDate}</td>
            <td>${nextVisitComment}</td>
        `;
        tbody.appendChild(row);
    }
}

// Funkcja do wyświetlania zaplanowanych wizyt na najbliższe 7 dni
function displayUpcomingAppointments() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    const tbody = appointmentsTable.querySelector('tbody');
    tbody.innerHTML = ''; // Czyszczenie tabeli

    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    // Konfiguracja Google API
const CLIENT_ID = 'YOUR_CLIENT_ID';
const API_KEY = 'YOUR_API_KEY';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

// Inicjalizacja Google API
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPE,
    }).then(() => {
        console.log("Google API client initialized.");
        // Sprawdzenie, czy użytkownik jest zalogowany
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

// Zaloguj się do Google
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Zaloguj użytkownika
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // Jeśli zalogowany, załaduj dane
        fetchDataFromGoogleSheets();
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}
  // Pobierz dane z Google Sheets
function fetchDataFromGoogleSheets() {
    const range = 'Sheet1!A2:F';  // Zakres danych (od wiersza 2, kolumny A-F)
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range
    }).then(response => {
        const data = response.result.values;
        const clients = data.map(row => ({
            name: row[0],
            phone: row[1],
            lastVisit: row[2],
            comment: row[3],
            nextVisit: row[4],
            nextComment: row[5]
        }));
        displayClients(clients); // Funkcja do wyświetlania danych
    });
}

// Funkcja wyświetlania klientów
function displayClients(clients) {
    const resultsTable = document.getElementById("resultsTable");
    resultsTable.innerHTML = ""; // Wyczyść tabelę przed dodaniem nowych danych
    clients.forEach(client => {
        const row = resultsTable.insertRow();
        row.insertCell(0).textContent = client.name;
        row.insertCell(1).textContent = client.phone;
        row.insertCell(2).textContent = client.lastVisit;
        row.insertCell(3).textContent = client.comment;
        row.insertCell(4).textContent = client.nextVisit;
        row.insertCell(5).textContent = client.nextComment;
        const selectCell = row.insertCell(6);
        const selectButton = document.createElement("button");
        selectButton.textContent = "Wybierz";
        selectButton.onclick = () => selectClient(client);
        selectCell.appendChild(selectButton);
    });
}
  // Dodaj klientkę do Google Sheets
function addClientToGoogleSheets(name, phone, lastVisit, comment, nextVisit, nextComment) {
    const range = 'Sheet1!A2:F2';  // Zakres, w którym będą zapisywane dane
    const values = [
        [name, phone, lastVisit, comment, nextVisit, nextComment]
    ];
    const body = {
        values: values
    };
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: "RAW",
        resource: body
    }).then((response) => {
        console.log('Dane zostały dodane do Google Sheets');
        fetchDataFromGoogleSheets(); // Ponowne załadowanie danych po dodaniu
    });
}
    
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
    
    // Pobieranie zaplanowanych wizyt w ciągu najbliższych 7 dni
    clients.forEach(client => {
        client.visits.forEach(visit => {
            const visitDate = new Date(visit.date);
            if (visitDate >= today && visitDate <= sevenDaysLater) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${client.name}</td>
                    <td>${visit.date}</td>
                    <td>${visit.time || 'Brak godziny'}</td>
                `;
                tbody.appendChild(row);
            }
        });
    });
}

// Wywołanie funkcji do wyświetlania zaplanowanych wizyt
displayUpcomingAppointments();
