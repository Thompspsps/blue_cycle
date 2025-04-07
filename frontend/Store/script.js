document.addEventListener("DOMContentLoaded", () => {
    const imageList = document.getElementById('image-list');
    const couponList = document.getElementById('coupon-list');
    const modal = document.getElementById('modal');
    const modalDetails = document.getElementById('modal-details');
    const span = document.getElementsByClassName('close')[0];
    const buyButton = document.getElementById('buy-button');
    const wishlistHeart = document.getElementById('wishlist-heart');
    const userId = localStorage.getItem("Id"); // Recupera l'ID utente da localStorage
    const token = localStorage.getItem("Token"); // Recupera il token da localStorage

    // Funzione per ottenere i prototipi dei coupon dall'API
    async function getCouponPrototypes() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/couponPrototypes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                console.error(result.message);
                return [];
            }
        } catch (error) {
            console.error('Errore nel recupero dei prototipi dei coupon:', error);
            return [];
        }
    }

    // Funzione per ottenere i preferiti dall'API
    async function getWishlistedCoupons() {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userId}/wishlistedCoupons`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                console.error(result.message);
                return [];
            }
        } catch (error) {
            console.error('Errore nel recupero dei preferiti:', error);
            return [];
        }
    }

    // Funzione per creare un container per le immagini dei coupon
    const createImage = (product) => {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        const img = document.createElement('img');
        img.src = product.immagine; // link foto

        const infoContainer = document.createElement('div');
        infoContainer.classList.add('image-info');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('name');
        nameSpan.textContent = product.nome;

        const priceSpan = document.createElement('span');
        priceSpan.classList.add('price');
        priceSpan.textContent = `${product.prezzo}`;

        infoContainer.appendChild(nameSpan);
        infoContainer.appendChild(priceSpan);
        imageContainer.appendChild(img);
        imageContainer.appendChild(infoContainer);

        // Event listener per aprire il modal con i dettagli del coupon
        img.addEventListener('click', () => {
            modalDetails.innerHTML = `
                <h2>${product.nome}</h2>
                <p><strong>Sconto:</strong> ${product.sconto}%</p>
                <p><strong>Prezzo:</strong> ${product.prezzo}</p>
                <p><strong>Descrizione:</strong> ${product.descrizione}</p>
            `;
            modal.setAttribute('data-product-id', product.self);
            modal.setAttribute('data-product-store', product.store);
            modal.style.display = "block";
        });

        return imageContainer;
    };

    // Chiudi il modal cliccando sulla "X"
    span.onclick = () => {
        modal.style.display = "none";
    };

    // Chiudi il modal cliccando fuori dal modal
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Azione del bottone "Compra"
    buyButton.onclick = async () => {
        const productSelf = modal.getAttribute('data-product-id')

        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userId}/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ self: productSelf })
            });

            const result = await response.json();
            if (result.success) {
                alert('Hai comprato il prodotto!');
            } else {
                alert('Errore nell\'acquisto del prodotto');
            }
        } catch (error) {
            console.error('Errore nell\'acquisto del prodotto:', error);
            alert('Errore nel tentativo di acquistare il prodotto');
        }

        modal.style.display = "none";
    };

    // Aggiungi ai preferiti
    wishlistHeart.onclick = async () => {
        const productSelf =    modal.getAttribute('data-product-id')
        console.log("Self: "+productSelf);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userId}/wishlistedCoupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                
                body: JSON.stringify({ couponPrototype: productSelf })
            });

            const result = await response.json();
            if (result.success) {
                alert('Aggiunto ai preferiti');
                loadWishlistedCoupons();
            } else {
                alert('Errore nell\'aggiunta ai preferiti');
            }
        } catch (error) {
            console.error('Errore nell\'aggiunta ai preferiti:', error);
            alert('Errore nel tentativo di aggiungere ai preferiti');
        }

        modal.style.display = "none";
    };

    // Rimuovi dai preferiti
    const removeFromWishlist = async (itemSelf) => {
        try {
            
            const response = await fetch(`http://localhost:3000/api/v1/users/${userId}/wishlistedCoupons/${itemSelf}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                alert('Rimosso dai preferiti');
                loadWishlistedCoupons();
            } else {
                alert('Errore nella rimozione dai preferiti');
            }
        } catch (error) {
            console.error('Errore nella rimozione dai preferiti:', error);
            alert('Errore nel tentativo di rimuovere dai preferiti');
        }
    };

    // Funzione per caricare e visualizzare i coupon
    const loadCoupons = async () => {
        const coupons = await getCouponPrototypes();
        imageList.innerHTML = ''; 
        coupons.forEach(coupon => {
            const product = {
                self: coupon.self,
                nome: coupon.description,
                sconto: coupon.discount,
                prezzo: coupon.price,
                descrizione: coupon.description,
                immagine: 'https://via.placeholder.com/150', // Placeholder, replace with actual image if available
                store: coupon.store
            };
            const image = createImage(product);
            imageList.appendChild(image);
        });
    };

    // Funzione per caricare e visualizzare i coupon nei preferiti
    const loadWishlistedCoupons = async () => {
        const wishlistedCoupons = await getWishlistedCoupons();
        couponList.innerHTML = ''; // Clear existing list
        wishlistedCoupons.forEach(coupon => {
            const product = {
                self: coupon.self,
                nome: coupon.couponPrototype, // Assuming description is stored in couponPrototype
                sconto: coupon.discount,
                prezzo: coupon.price,
                descrizione: coupon.description,
                immagine: 'https://via.placeholder.com/150', // Placeholder, replace with actual image if available
                store: coupon.store
            };
            const couponElement = createImage(product);
            // Aggiungi un elemento per rimuovere dai preferiti, come un bottone o un'icona
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Rimuovi dai preferiti';
            removeButton.onclick = () => removeFromWishlist(coupon.self);
            couponElement.appendChild(removeButton);
            couponList.appendChild(couponElement);
        });
    };

    // Inizializza il caricamento dei coupon e dei preferiti
    const initialize = async () => {
        await loadCoupons();
        await loadWishlistedCoupons();
    };

    initialize();
});
