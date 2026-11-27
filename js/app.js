
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

// Mostrar usuarios en la tabla
function renderUsers() {
    userTable.replaceChildren();

    const search = searchInput.value.toLowerCase().trim();

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone.toLowerCase().includes(search)
    );

    totalUsers.textContent = users.length;

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

        const actionsCell = document.createElement("td");

        // Boton editar
        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            editUser(user.id);
        });

        // Boton eliminar
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
            actionsCell
        );

        userTable.appendChild(row);
    });
}

// Registrar o actualizar usuario
userForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();

    // Validar nombre
    if (name.length < 3) {
        alert("El nombre debe tener al menos 3 caracteres.");
        return;
    }

    // Validar correo
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Introduce un correo electrónico válido.");
        return;
    }

    // Validar teléfono
    const phonePattern = /^[0-9+\-\s()]{7,20}$/;

    if (!phonePattern.test(phone)) {
        alert("Introduce un teléfono válido.");
        return;
    }

    const currentId = userIdInput.value;

    // Evitar correos duplicados
    const emailExists = users.some(user =>
        user.email === email && user.id !== currentId
    );

    if (emailExists) {
        alert("Este correo ya está registrado.");
        return;
    }

    if (currentId) {
        // UPDATE: actualizar usuario
        const userIndex = users.findIndex(
            user => user.id === currentId
        );

        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                name,
                email,
                phone
            };

            alert("Usuario actualizado correctamente.");
        }

    } else {
        // CREATE: registrar usuario
        const newUser = {
            id: crypto.randomUUID(),
            name,
            email,
            phone
        };

        users.push(newUser);

        alert("Usuario registrado correctamente.");
    }

    saveUsers();
    resetForm();
    renderUsers();
});

// Preparar formulario para editar
function editUser(id) {
    const user = users.find(user => user.id === id);

    if (!user) return;

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

// Eliminar usuario
function deleteUser(id) {
    const confirmation = confirm(
        "¿Estás seguro de que deseas eliminar este usuario?"
    );

    if (!confirmation) return;

    users = users.filter(user => user.id !== id);

    saveUsers();
    resetForm();
    renderUsers();

    alert("Usuario eliminado correctamente.");
}

// Limpiar formulario
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

// Mostrar los usuarios al iniciar
renderUsers();
