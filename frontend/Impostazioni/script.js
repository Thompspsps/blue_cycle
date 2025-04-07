document.addEventListener("DOMContentLoaded", () => {
    console.log("Document is ready");

    const languageSelector = document.getElementById('language');
    const authKey = "50f80a6e-c8dd-b682-b1c4-c4040da3bef4:fx";//ATTENZIONEEEEEE

    // Funzione per tradurre il testo utilizzando l'API di DeepL
    const translateText = async (text, targetLang) => {
        const url = `https://api-free.deepl.com/v2/translate?auth_key=${authKey}&text=${encodeURIComponent(text)}&target_lang=${targetLang.toUpperCase()}`;
        try {
            const response = await fetch(url);
            const result = await response.json();
            return result.translations[0].text;
        } catch (error) {
            console.error('Errore nella traduzione:', error);
            return text;
        }
    };

    // Funzione per tradurre tutti i nodi di testo della pagina
    const translatePage = async (language) => {
        const textNodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;

        while (node = walker.nextNode()) {
            // Escludi il nodo contenente il selettore delle lingue
            if (!node.parentElement.closest('#language-selector')) {
                textNodes.push(node);
            }
        }

        const translations = await Promise.all(textNodes.map(async (textNode) => {
            if (textNode.nodeValue.trim().length > 0) { // Traduci solo nodi non vuoti
                const translatedText = await translateText(textNode.nodeValue, language);
                return { textNode, translatedText };
            } else {
                return { textNode, translatedText: textNode.nodeValue };
            }
        }));

        translations.forEach(({ textNode, translatedText }) => {
            textNode.nodeValue = translatedText;
        });

        console.log("Page translated:", translations);
    };

    // Cambia lingua al cambio di selezione
    languageSelector.addEventListener('change', async (e) => {
        console.log("Language selector changed");
        alert("Lingua cambiata");
        await translatePage(e.target.value);
    });

    // Funzione per cambiare la password
    const changePassword = async (userId, oldPassword, newPassword) => {
        // Cifra le password usando SHA-512
        const hashedOldPassword = CryptoJS.SHA512(oldPassword).toString();
        const hashedNewPassword = CryptoJS.SHA512(newPassword).toString();

        const accessToken = localStorage.getItem('accessToken'); // Recupera il token di autorizzazione

        try {
            const response = await fetch(`http://127.0.0.1/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` // Includi il token di autorizzazione
                },
                body: JSON.stringify({ 
                    oldPassword: hashedOldPassword, 
                    newPassword: hashedNewPassword 
                })
            });

            if (!response.ok) {
                throw new Error('Errore durante il cambio della password.');
            }

            const data = await response.json();
            alert('Password cambiata con successo!');
            return data;
        } catch (error) {
            alert(`Errore: ${error.message}`);
            return null;
        }
    };

    // Aggiungi un event listener al form di cambio password
    const passwordForm = document.getElementById('password-form');
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene il comportamento predefinito del form

        // Ottieni i valori degli input
        const oldPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        // Controlla che entrambi i campi siano compilati
        if (!oldPassword || !newPassword) {
            alert('Entrambi i campi "Password Attuale" e "Nuova Password" sono obbligatori.');
            return;
        }

        const userId = '123'; // Sostituisci con l'ID reale dell'utente
        await changePassword(userId, oldPassword, newPassword);
    });
});
