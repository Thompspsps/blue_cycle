document.addEventListener("DOMContentLoaded", () => {
    const imageList = document.getElementById('image-list');
    const couponList = document.getElementById('coupon-list');
    const modal = document.getElementById('modal');
    const modalDetails = document.getElementById('modal-details');
    const closeModalButton = document.getElementsByClassName('close')[0];
    const buyButton = document.getElementById('buy-button');
    const wishlistHeart = document.getElementById('wishlist-heart');
    const userId = localStorage.getItem("Id");
    const token = localStorage.getItem("Token");
    const userScoreElement = document.createElement('div'); // Elemento per il punteggio dell'utente
    userScoreElement.id = 'user-score';
    userScoreElement.style.textAlign = 'center';
    userScoreElement.style.marginTop = '20px';
    document.body.insertBefore(userScoreElement, document.body.firstChild);

    const apiBaseUrl = "http://localhost:3000/api/v1";

    // Funzione per effettuare richieste API
    const apiRequest = async (url, method = 'GET', body = null) => {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            console.log(`[API ${method}] ${url} →`, result); // Log della risposta del server
            if (result.success) {
                // Restituisci true se l'operazione è andata a buon fine, anche se data è null
                return result.data !== undefined ? (result.data === null ? true : result.data) : true;
            }
            console.error(result.message);
            return false;
        } catch (error) {
            console.error(`Errore nella richiesta API (${method} ${url}):`, error);
            return false;
        }
    };

    // Funzione per aggiornare il punteggio dell'utente
    const updateUserScore = async () => {
        const userData = await apiRequest(`${apiBaseUrl}/users/${userId}`);
        if (userData && typeof userData.points !== "undefined") {
            userScoreElement.innerHTML = `<h3>Punteggio Utente: ${userData.points}</h3>`;
            document.getElementById('userPoints').textContent = `Punti: ${userData.points}`;
        } else {
            userScoreElement.innerHTML = `<h3>Punteggio Utente: --</h3>`;
            document.getElementById('userPoints').textContent = `Punti: --`;
        }
    };

    // Funzione per creare un pulsante per un coupon
    const createCouponButton = (coupon, isFavorite = false) => {
        const button = document.createElement('button');
        button.classList.add('coupon-button');
        button.innerHTML = `
            <div class="coupon-content">
                <h3>${coupon.nome}</h3>
                <p>Prezzo: ${coupon.prezzo} €</p>
                <p>Sconto: ${coupon.sconto}%</p>
            </div>
        `;

        button.addEventListener('click', () => {
            modalDetails.innerHTML = `
                <h2>${coupon.nome}</h2>
                <p><strong>Sconto:</strong> ${coupon.sconto}%</p>
                <p><strong>Prezzo:</strong> ${coupon.prezzo} €</p>
                <p><strong>Descrizione:</strong> ${coupon.descrizione}</p>
            `;
            modal.setAttribute('data-product-id', coupon.self);
            modal.setAttribute('data-is-favorite', isFavorite);
            modal.style.display = "block";
        });

        return button;
    };

    // Funzione per chiudere il modal
    const closeModal = () => {
        modal.style.display = "none";
    };

    closeModalButton.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target === modal) closeModal();
    };

    // Elementi filtro
    const filterButton = document.getElementById('filter-button');
    const filterModal = document.getElementById('filter-modal');
    const closeFilterModal = document.getElementById('close-filter-modal');
    const confirmFilter = document.getElementById('confirm-filter');
    const filterName = document.getElementById('filter-name');
    const filterPrice = document.getElementById('filter-price');

    let allCoupons = []; // Per mantenere la lista completa

    // Mostra/nascondi modale filtro
    filterButton.onclick = () => { filterModal.style.display = 'block'; };
    closeFilterModal.onclick = () => { filterModal.style.display = 'none'; };
    window.addEventListener('click', (e) => {
        if (e.target === filterModal) filterModal.style.display = 'none';
    });

    // Sovrascrivi loadCoupons per salvare tutti i coupon
    const originalLoadCoupons = async () => {
        const coupons = await apiRequest(`${apiBaseUrl}/couponPrototypes`);
        if (!coupons) return;
        imageList.innerHTML = '';
        coupons.forEach(coupon => {
            const couponData = {
                self: coupon.self,
                nome: coupon.description,
                sconto: coupon.discount,
                store: coupon.store,
                prezzo: coupon.price,
                descrizione: coupon.description,
            };
            const couponButton = createCouponButton(couponData);
            imageList.appendChild(couponButton);
        });
    };

    const loadCouponsWithSave = async () => {
        const coupons = await apiRequest(`${apiBaseUrl}/couponPrototypes`);
        if (!coupons) return;
        allCoupons = coupons; // Salva tutti i coupon
        renderCoupons(coupons);
    };

    const renderCoupons = (coupons) => {
        imageList.innerHTML = '';
        coupons.forEach(coupon => {
            const couponData = {
                self: coupon.self,
                nome: coupon.description,
                sconto: coupon.discount,
                store: coupon.store,
                prezzo: coupon.price,
                descrizione: coupon.description,
            };
            const couponButton = createCouponButton(couponData);
            imageList.appendChild(couponButton);
        });
    };

    // Sostituisci la chiamata a loadCoupons con loadCouponsWithSave
    const loadCoupons = loadCouponsWithSave;

    // Applica i filtri quando si preme "Conferma"
    confirmFilter.onclick = () => {
        let filtered = allCoupons;
        const name = filterName.value.trim().toLowerCase();
        const price = parseFloat(filterPrice.value);

        if (name) {
            filtered = filtered.filter(c => c.description.toLowerCase().includes(name));
        }
        if (!isNaN(price)) {
            filtered = filtered.filter(c => c.price <= price);
        }
        renderCoupons(filtered);
        filterModal.style.display = 'none';
    };

    // Funzione per caricare i coupon preferiti in modo più efficiente
    const loadWishlistedCoupons = async () => {
        const wishlistedCoupons = await apiRequest(`${apiBaseUrl}/users/${userId}/wishlistedCoupons`);
        if (!wishlistedCoupons) return;

        couponList.innerHTML = '';
        // Preleva tutti gli id dei prototipi dei coupon preferiti
        const prototypeIds = wishlistedCoupons.map(c => c.couponPrototype.split('/').pop());
        // Chiamata batch per tutti i dettagli dei coupon preferiti (se il backend lo supporta)
        const detailsPromises = prototypeIds.map(id =>
            apiRequest(`${apiBaseUrl}/couponPrototypes/${id}`)
        );
        const details = await Promise.all(detailsPromises);

        details.forEach((couponDetails, idx) => {
            if (!couponDetails) return;
            const couponData = {
                self: couponDetails.self,
                nome: couponDetails.description,
                sconto: couponDetails.discount,
                prezzo: couponDetails.price,
                descrizione: couponDetails.description,
            };
            const couponButton = createCouponButton(couponData, true);
            // Aggiungi un attributo per trovare il bottone dopo la rimozione
            couponButton.setAttribute('data-wishlist-id', wishlistedCoupons[idx].self.split('/').pop());
            couponList.appendChild(couponButton);
        });
    };

    // Funzione per gestire il click sul cuore nel modal
    wishlistHeart.onclick = async () => {
        const productSelf = modal.getAttribute('data-product-id');
        const isFavorite = modal.getAttribute('data-is-favorite') === 'true';

        if (isFavorite) {
            // Rimuovi dai preferiti
            const wishlistedCoupons = await apiRequest(`${apiBaseUrl}/users/${userId}/wishlistedCoupons`);
            const couponToRemove = wishlistedCoupons.find(coupon => coupon.couponPrototype.split('/').pop() === productSelf.split('/').pop());
            if (couponToRemove) {
                const wishself = couponToRemove.self.split('/').pop();
                const success = await apiRequest(`${apiBaseUrl}/users/${userId}/wishlistedCoupons/${wishself}`, 'DELETE');
                if (success) {
                    await updateUserScore();
                    // Aggiorna entrambe le liste
                    await loadWishlistedCoupons();
                    await loadCoupons();
                } else {
                    console.log('Errore nella rimozione dai preferiti');
                }
            }
        } else {
            // Aggiungi ai preferiti
            const success = await apiRequest(`${apiBaseUrl}/users/${userId}/wishlistedCoupons`, 'POST', { couponPrototype: productSelf });
            if (success) {
                await updateUserScore();
                // Aggiorna entrambe le liste
                await loadWishlistedCoupons();
                await loadCoupons();
            } else {
                console.log('Errore nell\'aggiunta ai preferiti');
            }
        }

        closeModal();
    };

    // Funzione per acquistare un coupon
    buyButton.onclick = async () => {
        const productSelf = modal.getAttribute('data-product-id');
        console.log("productSelf buy:" + productSelf.split("/").pop());
        const success = await apiRequest(`${apiBaseUrl}/users/${userId}/coupons`, 'POST', { couponPrototype: productSelf.split("/").pop() });
        if (success) {
            alert('Hai comprato il prodotto!');
            await updateUserScore();
            loadCoupons();
        } else {
            alert('Errore nell\'acquisto del prodotto');
        }
        closeModal();
    };

    // Inizializza il caricamento dei dati
    const initialize = async () => {
        await updateUserScore();
        await loadCoupons();
        await loadWishlistedCoupons();
    };

    initialize();
});

document.addEventListener('DOMContentLoaded', function() {
    const userPoints = localStorage.getItem('UserPoints');
    const pointsDiv = document.getElementById('userPoints');
    if (userPoints !== null) {
        pointsDiv.textContent = `Punti: ${userData.points}`;
    } else {
         
         pointsDiv.textContent = `Punti: ${userData.points}`;
    }
});