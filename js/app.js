

// ======================================
// SISTEMA DE GESTION DE USUARIOS CRUD
// ======================================

// Obtener los elementos HTML
const userForm = document.getElementById("userForm");
const userIdInput = document.getElementById("userId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const userTable = document.getElementById("userTable");
const totalUsers = document.getElementById("totalUsers");
const searchInput = document.getElementById("searchInput");
const filteredCount = document.getElementById("filteredCount");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const emptyMessage = document.getElementById("emptyMessage");

// Obtener usuarios guardados
let users = [];

try {
    users = JSON.parse(localStorage.getItem("users")) || [];

    if (!Array.isArray(users)) {
        users = [];
    }
} catch (error) {
    users = [];
}

// Guardar usuarios en LocalStorage
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

// Mostrar fecha de registro
function formatDate(date) {
    if (!date) {
        return "Sin fecha";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Sin fecha";
    }

    return parsedDate.toLocaleDateString("es-DO");
}

// ======================================
// VALIDAR DATOS DEL FORMULARIO
// ======================================

function validateUser(name, email, phone, currentId) {

    // Validar nombre
    if (name.length < 3) {
        alert("El nombre debe tener al menos 3 caracteres.");
        nameInput.focus();
        return false;
    }

    // Validar que el nombre no tenga solamente espacios
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(name)) {
        alert("El nombre debe contener letras.");
        nameInput.focus();
        return false;
    }

    // Validar correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Introduce un correo electrónico válido.");
        emailInput.focus();
        return false;
    }

    // Validar teléfono
    const phonePattern = /^[0-9+\-\s()]{7,20}$/;
    const phoneDigits = phone.replace(/\D/g, "");

    if (!phonePattern.test(phone) ||
        phoneDigits.length < 7 ||
        phoneDigits.length > 15) {

        alert("Introduce un teléfono válido de 7 a 15 dígitos.");
        phoneInput.focus();
        return false;
    }

    // Evitar correos duplicados
    const emailExists = users.some(user =>
        String(user.email || "").toLowerCase() === email &&
        user.id !== currentId
    );

    if (emailExists) {
        alert("Este correo ya está registrado.");
        emailInput.focus();
        return false;
    }

    return true;
}

// ======================================
// MOSTRAR USUARIOS EN LA TABLA
// ======================================

function renderUsers() {
    userTable.replaceChildren();

    const search = searchInput.value.toLowerCase().trim();

    const filteredUsers = users.filter(user =>
        String(user.name || "").toLowerCase().includes(search) ||
        String(user.email || "").toLowerCase().includes(search) ||
        String(user.phone || "").toLowerCase().includes(search)
    );

    // Actualizar total de usuarios registrados
    totalUsers.textContent = users.length;

    // Actualizar contador de resultados
    filteredCount.textContent =
        `Mostrando ${filteredUsers.length} de ${users.length} usuarios`;

    // Mostrar mensaje cuando no hay resultados
    emptyMessage.hidden = filteredUsers.length > 0;

    if (users.length === 0) {
        emptyMessage.textContent = "No hay usuarios registrados.";
    } else {
        emptyMessage.textContent = "No se encontraron usuarios.";
    }

    filteredUsers.forEach(user => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = user.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;

        const phoneCell = document.createElement("td");
        phoneCell.textContent = user.phone;

        // Columna: fecha de registro
        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(user.createdAt);

        const actionsCell = document.createElement("td");

        // Botón editar
        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            editUser(user.id);
        });

        // Botón eliminar
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteUser(user.id);
        });

        actionsCell.append(editButton, deleteButton);

        row.append(
            nameCell,
            emailCell,
            phoneCell,
            dateCell,
            actionsCell
        );

        userTable.appendChild(row);
    });
}

// ======================================
// REGISTRAR O ACTUALIZAR USUARIO
// ======================================

userForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();

    const currentId = userIdInput.value;

    // Verificar que el usuario que se edita exista
    if (currentId) {
        const userExists = users.some(user => user.id === currentId);

        if (!userExists) {
            alert("No se encontró el usuario que deseas editar.");
            resetForm();
            renderUsers();
            return;
        }
    }

    // Ejecutar todas las validaciones
    if (!validateUser(name, email, phone, currentId)) {
        return;
    }

    if (currentId) {

        // UPDATE: actualizar usuario
        const userIndex = users.findIndex(
            user => user.id === currentId
        );

        if (userIndex === -1) {
            alert("No se pudo encontrar el usuario.");
            return;
        }

        users[userIndex] = {
            ...users[userIndex],
            name,
            email,
            phone
        };

        alert("Usuario actualizado correctamente.");

    } else {

        // CREATE: registrar usuario
        const newUser = {
            id: crypto.randomUUID(),
            name,
            email,
            phone,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        alert("Usuario registrado correctamente.");
    }

    saveUsers();
    resetForm();
    renderUsers();
});

// ======================================
// PREPARAR FORMULARIO PARA EDITAR
// ======================================

function editUser(id) {
    const user = users.find(user => user.id === id);

    if (!user) {
        alert("No se encontró el usuario.");
        return;
    }

    userIdInput.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    phoneInput.value = user.phone;

    formTitle.textContent = "Editar usuario";
    submitButton.textContent = "Guardar cambios";
    cancelButton.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

feature/validate-user-input
// ======================================
// ELIMINAR USUARIO
// ======================================

function deleteUser(id) {

=======

// Eliminar usuario con validación
function deleteUser(id) {
dev
    // Verificar que el usuario exista
    const userExists = users.some(user => user.id === id);

    if (!userExists) {
        alert("No se encontró el usuario que deseas eliminar.");
        renderUsers();
        return;
    }

    // Solicitar confirmación
    const confirmation = confirm(
        "¿Estás seguro de que deseas eliminar este usuario?"
    );

    if (!confirmation) {
        return;
    }

    // Eliminar únicamente el usuario seleccionado
    users = users.filter(user => user.id !== id);

feature/validate-user-input
    // Guardar cambios
=======
    // Actualizar LocalStorage
dev
    saveUsers();

    // Limpiar formulario si se estaba editando ese usuario
    if (userIdInput.value === id) {
        resetForm();
    }

    // Actualizar tabla y contadores
    renderUsers();

    alert("Usuario eliminado correctamente.");
}

feature/validate-user-input
// ======================================
// LIMPIAR FORMULARIO
// ======================================

=======

// Limpiar formulario
dev
function resetForm() {
    userForm.reset();
    userIdInput.value = "";

    formTitle.textContent = "Registrar nuevo usuario";
    submitButton.textContent = "Registrar usuario";
    cancelButton.hidden = true;
}

// Cancelar edición
cancelButton.addEventListener("click", resetForm);

// Buscar usuarios
searchInput.addEventListener("input", renderUsers);

// Mostrar usuarios al iniciar
renderUsers();

