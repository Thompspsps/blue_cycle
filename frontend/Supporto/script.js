document.getElementById('ticketForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const categoria = document.getElementById('categoria').value;
    const descrizione = document.getElementById('descrizione').value;
    const email = "supporto@azienda.com";

    const ticket = {
        categoria: categoria,
        descrizione: descrizione,
        email: email
    };

    console.log('Ticket inviato:', ticket);
    alert('Il tuo ticket è stato inviato con successo!');
});
