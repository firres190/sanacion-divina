// api/marcar-completado.js
const crypto = require('crypto');
const { query } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { sessionToken, dia } = req.body;

    if (!sessionToken || !dia) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Buscamos al comprador cuyo token de sesión coincide.
    // Como el token se genera con email+id+secreto, recorremos los compradores
    // activos y comparamos (en una base con pocos usuarios esto es instantáneo;
    // si crece mucho, conviene guardar el token directamente en la tabla).
    const resultado = await query('SELECT * FROM compradores WHERE activo = true');

    const comprador = resultado.rows.find((c) => {
      const tokenEsperado = crypto
        .createHash('sha256')
        .update(`${c.email}-${c.id}-${process.env.SESSION_SECRET}`)
        .digest('hex');
      return tokenEsperado === sessionToken;
    });

    if (!comprador) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    const diasCompletados = new Set(comprador.dias_completados || []);
    diasCompletados.add(dia);

    await query(
      'UPDATE compradores SET dias_completados = $1 WHERE id = $2',
      [Array.from(diasCompletados), comprador.id]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en marcar-completado:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
