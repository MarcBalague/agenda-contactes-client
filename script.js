// guardar/recuperar dades del navegador
const STORAGE_KEY = 'contactes_db';

// --- 1. INICIALITZACIÓ I ENCAMINAMENT (ROUTING) ---
// S'executa només quan l'HTML s'ha carregat completament
document.addEventListener('DOMContentLoaded', async () => {
    
    // A. Càrrega inicial de dades (Només la primera vegada)
    // Comprovem si ja existeixen dades al LocalStorage
    if (!localStorage.getItem(STORAGE_KEY)) {
        try {
            // Fetch: Petició per llegir el fitxer JSON
            const response = await fetch('contacts.json');
            const data = await response.json();
            
            // Guardem les dades inicials al navegador
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error carregant el JSON:', error);
        }
    }

    // B. Sistema de "Router" senzill
    // Mirem a quina URL estem per saber quina funció executar
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        renderIndex(); // Pàgina principal: Llista i cerca
    } else if (path.includes('afegir.html')) {
        setupAfegir(); // Pàgina afegir: Formulari buit
    } else if (path.includes('detall.html')) {
        renderDetall(); // Pàgina detall: Edició
    }
});

// Recupera les dades convertint el text del LocalStorage a objecte JS
function getContacts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Guarda l'array de contactes
function saveContacts(contacts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

// --- PÀGINA PRINCIPAL (index.html) ---

function renderIndex() {
    const tableBody = document.querySelector('#contact-list');
    const searchInput = document.getElementById('search-input');

    // Taula HTML
    // Accepta un paràmetre 'filtre' opcional per a la cerca.
    const drawTable = (filtre = "") => {
        const contacts = getContacts();
        
        // .filter(): Crea un nou array només amb els contactes que coincideixen
        // .toLowerCase(): Assegura que funcioni tant en majúscules com minúscules
        const filtrats = contacts.filter(c => 
            c.nom.toLowerCase().includes(filtre.toLowerCase())
        );

        // Creo des de aqui la taula per utilitzar les dades de l'objecte
        tableBody.innerHTML = filtrats.map(c => `
            <tr>
                <td>${c.nom}</td>
                <td>${c.email}</td>
                <td>${c.telefon}</td>
                <td class="actions">
                    <a href="detall.html?id=${c.id}" class="btn btn-primary">Editar</a>
                    <button onclick="deleteContact(${c.id})" class="btn btn-danger">Esborrar</button>
                </td>
            </tr>
        `).join('');
    };

    // Taula dinàmica per als filtres
    if (searchInput) {
        searchInput.addEventListener('input', (e) => drawTable(e.target.value));
    }

    drawTable();
}

// Funció per esborrar un contacte.
// L'assignem a 'window' perquè sigui global i accessible des de l'HTML (onclick="")
window.deleteContact = function(id) {
    if (confirm('Estàs segur que vols esborrar aquest contacte?')) {
        let contacts = getContacts();
        
        // .filter(): Manté tots els contactes EXCEPTE el que té l'ID que volem esborrar
        contacts = contacts.filter(c => c.id !== id);
        
        saveContacts(contacts);
        renderIndex(); // Recargar taula
    }
};

// --- PÀGINA AFEGIR (afegir.html) ---

function setupAfegir() {
    const form = document.getElementById('form-afegir');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const contacts = getContacts();
        
        // Càlcul d'ID automàtic: Busquem l'ID més alt actual i li sumem 1.
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;

        const newContact = {
            id: newId,
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            telefon: document.getElementById('telefon').value
        };

        contacts.push(newContact); // Afegim el contacte
        saveContacts(contacts);
        
        alert('Contacte afegit correctament!');
        window.location.href = 'index.html'; // Redirecció a index
    });
}

// --- PÀGINA DETALL (detall.html) ---

function renderDetall() {
    // URLSearchParams: Classe nativa per llegir paràmetres de la URL (ex: ?id=5)
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id' )); // Convertim a número enter
    
    const contacts = getContacts();
    // .find(): Retorna el primer element que compleix la condició
    const contact = contacts.find(c => c.id === id);

    // Validació de seguretat: si no troba l'ID, torna enrere
    if (!contact) {
        alert('Contacte no trobat');
        window.location.href = 'index.html';
        return;
    }

    // Omplim el formulari amb les dades actuals (Pre-filling)
    document.getElementById('edit-id').value = contact.id;
    document.getElementById('edit-nom').value = contact.nom;
    document.getElementById('edit-email').value = contact.email;
    document.getElementById('edit-telefon').value = contact.telefon;

    // Gestió de l'actualització
    document.getElementById('form-detall').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // .findIndex(): Busca la posició (índex) dins l'array per saber on sobreescriure
        const index = contacts.findIndex(c => c.id === id);
        
        if (index !== -1) {
            // Actualitzem les propietats de l'objecte existent
            contacts[index].nom = document.getElementById('edit-nom').value;
            contacts[index].email = document.getElementById('edit-email').value;
            contacts[index].telefon = document.getElementById('edit-telefon').value;
            
            saveContacts(contacts);
            alert('Contacte actualitzat!');
            window.location.href = 'index.html';
        }
    });
}