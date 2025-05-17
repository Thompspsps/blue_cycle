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

async function main() {
    const userData = await fetchUserData();
    if (userData) {
        
        if(userData.password.temporaly)
        {
            window.location.href = '/Reset/reset.html';
        }
    } else {
        console.error('I dati utente non sono validi.');
    }
}

// Eseguire la funzione principale all'avvio
main();