// api/notificar-proximamente.js
const { query } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, santo } = req.body;

    if (!email || !santo) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    await query(
      'INSERT INTO notificaciones_pendientes (email, santo_id) VALUES ($1, $2)',
      [email.trim().toLowerCase(), santo]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en notificar-proximamente:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
