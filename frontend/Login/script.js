const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`La password deve essere lunga almeno ${minLength} caratteri`);
    }
    
    if (!hasUpperCase) {
        errors.push('La password deve contenere almeno una lettera maiuscola');
    }
    
    if (!hasSpecialChar) {
        errors.push('La password deve contenere almeno un carattere speciale');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const login = async () => {
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

    try {
        // Invia la richiesta al server
        const response = await fetch('http://127.0.0.1:3000/api/v1/userAuth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: hashedPassword })
        });

        // Verifica se la risposta è OK
        if (!response.ok) {
            throw new Error(`Errore durante l'autenticazione: ${response.statusText}`);
        }

        // Leggi i dati della risposta
        const dataresp = await response.json();

        // Controlla se il campo 'data' esiste nella risposta
        if (dataresp.data) {
            // Se c'è il token, salvalo nel localStorage
            if (dataresp.data.token) {
                localStorage.setItem('Token', dataresp.data.token);
            }

            // Se c'è il campo 'self', estrai l'ID utente
            if (dataresp.data.self) {
                const userId = dataresp.data.self.substring(dataresp.data.self.lastIndexOf('/') + 1);
                localStorage.setItem("Id", userId);

                // Verifica se la password è temporanea
                try {
                    await checkTemporaryPassword(userId, password);
                } catch (error) {
                    alert('Login effettuato con successo!');
                    window.location.href = '/Home/home.html';
                }
            } else {
                // Procedi comunque con il login se non c'è il campo self
                alert('Login effettuato con successo!');
                window.location.href = '/Home/home.html';
            }
        }

    } catch (error) {
        alert('Errore durante il login. Controlla le credenziali e riprova.');
    }
};

// Funzione per verificare se la password è temporanea
const checkTemporaryPassword = async (userId, oldPassword) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('Token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Sessione scaduta. Effettua nuovamente il login.');
                window.location.href = '/Login/login.html';
                return;
            }
            throw new Error(`Errore ${response.status}`);
        }

        const userData = await response.json();

        // Controlla se la struttura della risposta è quella attesa
        if (!userData.data || !userData.data.password) {
            alert('Login effettuato con successo!');
            window.location.href = '/Home/home.html';
            return;
        }

        if (userData.data.password.temporary === true) {
            alert('La tua password è temporanea. Devi cambiarla per continuare.');
            const email = document.getElementById('email').value;
            showChangePasswordModal(userId, oldPassword, email);
        } else {
            alert('Login effettuato con successo!');
            window.location.href = '/Home/home.html';
        }
    } catch (error) {
        alert('Errore durante la verifica della password. Riprova più tardi.');
    }
};

// Funzione per verificare se la password è stata cambiata con successo
const verifyPasswordChange = async (userId, email, newPassword) => {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/userAuth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: newPassword })
        });

        return response.ok;
    } catch (error) {
        return false;
    }
};

// Mostra la finestra modale per il cambio della password
const showChangePasswordModal = (userId, oldPassword, email = null) => {
    const changePasswordModal = document.getElementById('changePasswordModal');
    const closeModalButton = changePasswordModal.querySelector('.close');
    const savePasswordButton = document.getElementById('savePasswordButton');
    const newPasswordInput = document.getElementById('newPassword');

    changePasswordModal.style.display = 'block';

    // Validazione in tempo reale della password
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        const validation = validatePassword(password);
        
        // Aggiorna visivamente i requisiti
        updatePasswordRequirements(validation);
    });

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

        // Validazione della password
        const { isValid, errors } = validatePassword(newPassword);
        if (!isValid) {
            alert(`Errore nella password:\n- ${errors.join('\n- ')}`);
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
                localStorage.removeItem('Token');
                localStorage.removeItem('Id');
                window.location.href = '/Login/login.html';
            } else {
                const errorData = await response.text();
                
                // Prova a parsare la risposta come JSON
                let errorJson = null;
                try {
                    errorJson = JSON.parse(errorData);
                } catch (e) {
                    // Ignore parsing error
                }
                
                if (response.status === 400) {
                    alert('Errore: Dati della richiesta non validi. Controlla che la vecchia password sia corretta.');
                } else if (response.status === 401) {
                    alert('Errore: Sessione scaduta. Effettua nuovamente il login.');
                    window.location.href = '/Login/login.html';
                } else if (response.status === 500) {
                    // Controlla se il messaggio indica che l'operazione è riuscita comunque
                    if (errorJson && errorJson.message && 
                        (errorJson.message.toLowerCase().includes('success') || 
                         errorJson.message.toLowerCase().includes('updated'))) {
                        alert('Password cambiata con successo. Effettua nuovamente il login.');
                        changePasswordModal.style.display = 'none';
                        localStorage.removeItem('Token');
                        localStorage.removeItem('Id');
                        window.location.href = '/Login/login.html';
                    } else {
                        // Verifica se la password è stata cambiata nonostante l'errore 500
                        if (email) {
                            const isPasswordChanged = await verifyPasswordChange(userId, email, newPassword);
                            if (isPasswordChanged) {
                                alert('Password cambiata con successo. Effettua nuovamente il login.');
                                changePasswordModal.style.display = 'none';
                                localStorage.removeItem('Token');
                                localStorage.removeItem('Id');
                                window.location.href = '/Login/login.html';
                            } else {
                                alert('Errore del server durante il cambio password. La password non è stata modificata. Riprova.');
                            }
                        } else {
                            alert('La password potrebbe essere stata cambiata. Prova a effettuare nuovamente il login con la nuova password.');
                            changePasswordModal.style.display = 'none';
                            localStorage.removeItem('Token');
                            localStorage.removeItem('Id');
                            window.location.href = '/Login/login.html';
                        }
                    }
                } else {
                    if (errorJson && errorJson.message) {
                        alert(`Errore: ${errorJson.message}`);
                    } else {
                        alert(`Errore ${response.status}: Impossibile cambiare la password.`);
                    }
                }
            }
        } catch (error) {
            alert('Si è verificato un errore di rete. Controlla la connessione e riprova.');
        }
    });
};

// Funzione per aggiornare visivamente i requisiti della password
const updatePasswordRequirements = (validation) => {
    const requirementsList = document.querySelector('.password-requirements ul');
    if (!requirementsList) return;
    
    const requirements = [
        { text: 'Almeno 8 caratteri', check: (pwd) => pwd.length >= 8 },
        { text: 'Almeno una lettera maiuscola', check: (pwd) => /[A-Z]/.test(pwd) },
        { text: 'Almeno un carattere speciale (!@#$%^&*)', check: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
    ];
    
    const password = document.getElementById('newPassword').value;
    
    requirementsList.innerHTML = requirements.map(req => {
        const isValid = req.check(password);
        const color = isValid ? '#28a745' : '#6c757d';
        const icon = isValid ? '✓' : '○';
        return `<li style="color: ${color}"><span style="font-weight: bold;">${icon}</span> ${req.text}</li>`;
    }).join('');
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
            const response = await fetch('http://127.0.0.1:3000/api/v1/forgotPassword', {
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
            alert('Si è verificato un errore. Riprova più tardi.');
        }
    });
});