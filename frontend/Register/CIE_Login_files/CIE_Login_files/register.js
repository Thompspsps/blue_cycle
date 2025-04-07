// Funzione che estrae il nome dalla email
function getNameFromEmail(email) {
    return email.split('@')[0];
}

// Funzione che effettua una chiamata fetch POST al server locale
async function postData(email, password) {
    const name = getNameFromEmail(email);
    const data = {
        name: name,
        password: password
    };

    try {
        const response = await fetch('http://127.0.0.1:3000', {
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
    } catch (error) {
        console.error('Errore:', error);
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
