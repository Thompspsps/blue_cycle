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

// Funzione per ottenere la quantità giornaliera raccolta oggi
async function fetchDailyCollected() {
    const token = localStorage.getItem('Token');
    const today = new Date();
   
    
   
    
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
    arrayname = userData.name.split(" ");
    document.getElementById('user-name').textContent = arrayname[0] || 'NomeUtente';
    document.getElementById('user-surname').textContent = arrayname[1] || 'CognomeUtente';
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
        dailyDiv.textContent = dailyDiv.textContent+`${value}`;
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

// Funzione per aprire e chiudere il modale statistiche
document.getElementById('open-stats-modal').addEventListener('click', async function() {
    const modal = document.getElementById('stats-modal');
    const statsContent = document.getElementById('stats-content');
    modal.style.display = 'block';
    statsContent.innerHTML = '<p>Caricamento statistiche...</p>';

    const token = localStorage.getItem('Token');
    const id = localStorage.getItem('Id');
    const today = new Date();
    const dayInt = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    try {
        // Bottiglie totali raccolte
        const totalRes = await fetch(`http://127.0.0.1:3000/api/v1/transactionstions/collected?id=${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const totalData = await totalRes.json();
        const totalBottles = (totalData && totalData.data != null) ? totalData.data : 0;

        // Bottiglie raccolte oggi
        const todayRes = await fetch(`http://127.0.0.1:3000/api/v1/transactionstions/collected?id=${id}&day=${dayInt}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const todayData = await todayRes.json();
        const todayBottles = (todayData && todayData.data != null) ? todayData.data : 0;

        // Tutte le transazioni dell'utente
        const transRes = await fetch(`http://127.0.0.1:3000/api/v1/transactions?id=${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const transData = await transRes.json();
        const transactions = (transData && Array.isArray(transData.data)) ? transData.data : [];

        // Numero totale di transazioni
        const totalTrans = transactions.length;

        // Ultima raccolta
        let lastDate = 'N/A';
        let lastAmount = 'N/A';
        if (transactions.length > 0) {
            // Ordina per data decrescente
            transactions.sort((a, b) => b.date - a.date);
            const last = transactions[0];
            lastDate = new Date(last.date * 1000).toLocaleString();
            lastAmount = last.collected;
        }

        // Media giornaliera raccolta (opzionale)
        let mediaGiornaliera = 0;
        if (transactions.length > 0) {
            // Raggruppa per giorno
            const giorni = {};
            transactions.forEach(tr => {
                const d = new Date(tr.date * 1000);
                const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
                giorni[key] = (giorni[key] || 0) + tr.collected;
            });
            const giorniUnici = Object.keys(giorni).length;
            mediaGiornaliera = giorniUnici > 0 ? (totalBottles / giorniUnici).toFixed(2) : totalBottles;
        }

        statsContent.innerHTML = `
            <p><b>Bottiglie totali raccolte:</b> ${totalBottles}</p>
            <p><b>Bottiglie raccolte oggi:</b> ${todayBottles}</p>
            <p><b>Numero totale di conferimenti:</b> ${totalTrans}</p>
            <p><b>Ultima raccolta:</b> ${lastDate} (${lastAmount} bottiglie)</p>
            <p><b>Media giornaliera raccolta:</b> ${mediaGiornaliera}</p>
        `;
    } catch (err) {
        statsContent.innerHTML = '<p>Impossibile caricare le statistiche.</p>';
    }
});

// Chiudi il modale cliccando sulla X
document.getElementById('close-stats-modal').onclick = function() {
    document.getElementById('stats-modal').style.display = 'none';
};
// Chiudi il modale cliccando fuori dal contenuto
window.onclick = function(event) {
    const modal = document.getElementById('stats-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

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
