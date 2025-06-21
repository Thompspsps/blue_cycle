// Funzione che estrae il nome dalla email
function getNameFromEmail(email) {
    return email.split('@')[0];
}

// Funzione che effettua una chiamata fetch POST al server locale
async function postData(email, password) {
    const name = getNameFromEmail(email);
    const data = {
        email: email, 
        name: name,
    };

    try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/users', {
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

    postData(email, password);
}

// Aggiunge l'evento di click al bottone "Procedi"
document.getElementById('proceedButton').addEventListener('click', procedi);
