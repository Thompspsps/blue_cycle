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
    const hashedPassword = password; //CryptoJS.SHA512(password).toString();
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

                // Verifica se la password è temporanea
                await checkTemporaryPassword(userId, password);
            } else {
                console.warn("Il campo 'self' non è presente nella risposta del server.");
            }
        } else {
            console.warn("Il campo 'data' non è presente nella risposta del server.");
        }

    } catch (error) {
        console.error("Errore durante il login:", error);
        alert('Errore durante il login. Controlla le credenziali e riprova.');
    }
};

// Funzione per verificare se la password è temporanea
const checkTemporaryPassword = async (userId, oldPassword) => {
    console.log("Verifica se la password è temporanea...");

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('Token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Errore durante la verifica della password temporanea: ${response.statusText}`);
        }

        const userData = await response.json();
        console.log("Dati utente ricevuti:", userData);

        if (userData.data.password.temporary) {
            alert('La tua password è temporanea. Devi cambiarla per continuare.');
            showChangePasswordModal(userId, oldPassword);
        } else {
            console.log("La password non è temporanea. Accesso consentito.");
            alert('Login effettuato con successo!');
            window.location.href = '/Home/home.html';
        }
    } catch (error) {
        console.error("Errore durante la verifica della password temporanea:", error);
        alert('Errore durante la verifica della password. Riprova più tardi.');
    }
};

// Mostra la finestra modale per il cambio della password
const showChangePasswordModal = (userId, oldPassword) => {
    const changePasswordModal = document.getElementById('changePasswordModal');
    const closeModalButton = changePasswordModal.querySelector('.close');
    const savePasswordButton = document.getElementById('savePasswordButton');
    const newPasswordInput = document.getElementById('newPassword');

    changePasswordModal.style.display = 'block';

    // Chiudi la finestra modale
    closeModalButton.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) {
            changePasswordModal.style.display = 'none';
        }
    });

    // Salva la nuova password
    savePasswordButton.addEventListener('click', async () => {
        const newPassword = newPasswordInput.value.trim();
        if (!newPassword) {
            alert('Per favore, inserisci una nuova password.');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:3000/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('Token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            if (response.ok) {
                alert('Password cambiata con successo. Effettua nuovamente il login.');
                changePasswordModal.style.display = 'none';
                window.location.href = '/Login/login.html';
            } else {
                const errorData = await response.json();
                alert(`Errore: ${errorData.message || 'Impossibile cambiare la password.'}`);
            }
        } catch (error) {
            console.error('Errore durante il cambio della password:', error);
            alert('Si è verificato un errore. Riprova più tardi.');
        }
    });
};

// Collega la funzione al pulsante di login
document.getElementById('loginButton').addEventListener('click', login);
 
document.addEventListener("DOMContentLoaded", () => {
    const resetPasswordLink = document.getElementById('resetPasswordLink');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const closeModalButton = resetPasswordModal.querySelector('.close');
    const sendResetEmailButton = document.getElementById('sendResetEmailButton');
    const resetEmailInput = document.getElementById('resetEmail');

    // Mostra la finestra modale
    resetPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetPasswordModal.style.display = 'block';
    });

    // Chiudi la finestra modale
    closeModalButton.addEventListener('click', () => {
        resetPasswordModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === resetPasswordModal) {
            resetPasswordModal.style.display = 'none';
        }
    });

    // Invia la richiesta POST per il reset della password
    sendResetEmailButton.addEventListener('click', async () => {
        const email = resetEmailInput.value.trim();
        if (!email) {
            alert('Per favore, inserisci un indirizzo email valido.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/v1/forgotPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert('Email per il reset della password inviata con successo.');
                resetPasswordModal.style.display = 'none';
            } else {
                const errorData = await response.json();
                alert(`Errore: ${errorData.message || 'Impossibile inviare l\'email.'}`);
            }
        } catch (error) {
            console.error('Errore durante la richiesta:', error);
            alert('Si è verificato un errore. Riprova più tardi.');
        }
    });
});