// Carica gli utenti dal file nome.json
let cieUsers = [];

// Carica gli utenti CIE all'avvio
async function loadCIEUsers() {
    try {
        const response = await fetch('./nome.json');
        cieUsers = await response.json();
        console.log('Utenti CIE caricati:', cieUsers.length);
    } catch (error) {
        console.error('Errore nel caricamento degli utenti CIE:', error);
    }
}

// Simula l'autenticazione CIE
function simulateCIEAuth(email, password) {
    const user = cieUsers.find(u => u.email === email && u.password === password);
    if (user) {
        return {
            success: true,
            message: 'Autenticazione CIE riuscita',
            user: user
        };
    }
    return {
        success: false,
        message: 'Credenziali CIE non valide'
    };
}

// Funzione che effettua una chiamata fetch POST al server locale
async function postData(email, password, user) {
    const data = {
        email: email, 
        name: `${user.nome} ${user.cognome}`
    };

    try {
        const response = await fetch('http://127.0.0.1.3000/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Errore nella risposta del server: ' + response.status);
        }

        const responseData = await response.json();
        console.log('Risposta del server:', responseData);

        // Notifica e redirect se la registrazione va a buon fine
        alert('Registrazione avvenuta con successo! La password ti è stata inviata via email.');
        window.location.href = '/Login/login.html';
    } catch (error) {
        console.error('Errore:', error);
        alert('Registrazione fallita. Riprova.');
    }
}

// Funzione che viene chiamata quando si preme il bottone "Procedi"
function procedi() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === '' || password === '') {
        alert('Per favore, compila entrambi i campi email e password.');
        return;
    }

    // Simula prima l'autenticazione CIE
    const cieAuth = simulateCIEAuth(email, password);
    
    if (cieAuth.success) {
        alert('Autenticazione CIE riuscita! Procedo con la registrazione nel sistema BlueCycle.');
        postData(email, password, cieAuth.user);
    } else {
        alert('Errore CIE: ' + cieAuth.message + '\nVerifica le credenziali CIE e riprova.');
    }
}

// Aggiunge l'evento di click al bottone "Procedi"
document.getElementById('proceedButton').addEventListener('click', procedi);

// Carica gli utenti CIE all'avvio della pagina
document.addEventListener('DOMContentLoaded', loadCIEUsers);
