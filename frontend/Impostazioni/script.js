document.addEventListener("DOMContentLoaded", () => {
    const languageSelector = document.getElementById('language');

    // Salva la lingua selezionata nelle impostazioni
    languageSelector.addEventListener('change', async (e) => {
        localStorage.setItem('preferredLanguage', e.target.value);
        alert("Lingua cambiata");
        await translatePage(e.target.value);
    });

    // Recupera la lingua preferita dalle impostazioni (localStorage)
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'it';

    // Traduci la pagina automaticamente se la lingua non è italiano
    if (preferredLanguage && preferredLanguage !== 'it') {
        translatePage(preferredLanguage);
        if (languageSelector) languageSelector.value = preferredLanguage;
    }

    const userId = localStorage.getItem("Id");
    const accessToken = localStorage.getItem('Token');

    if (!userId || !accessToken) {
        alert("Sessione scaduta o non valida. Effettua di nuovo il login.");
        return;
    }

    // Funzione per tradurre il testo usando Google Translate unofficial API
    const translateText = async (text, targetLang) => {
        try {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
            const result = await response.json();
            return result[0][0][0];
        } catch (error) {
            return text;
        }
    };

    // Funzione per tradurre tutti i nodi di testo della pagina
    async function translatePage(language) {
        const textNodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;

        while (node = walker.nextNode()) {
            if (!node.parentElement.closest('#language-selector')) {
                textNodes.push(node);
            }
        }

        const translations = await Promise.all(textNodes.map(async (textNode) => {
            if (textNode.nodeValue.trim().length > 0) {
                const translatedText = await translateText(textNode.nodeValue, language);
                return { textNode, translatedText };
            } else {
                return { textNode, translatedText: textNode.nodeValue };
            }
        }));

        translations.forEach(({ textNode, translatedText }) => {
            textNode.nodeValue = translatedText;
        });
    }

    // Funzione per validare la password
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

    // Funzione per verificare se la password è stata cambiata con successo
    const verifyPasswordChange = async (email, newPassword) => {
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

    // Funzione per cambiare la password
    const changePassword = async () => {
        const userId = localStorage.getItem("Id");
        const accessToken = localStorage.getItem('Token');
        const oldPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        // Validazione della nuova password
        const { isValid, errors } = validatePassword(newPassword);
        if (!isValid) {
            alert(`Errore nella password:\n- ${errors.join('\n- ')}`);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            if (response.ok) {
                alert('Password cambiata con successo! Effettua nuovamente il login.');
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
                    alert('Errore: Dati della richiesta non validi. Controlla che la password attuale sia corretta.');
                } else if (response.status === 401) {
                    alert('Errore: Sessione scaduta. Effettua nuovamente il login.');
                    window.location.href = '/Login/login.html';
                } else if (response.status === 500) {
                    // Controlla se il messaggio indica che l'operazione è riuscita comunque
                    if (errorJson && errorJson.message && 
                        (errorJson.message.toLowerCase().includes('success') || 
                         errorJson.message.toLowerCase().includes('updated'))) {
                        alert('Password cambiata con successo! Effettua nuovamente il login.');
                        localStorage.removeItem('Token');
                        localStorage.removeItem('Id');
                        window.location.href = '/Login/login.html';
                    } else {
                        // Verifica se la password è stata cambiata nonostante l'errore 500
                        const email = localStorage.getItem("Email");
                        if (email) {
                            const isPasswordChanged = await verifyPasswordChange(email, newPassword);
                            if (isPasswordChanged) {
                                alert('Password cambiata con successo! Effettua nuovamente il login.');
                                localStorage.removeItem('Token');
                                localStorage.removeItem('Id');
                                window.location.href = '/Login/login.html';
                            } else {
                                alert('Errore del server durante il cambio password. La password non è stata modificata. Riprova.');
                            }
                        } else {
                            alert('La password potrebbe essere stata cambiata. Prova a effettuare nuovamente il login con la nuova password.');
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
    };

    // Funzione per aggiornare visivamente i requisiti della password
    const updatePasswordRequirements = () => {
        const requirementsList = document.getElementById('password-requirements-list');
        if (!requirementsList) return;
        
        const requirements = [
            { text: 'Almeno 8 caratteri', check: (pwd) => pwd.length >= 8 },
            { text: 'Almeno una lettera maiuscola', check: (pwd) => /[A-Z]/.test(pwd) },
            { text: 'Almeno un carattere speciale (!@#$%^&*)', check: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
        ];
        
        const password = document.getElementById('new-password').value;
        
        requirementsList.innerHTML = requirements.map(req => {
            const isValid = req.check(password);
            const color = isValid ? '#28a745' : '#6c757d';
            const icon = isValid ? '✓' : '○';
            return `<li style="color: ${color}"><span style="font-weight: bold;">${icon}</span> ${req.text}</li>`;
        }).join('');
    };

    // Aggiungi validazione in tempo reale per il campo nuova password
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordRequirements);
    }

    // Aggiungi un event listener al form di cambio password
    const passwordForm = document.getElementById('password-form');
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene il comportamento predefinito del form

        const oldPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        // Controlla che entrambi i campi siano compilati
        if (!oldPassword || !newPassword) {
            alert('Entrambi i campi "Password Attuale" e "Nuova Password" sono obbligatori.');
            return;
        }

        // Valida la nuova password
        const { isValid, errors } = validatePassword(newPassword);
        if (!isValid) {
            alert(`La nuova password non è valida:\n- ${errors.join('\n- ')}`);
            return;
        }

        await changePassword();
    });
});
