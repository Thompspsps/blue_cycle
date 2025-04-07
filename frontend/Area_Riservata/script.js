// Funzione per ottenere i dati dell'utente dall'API
const id = localStorage.getItem("Id");

async function fetchUserData() {
    const token = localStorage.getItem('Token'); // Ottieni il token dal localStorage
    try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/users/' + id, {
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

// Funzione per inserire i dati dell'utente nei campi appropriati
function populateUserDetails(userData) {
    if (!userData) {
        console.error('I dati utente non sono disponibili.');
        return;
    }

    document.getElementById('user-name').textContent = userData.name || 'NomeUtente';
    document.getElementById('user-id').textContent = userData.code || ''; // Utilizza 'code' al posto di 'id'
    document.getElementById('user-email').textContent = userData.email || '';
    document.querySelector('.user-score').textContent = 'Punteggio: ' + (userData.points || 'N/A');
    document.getElementById('qr-code').textContent = userData.code || ''; // Visualizza il codice all'inizio
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
    } else {
        console.error('I dati utente non sono validi.');
    }
}

// Eseguire la funzione principale all'avvio
main();
