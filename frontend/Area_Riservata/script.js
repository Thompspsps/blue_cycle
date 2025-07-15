// Funzione per ottenere i dati dell'utente dall'API
const id = localStorage.getItem("Id");

async function fetchUserData() {
    const token = localStorage.getItem('Token');
    const id = localStorage.getItem('Id');

    if (!token || !id) {
        alert('Token o ID mancante. Effettua nuovamente il login.');
        window.location.href = '/Login/login.html';
        return null;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/users/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data; // Restituisce il campo 'data'
    } catch (error) {
        console.error('Errore durante il fetch dei dati utente:', error);
        return null; // Restituisce null in caso di errore
    }
}

// Funzione per ottenere la quantità giornaliera raccolta oggi
async function fetchDailyCollected() {
    const token = localStorage.getItem('Token');
    const id = localStorage.getItem('Id');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/users/${id}/transactions/collected?day=${today.getTime()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Errore nella richiesta della quantità giornaliera');
        }
        const data = await response.json();
        return data.data; // Il valore numerico della quantità giornaliera
    } catch (error) {
        console.error('Errore durante il fetch della quantità giornaliera:', error);
        return null;
    }
}

// Funzione per inserire i dati dell'utente nei campi appropriati
function populateUserDetails(userData) {
    if (!userData) {
        console.error('I dati utente non sono disponibili.');
        return;
    }
    
    // Debug: mostra la struttura dei dati ricevuti
    console.log('Dati utente ricevuti:', userData);
    console.log('Campo name:', userData.name);
    
    // Gestisce il nome completo dal campo 'name' (es. "Mario Rossi")
    let nome = 'NomeUtente';
    let cognome = 'CognomeUtente';
    
    if (userData.name && typeof userData.name === 'string') {
        const arrayname = userData.name.trim().split(" ");
        console.log('Array nome dopo split:', arrayname);
        
        nome = arrayname[0] || 'NomeUtente';
        // Se ci sono più parti, prende tutto tranne la prima come cognome
        if (arrayname.length > 1) {
            cognome = arrayname.slice(1).join(" ");
        } else {
            // Se c'è solo una parola, la usiamo sia come nome che cognome
            cognome = arrayname[0] || 'CognomeUtente';
        }
    }
    
    console.log('Nome estratto:', nome);
    console.log('Cognome estratto:', cognome);
    
    document.getElementById('user-name').textContent = nome;
    document.getElementById('user-surname').textContent = cognome;
    document.getElementById('user-id').textContent = userData.code || '';
    document.getElementById('user-email').textContent = userData.email || '';
    // Se il punteggio è N/A o falsy, mostra 0
    document.querySelector('.user-score').textContent = (userData.points && userData.points !== 'N/A') ? userData.points : '0';
    document.getElementById('qr-code').textContent = userData.code || '';
}

// Funzione per mostrare la quantità giornaliera nell'area riservata
function showDailyCollected(amount) {
    const dailyDiv = document.getElementById('daily-collected');
    // Se amount è N/A, null, undefined o falsy, mostra 0
    const value = (amount !== null && amount !== undefined && amount !== 'N/A') ? amount : '0';
    if (dailyDiv) {
        dailyDiv.textContent = `Quantità raccolta oggi: ${value}`;
    }
}

// Funzione per generare il codice QR
function generateQRCode(userId) {
    const qrCodeElement = document.getElementById('qrcode');
    qrCodeElement.innerHTML = '';
    new QRCode(qrCodeElement, userId);
}

// Funzione per mostrare o nascondere il QR Code
function toggleQRCodeVisibility(userId) {
    const qrCodeElement = document.getElementById('qrcode');
    const toggleButton = document.getElementById('show-code');

    if (qrCodeElement.style.display === 'none' || qrCodeElement.style.display === '') {
        generateQRCode(userId); // Genera il codice QR quando viene mostrato
        qrCodeElement.style.display = 'block';
        toggleButton.textContent = 'Nascondi QR Code';
    } else {
        qrCodeElement.style.display = 'none';
        toggleButton.textContent = 'Mostra QR Code';
    }
}

// Funzione per gestire il logout
document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('Token'); // Rimuove anche il Token utilizzato per l'autenticazione
    localStorage.removeItem('Id'); // Rimuove anche l'Id dell'utente
    alert('Logout effettuato!');
    window.location.href = '/Login/login.html'; // Reindirizza alla pagina di login o una pagina a scelta
});

// Funzione principale per eseguire il tutto
async function main() {
    const userData = await fetchUserData();
    if (userData && userData.code) {
        populateUserDetails(userData);
        document.getElementById('show-code').addEventListener('click', function() {
            toggleQRCodeVisibility(userData.code);
        });

        // Ottieni e mostra la quantità giornaliera raccolta oggi
        const dailyAmount = await fetchDailyCollected();
        showDailyCollected(dailyAmount);

    } else {
        console.error('I dati utente non sono validi.');
    }
}

// Eseguire la funzione principale all'avvio
main();
