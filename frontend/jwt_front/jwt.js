// Funzione per autenticare l'utente
const login = async (username, password) => {
  // Effettua una richiesta POST al server con le credenziali dell'utente
  const response = await fetch('http://127.0.0.1:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Specifica che il corpo della richiesta è in formato JSON
    },
    body: JSON.stringify({ username, password }) // Converte le credenziali in una stringa JSON
  });

  // Estrae i dati dalla risposta
  const data = await response.json();

  // Memorizza i token di accesso e di refresh nel localStorage del browser
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};

// Funzione per ottenere un nuovo token di accesso utilizzando il token di refresh
const refreshAccessToken = async () => {
  // Estrae il token di refresh dal localStorage
  const refreshToken = localStorage.getItem('refreshToken');

  // Effettua una richiesta POST al server con il token di refresh
  const response = await fetch('http://127.0.0.1:3000/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Specifica che il corpo della richiesta è in formato JSON
    },
    body: JSON.stringify({ refreshToken }) // Invia il token di refresh in formato JSON
  });

  // Estrae i dati dalla risposta
  const data = await response.json();

  // Se il server ha inviato un nuovo token di accesso, memorizzalo nel localStorage
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }

  // Restituisce il nuovo token di accesso
  return data.accessToken;
};

// Funzione per effettuare richieste a endpoint protetti
const fetchProtectedData = async () => {
  // Estrae il token di accesso dal localStorage
  let token = localStorage.getItem('accessToken');

  // Effettua una richiesta GET all'endpoint protetto con il token di accesso nell'header Authorization
  let response = await fetch('https://blue-cycle-zljn.onrender.com/protected', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}` // Aggiunge il token di accesso come Bearer token nell'header Authorization
    }
  });

  // Se il server risponde con 401 (Unauthorized), significa che il token è scaduto
  if (response.status === 401) {
    // Ottiene un nuovo token di accesso utilizzando il token di refresh
    token = await refreshAccessToken();

    // Riprova la richiesta GET con il nuovo token di accesso
    response = await fetch('https://blue-cycle-zljn.onrender.com/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Estrae i dati dalla risposta
  const data = await response.json();

  // Restituisce i dati ricevuti dal server
  return data;
};

// Funzione per eseguire il logout dell'utente
const logout = () => {
  // Rimuove i token dal localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Esempio di utilizzo delle funzioni sopra
const main = async () => {
  // Autentica l'utente
  await login('username', 'password');

  // Recupera dati protetti dall'endpoint protetto
  const protectedData = await fetchProtectedData();

  // Visualizza i dati protetti nella console
  console.log(protectedData);

  // Esegue il logout dell'utente
  logout();
};

// Esegue la funzione main
main();
