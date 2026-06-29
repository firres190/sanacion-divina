// js/perfil.js
// Lógica compartida del menú de perfil (ícono + modal) usada en todas las pantallas principales.

const ICONO_PERFIL_DEFECTO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';

function obtenerInicialNombre() {
  const nombre = localStorage.getItem('sd_nombre') || '';
  if (nombre.trim()) return nombre.trim().charAt(0).toUpperCase();
  const email = localStorage.getItem('sd_email') || '';
  return email.charAt(0).toUpperCase() || '?';
}

function htmlBotonPerfil() {
  if (!localStorage.getItem('sd_session')) return '';
  return `
    <button class="boton-perfil" onclick="abrirModalPerfil()" aria-label="Mi perfil">
      ${obtenerInicialNombre()}
    </button>`;
}

function htmlModalPerfil() {
  return `
    <div class="modal-perfil" id="modalPerfil">
      <div class="hoja-perfil">
        <div class="avatar-perfil" id="avatarPerfilModal"></div>
        <div class="campo-formulario">
          <label for="nombrePerfil">Tu nombre</label>
          <input type="text" id="nombrePerfil" placeholder="¿Cómo te llamas?" maxlength="60">
        </div>
        <div style="font-size:12.5px;color:var(--texto-suave);margin-bottom:18px;" id="correoPerfilModal"></div>
        <button class="boton-primario" onclick="guardarNombrePerfil()">Guardar nombre</button>
        <button class="boton-accion" style="width:100%;margin-top:10px;flex-direction:row;justify-content:center;gap:8px;" onclick="cerrarSesionPerfil()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
          Cerrar sesión
        </button>
        <p style="text-align:center;margin-top:16px;">
          <a href="#" onclick="cerrarModalPerfil();return false;" style="color:var(--texto-suave);font-size:13px;">Cancelar</a>
        </p>
      </div>
    </div>`;
}

function inyectarPerfilEnPagina() {
  document.body.insertAdjacentHTML('beforeend', htmlModalPerfil());
}

function abrirModalPerfil() {
  document.getElementById('avatarPerfilModal').textContent = obtenerInicialNombre();
  document.getElementById('nombrePerfil').value = localStorage.getItem('sd_nombre') || '';
  document.getElementById('correoPerfilModal').textContent = localStorage.getItem('sd_email') || '';
  document.getElementById('modalPerfil').classList.add('visible');
}

function cerrarModalPerfil() {
  document.getElementById('modalPerfil').classList.remove('visible');
}

async function guardarNombrePerfil() {
  const nombre = document.getElementById('nombrePerfil').value.trim();
  const token = localStorage.getItem('sd_session');

  try {
    await fetch('/api/actualizar-perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: token, nombre })
    });
    localStorage.setItem('sd_nombre', nombre);
    cerrarModalPerfil();
    const boton = document.querySelector('.boton-perfil');
    if (boton) boton.textContent = obtenerInicialNombre();
  } catch (e) {
    alert('No pudimos guardar tu nombre. Intenta de nuevo.');
  }
}

function cerrarSesionPerfil() {
  localStorage.removeItem('sd_session');
  localStorage.removeItem('sd_email');
  localStorage.removeItem('sd_nombre');
  localStorage.removeItem('sd_santo');
  localStorage.removeItem('sd_dia_desbloqueado');
  localStorage.removeItem('sd_dias_completados');
  window.location.href = 'index.html';
}
