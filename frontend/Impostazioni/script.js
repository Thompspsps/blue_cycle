document.addEventListener("DOMContentLoaded", () => {
    console.log("Document is ready");

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
    console.log("userId:", userId);
    console.log("accessToken:", accessToken);

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
            console.error('Errore nella traduzione:', error);
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

        console.log("Page translated:", translations);
    }

    // Funzione per cambiare la password
    const changePassword = async () => {
        const userId = localStorage.getItem("Id");
        const accessToken = localStorage.getItem('Token');
        const oldPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

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
            alert('Password cambiata con successo!');
        } else {
            const data = await response.json();
            alert(`Errore: ${data.message || response.statusText}`);
        }
    };

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

        await changePassword();
    });
});
