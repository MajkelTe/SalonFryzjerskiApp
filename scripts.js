// Tablica przechowująca dane klientek
const clients = [];

// Inicjalizacja API Google Sheets
function initGoogleAPI() {
    gapi.load('client:auth2', initClient);
}

// Inicjalizacja klienta API Google
function initClient() {
    gapi.client.init({
        apiKey: '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', // Wstaw swój klucz API
        clientId: '301662730843-if00lpg5jhs2llb6slm2ifm4rvnhiph5.apps.googleusercontent.com', // Wstaw swój Client ID
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(() => {
        console.log("Google API zainicjowane.");
    });
}

// Funkcja do zapisywania danych do Google Sheets
function saveClientToGoogleSheets(client) {
    const spreadsheetId = '18TxZdgLjHohItvOZZhEBtTt4VJG7yTHUiu6ruudDeH4'; // Wstaw ID swojego arkusza Google
    const range = 'A2:F2'; // Zakres komórek, gdzie zapisujemy dane

    const valueRange = {
        majorDimension: 'ROWS',
        values: [
            [client.name, client.phoneNumber, client.visits[0].date, client.visits[0].time, client.visits[0].comment]
        ]
    };

    const request = gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: valueRange
    });

    request.then((response) => {
        console.log("Dane zapisane do Google Sheets:", response);
    }, (error) => {
        console.error("Błąd zapisu do Google Sheets:", error);
    });
}

// Funkcja do zaczytywania danych z Google Sheets
function loadClientsFromGoogleSheets() {
    const spreadsheetId = '18TxZdgLjHohItvOZZhEBtTt4VJG7yTHUiu6ruudDeH4'; // Wstaw ID swojego arkusza Google
    const range = 'A2:F'; // Zakres komórek, z którego pobieramy dane

    const request = gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
    });

    request.then((response) => {
        const rows = response.result.values;
        if (rows.length) {
            rows.forEach((row) => {
                const client = {
                    name: row[0],
                    phoneNumber: row[1],
                    visits: [{ date: row[2], time: row[3], comment: row[4] }]
                };
                clients.push(client);
            });
            console.log("Dane załadowane z Google Sheets:", clients);
            displayUpcomingAppointments(); // Po załadowaniu klientów, odświeżamy listę zaplanowanych wizyt
        } else {
            console.log("Brak danych w arkuszu.");
        }
    }, (error) => {
        console.error("Błąd podczas wczytywania danych z Google Sheets:", error);
    });
}

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
        visits: [{ date: visitDate, time: visitTime, comment: comment }]
    };

    // Dodanie klientki do bazy (tablica)
    clients.push(newClient);
    alert('Klientka została dodana do bazy!');

    // Zapisanie nowej klientki do Google Sheets
    saveClientToGoogleSheets(newClient);

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

// Ładowanie danych z Google Sheets przy starcie aplikacji
loadClientsFromGoogleSheets();

// Załadowanie Google API
initGoogleAPI();
