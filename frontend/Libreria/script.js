$(document).ready(function () {
    const userId = localStorage.getItem("Id"); // Recupera l'ID utente da localStorage
    const token = localStorage.getItem("Token"); // Recupera il token da localStorage
    let currentDisplayedCoupons = [];
    let showingValidCoupons = true;

    // Verifica che l'ID utente e il token siano presenti nel localStorage
    if (!userId || !token) {
        alert("Errore: ID utente o token mancante. Assicurati di aver effettuato l'accesso correttamente.");
        return; // Termina l'esecuzione se l'ID utente o il token sono mancanti
    }

    // Funzione per ottenere i coupon dall'API
    function getCoupons(used, expired) {
        return $.ajax({
            url: `http://127.0.0.1.3000/api/v1/users/${userId}/coupons?used=${used}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            dataType: 'json'
        }).then(response => {
            if (response.success) {
                return response.data;
            } else {
                console.error(response.message);
                return [];
            }
        }).catch(error => {
            console.error(error);
            return [];
        });
    }

    // Funzione per visualizzare i coupon inizialmente validi
    function displayInitialCoupons() {
        getCoupons(false, false).then(coupons => {
            if (coupons.length === 0) {
                alert("Non ci sono coupon");
            } else {
                currentDisplayedCoupons = coupons;
                displayCoupons(currentDisplayedCoupons);
            }
        });
    }

    // Inizialmente visualizziamo i coupon validi
    displayInitialCoupons();

    $('#toggle-view').click(function () {
        const query = $('#search').val().toLowerCase(); // Conserva il contenuto della barra di ricerca

        if (showingValidCoupons) {
            getCoupons(true, true).then(coupons => {
                if (coupons.length === 0) {
                    alert("Non ci sono coupon");
                } else {
                    currentDisplayedCoupons = coupons;
                    displayCoupons(filterCouponsByQuery(currentDisplayedCoupons, query));
                    $('#toggle-view').text("Vedi Coupon Validi");
                    showingValidCoupons = false;
                }
            });
        } else {
            getCoupons(false, false).then(coupons => {
                if (coupons.length === 0) {
                    alert("Non ci sono coupon");
                } else {
                    currentDisplayedCoupons = coupons;
                    displayCoupons(filterCouponsByQuery(currentDisplayedCoupons, query));
                    $('#toggle-view').text("Vedi Coupon Scaduti o Usati");
                    showingValidCoupons = true;
                }
            });
        }
    });

    $('#search').on('input', function () {
        const query = $(this).val().toLowerCase();
        displayCoupons(filterCouponsByQuery(currentDisplayedCoupons, query));
    });

    function displayCoupons(coupons) {
        const container = $('#coupon-container');
        container.empty();

        const query = $('#search').val().toLowerCase(); // Recupera il testo cercato

        coupons.forEach(coupon => {
            const highlightedStore = highlightText(coupon.store, query);
            const highlightedDescription = highlightText(coupon.description, query);
            const highlightedCode = highlightText(coupon.code, query);

            const couponElem = $(`
                <div class="coupon">
                    <strong>Store:</strong> ${highlightedStore}<br>
                    <strong>Discount:</strong> ${coupon.discount}%<br>
                    <strong>Description:</strong> ${highlightedDescription}
                </div>`);

            couponElem.click(function () {
                showDetails(coupon);
            });

            container.append(couponElem);
        });
    }

    function filterCouponsByQuery(coupons, query) {
        if (!query) return coupons;
        return coupons.filter(coupon =>
            coupon.code.toLowerCase().includes(query) ||
            coupon.store.toLowerCase().includes(query) ||
            coupon.description.toLowerCase().includes(query)
        );
    }

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    function showDetails(coupon) {
        $('#coupon-details').html(`
            <p><strong>Code:</strong> ${coupon.code}</p>
            <p><strong>Store:</strong> ${coupon.store}</p>
            <p><strong>Discount:</strong> ${coupon.discount}%</p>
            <p><strong>Description:</strong> ${coupon.description}</p>
            <p><strong>Expiration:</strong> ${new Date(coupon.expiration * 1000).toLocaleDateString()}</p>
        `);

        const barcodeContainer = $('#barcode');
        barcodeContainer.empty();
        JsBarcode(barcodeContainer[0], coupon.code, { format: "CODE128" });

        $('#modal').css('display', 'block');
    }

    $('.close').off('click').on('click', function () {
        $('#modal').css('display', 'none');
    });

    $(window).off('click').on('click', function (event) {
        if ($(event.target).is('#modal')) {
            $('#modal').css('display', 'none');
        }
    });
});
