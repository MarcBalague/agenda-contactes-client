// JSON de usuaris localstorage
const STORAGE_KEY = 'contactes_db';

// Metodes per a guardar i agafar les dades dels contactes, 
// fent la conversió de text a JSON i al reves
const getContacts = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const saveContacts = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
// Buscar contactes existents
document.addEventListener('DOMContentLoaded', async () => {
    
    // Busca si hi han dades al contacts, i les posa
    if (!localStorage.getItem(STORAGE_KEY)) {
        try {
            // Fem la petició, convertim a JSON i guardem directament
            const data = await (await fetch('contacts.json')).json();
            saveContacts(data);
        } catch (e) { console.error(e); }
    }
    
    // Si existeix la taula -> Estem a la Pàgina Principal
    if (document.getElementById('contact-list')) initIndex();
    
    // Si existeix el formulari d'afegir -> Estem a la Pàgina Afegir
    if (document.getElementById('form-afegir')) initAfegir();
    
    // Si existeix el formulari de detall -> Estem a la Pàgina Editar
    if (document.getElementById('form-detall')) initDetall();
});


// --- PÀGINA PRINCIPAL (INDEX) ---
function initIndex() {
    const table = document.querySelector('#contact-list');
    
    // Funcionament del filtre
    const render = (filtre = "") => {
        // Passo tot a minúscules per a filtrar correctament
        const contacts = getContacts().filter(c => c.nom.toLowerCase().includes(filtre.toLowerCase()));
        
        // Generem l'HTML de cada fila fent servir .map()
        table.innerHTML = contacts.map(c => `
            <tr>
                <td>${c.nom}</td><td>${c.email}</td><td>${c.telefon}</td>
                <td>
                    <a href="detall.html?id=${c.id}" class="btn btn-primary">Editar</a>
                    <button onclick="deleteContact(${c.id})" class="btn btn-danger">Esborrar</button>
                </td>
            </tr>`).join('');
    };

    // Filtrar en temps real al buscador
    document.getElementById('search-input')?.addEventListener('input', (e) => render(e.target.value));
    
    //Carregar la taula si no hi han filtres
    render();
}

// Ha de ser global perquè la cridem des del HTML amb un 'onclick="deleteContact(1)"'
window.deleteContact = (id) => {
    if (confirm('Segur que vols esborrar aquest contacte?')) {
        // Guardo tots els contactes menys la id que em passen per parametre
        saveContacts(getContacts().filter(c => c.id !== id));
        initIndex(); 
    }
};


// --- PÀGINA AFEGIR ---
function initAfegir() {
    // al enviar el formulari s'activa el metode
    document.getElementById('form-afegir').addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const contacts = getContacts();
        // Calculem el nou ID: Busquem el màxim actual i sumem 1
        const newId = contacts.length ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        
        // Afegim el nou objecte a l'array
        contacts.push({
            id: newId,
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            telefon: document.getElementById('telefon').value
        });
        
        saveContacts(contacts); // Guardem canvis
        window.location.href = 'index.html'; // Tornem a l'inici
    });
}


// --- PÀGINA DETALL (EDITAR) ---
function initDetall() {
    // Llegim l'ID que ve a la URL
    const id = parseInt(new URLSearchParams(window.location.search).get('id'));
    const contacts = getContacts();
    
    // Busquem la posició del contacte dins l'array
    const index = contacts.findIndex(c => c.id === id);

    // Omplim els inputs del formulari amb les dades actuals
    const c = contacts[index];
    document.getElementById('edit-nom').value = c.nom;
    document.getElementById('edit-email').value = c.email;
    document.getElementById('edit-telefon').value = c.telefon;

    // Guardar els canvis
    document.getElementById('form-detall').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Actualitzem les dades d'aquell contacte específic
        contacts[index].nom = document.getElementById('edit-nom').value;
        contacts[index].email = document.getElementById('edit-email').value;
        contacts[index].telefon = document.getElementById('edit-telefon').value;
        
        saveContacts(contacts); 
        window.location.href = 'index.html'; 
    });
}
