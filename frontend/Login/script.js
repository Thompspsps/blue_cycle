

const login = async () => {
    console.log("Funzione login chiamata");

    // Ottieni i valori dai campi email e password
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Verifica se i campi sono vuoti
    if (!email || !password) {
        alert('Entrambi i campi mail e password sono obbligatori.');
        return;
    }

    // Cifra la password usando SHA-512
    const hashedPassword = password;//CryptoJS.SHA512(password).toString();
    console.log("Dati inviati:", JSON.stringify({ email: email, password: hashedPassword }));

    try {
        // Invia la richiesta al server
        console.log("Invio richiesta al server...");
        const response = await fetch('http://127.0.0.1:3000/api/v1/userAuth', {  // Usa http:// se non hai configurato HTTPS
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: hashedPassword })
        });

        console.log("Risposta ricevuta dal server.");

        // Verifica se la risposta è OK
        if (!response.ok) {
            throw new Error(`Errore durante l'autenticazione: ${response.statusText}`);
        }

        // Leggi i dati della risposta
        const dataresp = await response.json();
        console.log("Risposta del server:", dataresp);

        // Controlla se il campo 'data' esiste nella risposta
        if (dataresp.data) {
            // Se c'è il token, salvalo nel localStorage
            if (dataresp.data.token) {
                console.log("Token ricevuto:", dataresp.data.token);
                localStorage.setItem('Token', dataresp.data.token);
            } else {
                console.warn("Il campo 'token' non è presente nella risposta del server.");
            }

            // Se c'è il campo 'self', estrai l'ID utente
            if (dataresp.data.self) {
                const userId = dataresp.data.self.substring(dataresp.data.self.lastIndexOf('/') + 1);
                localStorage.setItem("Id", userId);
                console.log("ID utente:", localStorage.getItem("Id"));
            } else {
                console.warn("Il campo 'self' non è presente nella risposta del server.");
            }
        } else {
            console.warn("Il campo 'data' non è presente nella risposta del server.");
        }

        // Mostra un messaggio di successo e reindirizza
        alert('Login effettuato con successo!');
        window.location.href = '/Home/home.html';

    } catch (error) {
      

    }
}
// Collega la funzione al pulsante di login
document.getElementById('loginButton').addEventListener('click', login);

