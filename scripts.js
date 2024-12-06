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
