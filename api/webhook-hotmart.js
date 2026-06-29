// api/webhook-hotmart.js
// Recibe la notificación de compra de Hotmart, genera una contraseña única
// para el comprador, la guarda en la base de datos, y le envía el acceso por correo.

const crypto = require('crypto');
const { query } = require('./_db');

// Genera una contraseña legible y corta, ej: "RAFAEL-7K2P"
function generarPassword() {
  const codigo = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SANACION-${codigo}`;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = req.body;

    // Hotmart envía el estado de la compra y los datos del comprador.
    // Validamos que sea una compra aprobada antes de dar acceso.
    const status = payload?.data?.purchase?.status;
    const email = payload?.data?.buyer?.email;
    const transactionId = payload?.data?.purchase?.transaction;

    if (status !== 'APPROVED' && status !== 'COMPLETE') {
      return res.status(200).json({ message: 'Evento recibido, sin acción (no aprobado aún)' });
    }

    if (!email) {
      return res.status(400).json({ error: 'No se recibió el correo del comprador' });
    }

    // Revisamos si ya existe (evita duplicados si Hotmart reenvía el webhook)
    const existente = await query('SELECT id FROM compradores WHERE email = $1', [email]);

    if (existente.rows.length > 0) {
      return res.status(200).json({ message: 'Comprador ya registrado previamente' });
    }

    const passwordPlano = generarPassword();
    const passwordHash = hashPassword(passwordPlano);

    await query(
      `INSERT INTO compradores (email, password_hash, santo_id, hotmart_transaction)
       VALUES ($1, $2, $3, $4)`,
      [email, passwordHash, 'san-rafael', transactionId]
    );

    // Envío de correo con el acceso.
    // Usamos la misma lógica que ya tienes en Santuario Divino para envío de correos
    // (reemplazar con tu proveedor real: Resend, SendGrid, o el que ya configuraste).
    await enviarCorreoAcceso(email, passwordPlano);

    return res.status(200).json({ message: 'Comprador registrado y notificado' });
  } catch (error) {
    console.error('Error en webhook-hotmart:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

async function enviarCorreoAcceso(email, password) {
  // TODO: conectar con tu proveedor de correo real (Resend recomendado, igual a Hotmart->Resend si ya lo usas)
  // Ejemplo con Resend:
  /*
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Sanación Divina <no-responder@sanaciondivina.app>',
    to: email,
    subject: 'Tu acceso a la Novena de Sanación está listo 🕊️',
    html: `
      <h2>¡Bienvenido a tu Novena a San Rafael Arcángel!</h2>
      <p>Tu acceso ya está listo. Usa estos datos para entrar:</p>
      <p><strong>Correo:</strong> ${email}<br/>
      <strong>Contraseña:</strong> ${password}</p>
      <p><a href="https://sanaciondivina-app.vercel.app/login.html">Entrar a mi novena</a></p>
    `
  });
  */
  console.log(`[correo simulado] Enviar a ${email} con contraseña ${password}`);
}
